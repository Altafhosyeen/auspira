import {
  buildLifecycleStepsFromStages,
  type DetailLifecycleStep,
  toLifecycleStageStates,
} from '@/components/shared/detail-lifecycle-rail';
import { CeLifecycleStage, type EntityLifecycleEntry } from '@/constants/enum.constant';
import { COMPENSATION_EVENT_STATUS_LABELS } from '../constants/compensation-event.constants';
import { COMPENSATION_EVENT_TYPE_LABELS } from '../constants/compensation-event-notice.constants';
import type { CompensationEventOverviewTone } from '../constants/compensation-event-overview.theme';
import type {
  CompensationEvent,
  CompensationEventRegisterState,
} from '../types/compensation-event.types';
import type { QuotationResponseDto } from '../types/compensation-event-quotation-api.types';
import { DASH, formatDetailDate, formatQuoteValue, orDash } from './compensation-event.utils';
import { toNumber } from './compensation-event-api.utils';
import { isNamed, resolvePreparedByName } from './compensation-event-preparer.utils';

// Plain counts — "0 Days", "1 Day" — unlike the zero-padded "05 Days" the old Key
// Summary printed; the Overview reports the figure the record holds, zero included.
export const formatDayCount = (days?: number | null): string => {
  if (days === undefined || days === null) return DASH;
  return `${days} ${Math.abs(days) === 1 ? 'Day' : 'Days'}`;
};

// Which day count the Key Summary shows. The implemented figure is what the record
// settled on, the quoted figure is what the contractor asked for, and the estimate is
// the notice's opening guess — so the tile prefers them in that order rather than
// reading `timeImpactDays` alone, which an implemented record often does not carry.
export const resolveDaysIncreased = (event: {
  approvedTimeImpactDays?: number | null;
  quotedDays?: number | null;
  timeImpactDays?: number | null;
}): number | null | undefined =>
  event.approvedTimeImpactDays ?? event.quotedDays ?? event.timeImpactDays;

export interface CompensationEventStatusMetric {
  label: string;
  tone: CompensationEventOverviewTone;
  icon: string;
}

// Tile styling for the Key Summary's Status figure: settled records read green, records
// waiting on the other party read amber, and a live assessment reads violet.
const STATUS_METRIC_STYLES: Record<
  CompensationEventRegisterState,
  { tone: CompensationEventOverviewTone; icon: string }
> = {
  DRAFT: { tone: 'schedule', icon: 'fluent:document-edit-24-regular' },
  QUOTATION_TO_BE_SUBMITTED: { tone: 'decision', icon: 'fluent:send-24-regular' },
  QUOTATION_SUBMITTED: { tone: 'decision', icon: 'fluent:clock-24-regular' },
  REVISED_QUOTATION_TO_BE_SUBMITTED: { tone: 'decision', icon: 'fluent:arrow-sync-24-regular' },
  PROJECT_MANAGER_ASSESSMENT: { tone: 'cost', icon: 'fluent:clipboard-task-24-regular' },
  EXTENSION_OF_TIME_REQUESTED: { tone: 'decision', icon: 'fluent:timer-24-regular' },
  IMPLEMENTED: { tone: 'days', icon: 'fluent:checkmark-circle-24-regular' },
  NOT_ACCEPTED: { tone: 'schedule', icon: 'fluent:dismiss-circle-24-regular' },
  DISCARDED: { tone: 'schedule', icon: 'fluent:dismiss-circle-24-regular' },
};

// The Status tile prints the backend's own `statusName` when it sent one, so the tile
// never disagrees with the register row about what the record's state is called.
export const resolveStatusMetric = (
  state: CompensationEventRegisterState,
  statusName?: string
): CompensationEventStatusMetric => ({
  label: statusName?.trim() || COMPENSATION_EVENT_STATUS_LABELS[state],
  ...STATUS_METRIC_STYLES[state],
});

export interface CompensationEventClauseSummary {
  number: string;
  title: string;
  /** Empty when the backend's description only echoes the clause number and title. */
  description: string;
  additional: string[];
}

