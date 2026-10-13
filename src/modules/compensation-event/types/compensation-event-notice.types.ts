import type { Dayjs } from 'dayjs';
import type { CompensationEventTypeValue } from '../constants/compensation-event-notice.constants';

// Local to the notice UI — the richer NEC4 field set has no backend endpoint yet,
// so it is kept separate from `CreateCompensationEventInput` (the real create call).
export interface CompensationEventNoticeFormValues {
  // To/CC/BCC are recipient selects — each holds a list, joined into one comma-separated
  // string on submit because the DTO takes a single string per field.
  to?: string[];
  from?: string;
  bcc?: string[];
  cc?: string[];
  role?: string;
  dateIssued?: Dayjs;
  // The `CompensationEventType` enum value picked in the Event Information lookup — sent
  // as the create payload's `Type`.
  compensationEventType?: CompensationEventTypeValue;
  relevantContractClause?: string;
  descriptionOfEvent?: string;
  proposedEffect?: string;
}

// The Early Warning fields the notice seeds from when a CE is raised off an EW ("CE trigger
// identified — link CE"). A structural subset of GET /api/early-warnings/{id}: only what the
// form reads, so the module does not depend on the EW detail view model.
export interface EarlyWarningNoticeSource {
  id: string;
  projectId: string;
  reference: string;
  raisedBy: string;
  title: string;
  description: string | null;
  dateRaised: string | null;
  potentialImpacts: string | null;
  proposedActions: string | null;
  keyDatesAffected: string | null;
}

export interface NoticeProgressStep {
  title: string;
  // Empty for steps the notice screen does not collect yet; they complete only once
  // every field-bearing step is done.
  fields: (keyof CompensationEventNoticeFormValues)[];
}

export interface NoticeProgress {
  percent: number;
  currentStepIndex: number;
  completedStepIndexes: number[];
}

export interface NoticeTimeBar {
  /** `null` until a date is issued — the window has no start to count from. */
  daysRemaining: number | null;
  deadlineLabel: string;
}
