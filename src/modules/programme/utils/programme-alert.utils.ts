import dayjs from 'dayjs';
import {
  PROGRAMME_CLIENT_OBLIGATIONS_COPY,
  PROGRAMME_EXTRACT_COPY,
  PROGRAMME_PM_VIEW_COPY,
  PROGRAMME_SECTIONAL_STATUS_VIEW,
  PROGRAMME_VARIANCE_COPY,
} from '../constants/programme.constants';
import type {
  ClientObligationGroup,
  ContractDateTile,
  ExtractedField,
  HealthCheckFlag,
  PmViewKeyDate,
  ProgrammeAiHealthCheckDto,
  ProgrammeComparisonView,
  ProgrammeExtractDto,
  ProgrammeHealthCheckView,
  ProgrammeObligationsDto,
  SectionalCompletionRow,
  SectionalCompletionStatus,
  VarianceTabProps,
} from '../types/programme.types';

// Mapping layer between the alert the backend serves and the tab view models. Every function
// here is pure: the detail container owns the fetching, the tabs own the rendering.
//
// The alert hands the programme over as a JSON-encoded string on the `programme` key, the same
// bytes a stored record keeps in its `json` column — so `toProgrammeExtract` is the single way
// in, and everything else reads that object.

// Displayed format for the tabs — the register's own `DD MMM YYYY`, so a date reads the same
// wherever it appears on the module.
const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';

// The extractor sends '' for the values it could not read, so blank and whitespace-only strings
// are treated as absent throughout this file.
const text = (value?: string | null): string => (value ?? '').trim();

/** An ISO (or free-text) date in the display format; '' when the field carries nothing. */
const formatDate = (value?: string | null): string => {
  const raw = text(value);
  if (!raw) return '';
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed.format(DISPLAY_DATE_FORMAT) : raw;
};

// Strip the control characters (stray DEL / C1 bytes) the extractor leaves in some names.
// Filtered by code point rather than by regex, so the source carries no raw control bytes.
const isPrintable = (character: string): boolean => {
  const code = character.charCodeAt(0);
  return code > 0x1f && (code < 0x7f || code > 0x9f);
};

const cleanLabel = (value?: string | null): string =>
  Array.from(text(value)).filter(isPrintable).join('');

