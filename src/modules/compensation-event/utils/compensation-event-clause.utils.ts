import { type ProjectAlert, parseAlertCompensationEvent } from '@/hooks/modules/project-alerts';
import { COMPENSATION_EVENT_CLAUSE_CHIP } from '../constants/compensation-event.constants';
import { resolveClauseSummary } from './compensation-event-overview.utils';
import { getAlertQuotationReference } from './compensation-event-quotation-alert.utils';

const { prefix, separator, detailSeparator, maxLabelClauses, maxTooltipLines, moreSuffix } =
  COMPENSATION_EVENT_CLAUSE_CHIP;

// What a workflow header prints beside its title — the clause numbers the record actually
// names, with the clause itself on hover.
export interface ClauseChip {
  // Absent when the record names no clause number; the header then shows the icon alone.
  label?: string;
  // One row per clause the chip stands for, e.g. "CE-004 – Cost, time and programme impact".
  lines: string[];
}

// Every clause-carrying record in the flow — the CE itself, the extractor's read of a
// signal, the EW hand-off — reduced to the fields the chip needs.
export interface ClauseChipSource {
  reference?: string | null;
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
  clauses?: Array<string | null | undefined> | null;
  additionalClauses?: Array<string | null | undefined> | null;
}

// Catalogue entries read "60.1(1) - PM changes Works Information"; only the head identifies
// the clause, and the extractor writes the same shape with an en or em dash.
const CLAUSE_LABEL_SEPARATOR_RE = /\s[-–—]\s/;

// "Cl. 62", "Clause 62" — the chip prints its own prefix, so the record's is dropped.
const CLAUSE_PREFIX_RE = /^(?:clauses?|cl\.?)\s*/i;

// What counts as a clause number: "60", "61.3", "60.1(12)". Anything else is prose the
// chip must not pass off as a reference.
const CLAUSE_NUMBER_RE = /^\d{1,3}(?:\.\d+)*(?:\(\d+[a-z]?\))?$/i;

export const toClauseNumber = (value?: string | null): string | undefined => {
  const head = (value ?? '').split(CLAUSE_LABEL_SEPARATOR_RE)[0] ?? '';
  const number = head
    .replace(CLAUSE_PREFIX_RE, '')
    .replace(/\s+/g, '')
    .replace(/[.,;:]+$/, '');

  return CLAUSE_NUMBER_RE.test(number) ? number : undefined;
};

// "60.1(12)" sorts after "60.1(2)" and "61.3" after "60" — segment by segment, numerically,
// so the chip reads in clause order rather than in the order the records happened to load.
const clauseSegments = (clause: string): number[] =>
  clause.split(/[.()]/).filter(Boolean).map(Number);

export const compareClauseNumbers = (left: string, right: string): number => {
  const a = clauseSegments(left);
  const b = clauseSegments(right);

  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? -1) - (b[index] ?? -1);
    if (difference) return difference;
  }

  return 0;
};

// Primary clause first, then whatever extras the record cites — deduped, since the API's
// `clauses` list already repeats the primary one.
export const toClauseNumbers = (source: ClauseChipSource): string[] => {
  const numbers = [
    source.clauseNumber,
    source.clauseDescription,
    source.clauseTitle,
    ...(source.clauses ?? []),
    ...(source.additionalClauses ?? []),
  ]
    .map(toClauseNumber)
    .filter((number): number is string => !!number);

  return [...new Set(numbers)];
};

const toClauseLabel = (numbers: string[]): string | undefined => {
  if (!numbers.length) return undefined;

  const shown = numbers.slice(0, maxLabelClauses);
  const hidden = numbers.length - shown.length;

  return `${prefix}${shown.join(separator)}${hidden ? `${moreSuffix}${hidden}` : ''}`;
};

// The clause in words: the record's own description, else its title. The hover is the only
// place the clause is spelled out — the chip prints the number alone — so the description
// is taken as the record states it, echo of the title included. `resolveClauseSummary`
// blanks an echoing description because the Overview panel prints it under a heading that
// already says the number and title; here there is no such heading to repeat.
const toClauseDetail = (source: ClauseChipSource): string => {
  const summary = resolveClauseSummary({
    clauseNumber: source.clauseNumber ?? undefined,
    clauseTitle: source.clauseTitle ?? undefined,
    clauseDescription: source.clauseDescription ?? undefined,
  });

  return source.clauseDescription?.trim() || summary.description || summary.title;
};

// One record's chip — the numbers it cites, and "<reference> – <clause>" on hover. Returns
// undefined when the record names neither, so the header drops the chip instead of
// printing an empty one.
export const resolveClauseChip = (source?: ClauseChipSource | null): ClauseChip | undefined => {
  if (!source) return undefined;

  const label = toClauseLabel(toClauseNumbers(source));
  const detail = toClauseDetail(source);
  if (!label && !detail) return undefined;

  const line = [source.reference?.trim(), detail].filter(Boolean).join(detailSeparator);

  return { label, lines: line ? [line] : [] };
};

// The register's chip stands for every clause its events sit under, so the tooltip lists
// them rather than naming one event — "CL.60.1(12) – PM changes Works Information".
export const resolveRegisterClauseChip = (
  events: ClauseChipSource[] = []
): ClauseChip | undefined => {
  const details = new Map<string, string>();

  for (const event of events) {
    const detail = toClauseDetail(event);
    const primary = toClauseNumber(event.clauseNumber);

    for (const number of toClauseNumbers(event)) {
      // Only the primary clause owns the record's wording; an extra the notice merely
      // cited alongside it goes in by number.
      const own = number === primary ? detail : '';
      if (!details.get(number)) details.set(number, own);
    }
  }

  const numbers = [...details.keys()].sort(compareClauseNumbers);
  const label = toClauseLabel(numbers);
  if (!label) return undefined;

  const shown = numbers.slice(0, maxTooltipLines);
  const hidden = numbers.length - shown.length;
  const lines = shown.map((number) =>
    [`${prefix}${number}`, details.get(number)].filter(Boolean).join(detailSeparator)
  );

  return { label, lines: hidden ? [...lines, `${moreSuffix}${hidden}`] : lines };
};

// A signal's own clause read: the extracted CE names the clause outright, and the sentence
// Auspira wrote about it on the alert is the fallback when the extractor filled in neither.
export const toAlertClauseSource = (alert?: ProjectAlert | null): ClauseChipSource | undefined => {
  if (!alert) return undefined;

  const event = parseAlertCompensationEvent(alert.compensationEvent);

  return {
    reference: getAlertQuotationReference(alert) || undefined,
    clauseNumber: event?.clauseNumber || alert.clauseNumber || undefined,
    clauseTitle: event?.clauseTitle || alert.clauseTitle || undefined,
    clauseDescription: event?.clauseDescription || alert.clauseDescription,
  };
};

export const resolveAlertClauseChip = (alert?: ProjectAlert | null): ClauseChip | undefined =>
  resolveClauseChip(toAlertClauseSource(alert));