const collapse = (value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase();

// `clauseDescription` is often just "60 - Compensation events" — the number and title
// again — so the panel only prints it when it actually says something more.
export const resolveClauseSummary = (event: {
  clauseNumber?: string;
  clauseTitle?: string;
  clauseDescription?: string;
  additionalClauses?: string[];
}): CompensationEventClauseSummary => {
  const number = event.clauseNumber?.trim() ?? '';
  const title = event.clauseTitle?.trim() ?? '';
  const description = event.clauseDescription?.trim() ?? '';
  const echoes = [number, title, [number, title].filter(Boolean).join(' - ')]
    .filter(Boolean)
    .map(collapse);

  return {
    number,
    title,
    description: echoes.includes(collapse(description)) ? '' : description,
    additional: event.additionalClauses ?? [],
  };
};

export type CompensationEventLifecycleStepKey = 'notified' | 'quotation' | 'implemented';

export interface CompensationEventLifecycleStep {
  key: CompensationEventLifecycleStepKey;
  label: string;
  date: string;
  complete: boolean;
}

// The three stamps the compensation-event record actually carries. A stage is reached
// when its date exists and not before — the record's own timestamps decide the rail, so
// nothing is inferred from the register state.
const LIFECYCLE_STEPS: Array<{
  key: CompensationEventLifecycleStepKey;
  label: string;
  dateOf: (event: CompensationEvent) => string | null | undefined;
}> = [
  { key: 'notified', label: 'Notified', dateOf: (event) => event.createdAt },
  { key: 'quotation', label: 'Quotation Submitted', dateOf: (event) => event.quoteReceivedDate },
  { key: 'implemented', label: 'Implemented', dateOf: (event) => event.finalizedOn },
];

// Builds the Overview rail from `createdOn`, `quotationSubmittedOn` and `implementedOn`.
// A step reads as passed only when the record holds its date; the rest show a dash.
export const buildLifecycleSteps = (event: CompensationEvent): CompensationEventLifecycleStep[] =>
  LIFECYCLE_STEPS.map((step) => {
    const date = formatDetailDate(step.dateOf(event));

    return { key: step.key, label: step.label, date, complete: date !== DASH };
  });

// The CE's five lifecycle stages, labelled as the design spells them. Stage state comes
// straight from the record's `lifecycle[]` entries via the shared mapper — the same rail
// the PMI and Early Warning details render through.
const CE_STAGE_LABELS: Record<number, string> = {
  [CeLifecycleStage.Raised]: 'Raised',
  [CeLifecycleStage.QuotationSubmitted]: 'Quotation Submitted',
  [CeLifecycleStage.RevisionRequested]: 'Revision Requested',
  [CeLifecycleStage.Assessed]: 'Assessed',
  [CeLifecycleStage.Implemented]: 'Implemented',
};

/** `lifecycle[]` → shared rail steps — completed stages show their date, the active
 * stage renders as a ring, upcoming stages show a dash. */
export const toCeLifecycleSteps = (
  lifecycle: EntityLifecycleEntry[] | null | undefined
): DetailLifecycleStep[] => {
  const stages = [
    CeLifecycleStage.Raised,
    CeLifecycleStage.QuotationSubmitted,
    CeLifecycleStage.RevisionRequested,
    CeLifecycleStage.Assessed,
    CeLifecycleStage.Implemented,
  ];
  const states = toLifecycleStageStates(lifecycle, stages);
  return buildLifecycleStepsFromStages(states, CE_STAGE_LABELS, formatDetailDate);
};

// The CE detail response carries no contractor name and no quote-received date — both
// only exist on the quotation the contractor submitted. The Overview reads them off the
// latest revision so "Contractor", the Quotation step's date and the Original Quote show
// what the record actually holds instead of sitting permanently blank.
export const withQuotationDetails = (
  event: CompensationEvent,
  quotations?: QuotationResponseDto[]
): CompensationEvent => {
  if (!quotations?.length) return event;

  // `isLatest` marks the live revision; fall back to the newest by date for older
  // responses that predate the flag.
  const latest =
    quotations.find((quotation) => quotation.isLatest) ??
    [...quotations].sort(
      (a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    )[0];

  if (!latest) return event;

  // The first revision is when the quote was received; later revisions are re-submissions.
  const received = [...quotations].sort(
    (a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
  )[0];

  return {
    ...event,
    // The record's own name can be the extractor's empty scaffolding ("[]"), which is no
    // more a contractor than a missing field is — so it falls back the same way. It is
    // not run through `resolvePreparedByName`: that splits on a comma, which would cut a
    // company name like "Smith, Jones & Co" down to its first word.
    contractorName: isNamed(event.contractorName)
      ? event.contractorName
      : resolvePreparedByName(latest.preparedBy),
    quoteReceivedDate: event.quoteReceivedDate ?? received?.createdOn ?? null,
    // The quoted total is the real "Original Quote"; the estimate only stands in until
    // a quotation exists.
    originalQuoteAmount: toNumber(latest.totalCost) ?? event.originalQuoteAmount,
  };
};

// What the record settled on: the implemented figure first, then the Project Manager's
// assessment, then the contractor's quote. The dash stands until one of them exists —
// the row reports what was agreed, so the notified estimate is not allowed to stand in
// for a figure nobody has implemented yet.
export const formatImplementedQuotation = (event: CompensationEvent): string => {
  const amount = event.finalApprovedAmount ?? event.pmAssessmentAmount ?? event.quotedValue;

  return amount === undefined || amount === null ? DASH : formatQuoteValue(amount, event.currency);
};

// `typeValue` is the backend's enum ordinal; anything outside the enum reads as a dash
// rather than printing a bare number the screen cannot explain.
export const formatEventType = (typeValue?: number): string =>
  typeValue === undefined ? DASH : orDash(COMPENSATION_EVENT_TYPE_LABELS[typeValue]);