/** The programme extract, from either the alert's JSON-encoded string or the record's `json`. */
export const toProgrammeExtract = (value: unknown): ProgrammeExtractDto | null => {
  if (typeof value === 'string') {
    try {
      return toProgrammeExtract(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  return value as ProgrammeExtractDto;
};

/** "PRG-004 — Rev 3" from a stored record, or "Extracted from Rev 04" off the raw extract. */
export const toProgrammeRevisionLabel = (
  record?: { reference?: string | null; version?: number | string | null } | null,
  extract?: ProgrammeExtractDto | null
): string => {
  if (record) {
    const reference = text(record.reference) || PROGRAMME_EXTRACT_COPY.revisionRecordFallback;
    const version =
      record.version === null || record.version === undefined ? '' : `${record.version}`;
    return version ? `${reference} — Rev ${version}` : reference;
  }

  const revision = cleanLabel(extract?.revision);
  if (revision) {
    return `${PROGRAMME_EXTRACT_COPY.revisionPrefix} ${/^rev\b/i.test(revision) ? revision : `Rev ${revision}`}`;
  }

  const name = cleanLabel(extract?.programmeName);
  return name
    ? `${PROGRAMME_EXTRACT_COPY.revisionPrefix} ${name}`
    : PROGRAMME_EXTRACT_COPY.revisionFallback;
};

// The comparison is only meaningful once the backend has a baseline to measure against, so a
// disabled one yields null rather than a zeroed summary — a delta of 0 against nothing is not
// a clean position.
export const toProgrammeComparison = (
  extract?: ProgrammeExtractDto | null
): ProgrammeComparisonView | null => {
  const comparison = extract?.comparison;
  if (!comparison?.enabled) return null;

  const change = comparison.changeSummary;
  const number = (value?: number | null): number => (Number.isFinite(value) ? Number(value) : 0);

  return {
    completionDeltaDays: number(change?.completionDeltaDays),
    criticalPathDelta: number(change?.criticalPathDelta),
    activitiesAdded: number(change?.activitiesAdded),
    activitiesRemoved: number(change?.activitiesRemoved),
    activitiesMoved: number(change?.activitiesMoved),
    baselinePlannedCompletion: text(comparison.baseline?.plannedCompletion),
  };
};

// The four scalar key dates on `keyDatesAndMilestones` — what the "Key dates" row counts. The
// sectional dates are counted by the row beneath it.
const KEY_DATE_FIELDS = [
  'startingDate',
  'contractAwardSubmissionDate',
  'accessDate',
  'plannedCompletion',
] as const;

// The Contractor's own forecast for this revision — the key-dates copy is authoritative, with
// the overview standing in when the extract only filled one of them.
const plannedCompletionOf = (extract?: ProgrammeExtractDto | null): string =>
  text(extract?.keyDatesAndMilestones?.plannedCompletion) ||
  text(extract?.overview?.plannedCompletion);

// The contract-side completion the revision is measured against: the date its variance
// assessment read it against, with the accepted baseline's own completion standing in when the
// revision predates an assessment. Not the Contractor's forecast above — the plan can slip off
// a contract date that has not moved, so the two are separate figures on separate rows.
const contractCompletionOf = (extract?: ProgrammeExtractDto | null): string =>
  text(extract?.variance?.dates?.completionDate) ||
  toProgrammeComparison(extract)?.baselinePlannedCompletion ||
  '';

// The "Extracted from Rev N" table. Every row is derived from the extract itself: the key dates
// that are filled in, the sectional dates that are dated, the contract-side completion the
// variance assessment names, the Contractor's own planned completion, and what the activities
// are doing.
export const toExtractedFields = (extract?: ProgrammeExtractDto | null): ExtractedField[] => {
  const keyDates = extract?.keyDatesAndMilestones;
  const present = KEY_DATE_FIELDS.filter((field) => !!text(keyDates?.[field])).length;
  // Counted off the sectional rows themselves rather than their length: a section the revision
  // names without dating it is a gap, not a dated one.
  const sectionalRows = toSectionalCompletions(extract);
  const sections = sectionalRows.length;
  const datedSections = countDatedSections(sectionalRows);
  const completion = contractCompletionOf(extract);
  const planned = plannedCompletionOf(extract);
  const activities = extract?.overview?.activities;
  const rows = PROGRAMME_EXTRACT_COPY.rows;

  return [
    {
      title: rows.keyDates,
      valueFound: `${present} of ${KEY_DATE_FIELDS.length} present`,
      status: present === 0 ? 'missing' : present === KEY_DATE_FIELDS.length ? 'high' : 'review',
    },
    {
      title: rows.sectionalCompletionDates,
      valueFound: `${datedSections} of ${sections} sections dated`,
      status: sections === 0 ? 'missing' : datedSections === sections ? 'high' : 'review',
    },
    {
      title: rows.completionDate,
      valueFound: formatDate(completion) || PROGRAMME_EXTRACT_COPY.emptyValue,
      status: completion ? 'high' : 'missing',
    },
    {
      title: rows.plannedCompletion,
      valueFound: formatDate(planned) || PROGRAMME_EXTRACT_COPY.emptyValue,
      status: planned ? 'high' : 'missing',
    },
    {
      title: rows.activities,
      valueFound: cleanLabel(activities?.description) || PROGRAMME_EXTRACT_COPY.emptyValue,
      status: activities?.count ? 'high' : 'missing',
    },
  ];
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

/** First non-blank string among `keys` — the tolerant read for a field the backend has not pinned. */
const readText = (source: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

// The extract's own schedule health findings, title-cased and with the activities they cite —
// the references used to be dropped on the floor.
const toExtractHealthFlags = (extract?: ProgrammeExtractDto | null): HealthCheckFlag[] =>
  (extract?.programmeHealth ?? [])
    .map((finding) => {
      const severity = cleanLabel(finding?.severity);
      const references = (finding?.references ?? []).filter((reference) => !!text(reference));
      const description = cleanLabel(finding?.description);
      const note = references.length
        ? `${description} ${PROGRAMME_EXTRACT_COPY.referencesLabel}: ${references.join(', ')}`
        : description;

      return {
        category: PROGRAMME_EXTRACT_COPY.severityLabels[severity.toLowerCase()] ?? severity,
        finding: cleanLabel(finding?.title),
        note: note || undefined,
      };
    })
    .filter((flag) => !!flag.finding);

// `aiProgrammeHealthCheck.checks` has no published shape yet (the live payload returns an empty
// array), so each entry is read off the field names a finding is most likely to carry. Narrow
// this to a DTO once Swagger describes the item.
const toHealthCheckFlag = (check: unknown): HealthCheckFlag => {
  const source = asRecord(check);
  return {
    category:
      readText(source, 'category', 'severity') || PROGRAMME_EXTRACT_COPY.healthCategoryFallback,
    finding: readText(source, 'finding', 'title'),
    note: readText(source, 'note', 'description') || undefined,
  };
};

// The AI health check card. The alert's `aiProgrammeHealthCheck` drives it when present, then
// the same object inside the extract, and the extract's own schedule health findings stand in
// when neither carries checks.
export const toHealthCheck = (
  aiHealthCheck?: ProgrammeAiHealthCheckDto | null,
  extract?: ProgrammeExtractDto | null
): ProgrammeHealthCheckView => {
  const source = aiHealthCheck ?? extract?.aiProgrammeHealthCheck;
  const checks = (source?.checks ?? []).map(toHealthCheckFlag).filter((flag) => !!flag.finding);
  const flags = checks.length > 0 ? checks : toExtractHealthFlags(extract);
  const declared = typeof source?.flagCount === 'number' ? source.flagCount : undefined;

  return {
    title: cleanLabel(source?.title) || PROGRAMME_EXTRACT_COPY.healthCheckTitle,
    flagCount: declared ?? flags.length,
    flags,
  };
};

// The contract-date tiles — every contract-side date the extract carries a value for, in reading
// order. The data date is deliberately not one of them: it is the progress point the schedule was
// worked to, not a date the contract fixes, and it already shows on Extract & Check.
export const toPmViewContractDates = (extract?: ProgrammeExtractDto | null): ContractDateTile[] => {
  const keyDates = extract?.keyDatesAndMilestones;
  const labels = PROGRAMME_PM_VIEW_COPY.contractDates;
  const captions = PROGRAMME_PM_VIEW_COPY.contractDateCaptions;

  const candidates: { label: string; value?: string | null; caption: string }[] = [
    {
      label: labels.completionDate,
      value: toProgrammeComparison(extract)?.baselinePlannedCompletion,
      caption: captions.completionDate,
    },
    {
      label: labels.plannedCompletion,
      value: plannedCompletionOf(extract),
      caption: captions.plannedCompletion,
    },
    { label: labels.startingDate, value: keyDates?.startingDate, caption: captions.startingDate },
    { label: labels.accessDate, value: keyDates?.accessDate, caption: captions.accessDate },
    {
      label: labels.contractAwardSubmissionDate,
      value: keyDates?.contractAwardSubmissionDate,
      caption: captions.contractAwardSubmissionDate,
    },
  ];

  return candidates.flatMap(({ label, value, caption }) => {
    const date = formatDate(value);
    return date ? [{ label, date, caption }] : [];
  });
};

// The key dates table — straight off `keyDatesAndMilestones.sectionalKeyDates`, read the same way
// as the sectional table below it. The extract carries no status per milestone, so each row's own
// status is whether the revision dated it at all: that is the gap the table can actually report.
export const toPmViewKeyDates = (extract?: ProgrammeExtractDto | null): PmViewKeyDate[] =>
  (extract?.keyDatesAndMilestones?.sectionalKeyDates ?? []).map((keyDate) => {
    const date = formatDate(keyDate?.date);
    return {
      label: cleanLabel(keyDate?.name),
      reference: cleanLabel(keyDate?.reference),
      date,
      dated: !!date,
    };
  });

// The section's own status as the extract sends it, mapped to the pill the table renders. A
// value with no mapping still shows — title-cased, on the neutral tone — so a status the
// backend adds later is never dropped on the floor.
const titleCase = (value: string): string =>
  value.replace(/\b\w/g, (character) => character.toUpperCase());

const toSectionalStatus = (value?: string | null): SectionalCompletionStatus | undefined => {
  const status = cleanLabel(value).toLowerCase();
  if (!status) return undefined;
  return PROGRAMME_SECTIONAL_STATUS_VIEW[status] ?? { label: titleCase(status), tone: 'neutral' };
};

// The Sectional Completions table — straight off `keyDatesAndMilestones.sectionalKeyDates`. The
// Status column reads the backend's own per-section status; `dated` still drives the card's
// "n of m dated" count and the empty completion-date cell.
export const toSectionalCompletions = (
  extract?: ProgrammeExtractDto | null
): SectionalCompletionRow[] =>
  (extract?.keyDatesAndMilestones?.sectionalKeyDates ?? []).map((keyDate) => {
    const completionDate = formatDate(keyDate?.date);
    return {
      section: cleanLabel(keyDate?.name),
      reference: cleanLabel(keyDate?.reference),
      completionDate,
      dated: !!completionDate,
      status: toSectionalStatus(keyDate?.status),
    };
  });

/** How many sections the revision actually dates — the count on the card's heading. */
export const countDatedSections = (rows: SectionalCompletionRow[]): number =>
  rows.filter((row) => row.dated).length;

// The float after completion is named as its own activity on the critical path, so the figure
// and the activity it rests on both come off `criticalPath`.
const TERMINAL_FLOAT_ACTIVITY = /terminal\s*float/i;

/** `+14` / `-3` / `0` — the sign is what tints the variance cell. */
const signedDays = (days: number): string => `${days > 0 ? '+' : ''}${days} days`;

const finiteNumber = (value?: number | null): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/** The whole Variance tab, built from the submitted programme. */
export const toVarianceView = (extract?: ProgrammeExtractDto | null): VarianceTabProps => {
  const assessment = extract?.variance;
  const comparison = toProgrammeComparison(extract);
  const baseline = contractCompletionOf(extract);
  const planned = text(assessment?.dates?.plannedCompletion) || plannedCompletionOf(extract);

  const assessmentDelta = finiteNumber(assessment?.dates?.variance?.days);
  const comparisonDelta = comparison?.completionDeltaDays ?? 0;
  const delta = assessmentDelta ?? comparisonDelta;
  const direction =
    delta === 0 || (assessmentDelta === null && !comparison)
      ? undefined
      : delta > 0
        ? ('behind' as const)
        : ('ahead' as const);

  const assessmentVariance = text(assessment?.dates?.variance?.display);
  const varianceValue =
    assessmentVariance || (comparison || assessmentDelta !== null ? signedDays(delta) : '');

  const criticalFloat = (extract?.criticalPath ?? []).find((activity) =>
    TERMINAL_FLOAT_ACTIVITY.test(activity?.activityName ?? '')
  );
  const criticalFloatDays = Number.isFinite(criticalFloat?.totalFloatDays)
    ? Number(criticalFloat?.totalFloatDays)
    : null;
  const floatDays = finiteNumber(assessment?.terminalFloat?.days) ?? criticalFloatDays;
  const assessmentFloatNote = text(assessment?.terminalFloat?.note);
  const floatNote =
    assessmentFloatNote ||
    (criticalFloat && criticalFloatDays !== null
      ? `${PROGRAMME_VARIANCE_COPY.floatBasis} '${cleanLabel(criticalFloat.activityName)}' (${PROGRAMME_VARIANCE_COPY.finishLabel} ${formatDate(criticalFloat.finishDate)}).`
      : PROGRAMME_VARIANCE_COPY.noFloatNote);
  const assessmentFloatTitle = text(assessment?.terminalFloat?.display);
  const terminalFloatTitle =
    assessmentFloatTitle ||
    (floatDays !== null
      ? `${PROGRAMME_VARIANCE_COPY.terminalFloatLabel} — ${floatDays.toFixed(1)} day(s)`
      : PROGRAMME_VARIANCE_COPY.terminalFloatLabel);

  const changeNotes = PROGRAMME_VARIANCE_COPY.changeNotes;
  const notes = comparison
    ? [
        {
          label: changeNotes.completionChange,
          value: signedDays(comparison.completionDeltaDays),
          caption: PROGRAMME_VARIANCE_COPY.changeNoteCaption,
        },
        {
          label: changeNotes.criticalPathChange,
          value: signedDays(comparison.criticalPathDelta),
          caption: PROGRAMME_VARIANCE_COPY.changeNoteCaption,
        },
        {
          label: changeNotes.activitiesAdded,
          value: String(comparison.activitiesAdded),
          caption: PROGRAMME_VARIANCE_COPY.changeNoteCaption,
        },
        {
          label: changeNotes.activitiesRemoved,
          value: String(comparison.activitiesRemoved),
          caption: PROGRAMME_VARIANCE_COPY.changeNoteCaption,
        },
        {
          label: changeNotes.activitiesMoved,
          value: String(comparison.activitiesMoved),
          caption: PROGRAMME_VARIANCE_COPY.changeNoteCaption,
        },
      ]
    : [];

  return {
    direction,
    dates: [
      {
        label: PROGRAMME_VARIANCE_COPY.dates.completionDate,
        value: formatDate(baseline) || PROGRAMME_EXTRACT_COPY.emptyValue,
      },
      {
        label: PROGRAMME_VARIANCE_COPY.dates.plannedCompletion,
        value: formatDate(planned) || PROGRAMME_EXTRACT_COPY.emptyValue,
      },
      {
        label: PROGRAMME_VARIANCE_COPY.dates.variance,
        value: varianceValue || PROGRAMME_EXTRACT_COPY.emptyValue,
        // Tinted only when a baseline measured a side; an uncompared programme stays plain.
        tone: direction === 'ahead' ? 'positive' : direction === 'behind' ? 'negative' : undefined,
      },
    ],
    terminalFloatTitle,
    terminalFloatNote: floatNote,
    notes,
  };
};

/** The Client Obligations tab's groups — one per `obligations.sections` entry that has rows. */
export const toClientObligationGroups = (
  obligations?: ProgrammeObligationsDto | null
): ClientObligationGroup[] =>
  (obligations?.sections ?? [])
    .map((section) => ({
      section: cleanLabel(section?.title) || PROGRAMME_CLIENT_OBLIGATIONS_COPY.untitledSection,
      rows: (section?.obligations ?? []).map((obligation) => ({
        description: cleanLabel(obligation?.description),
        clauseNumber: cleanLabel(obligation?.clauseNumber),
        owner: cleanLabel(obligation?.owner),
        dueDate: cleanLabel(obligation?.dueDate),
      })),
    }))
    .filter((group) => group.rows.length > 0);

/** Total rows across the groups — the count on the Client Obligations card. */
export const countClientObligations = (groups: ClientObligationGroup[]): number =>
  groups.reduce((total, group) => total + group.rows.length, 0);
