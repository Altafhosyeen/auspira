import type {
  ApiProgrammeAiHealthCheck,
  ApiProgrammeJsonData,
  ApiProgrammeObligation,
  ApiProgrammeObligationSection,
  ApiProgrammeObligations,
  ApiProgrammeVariance,
} from '@/components/module/project/second-step/programme-ingestion/types';
import type { ProjectEmailConversationAttachment } from '@/hooks/modules/project';
import type { ProjectAlert, ProjectAlertEmail } from '@/hooks/modules/project-alerts';
import type { IPaginatedApiResponse } from '@/types';

// No dedicated Program Health entity yet — the detail screen renders the shared ProjectAlert directly.
export type ProgrammeAlert = ProjectAlert;

// The raw Primavera extract. It is the `programme` sibling on GET /api/project-alerts/{id} and
// the stored record's `json` column, so one type covers both entry paths into the detail screen.
export type ProgrammeExtractDto = ApiProgrammeJsonData;

/** The AI-written programme health check the alert carries beside the extract. */
export type ProgrammeAiHealthCheckDto = ApiProgrammeAiHealthCheck;

// Baseline comparison read off `programme.comparison` — null while the programme carries no
// baseline, because a delta of 0 measured against nothing is not a clean position.
export interface ProgrammeComparisonView {
  completionDeltaDays: number;
  criticalPathDelta: number;
  activitiesAdded: number;
  activitiesRemoved: number;
  activitiesMoved: number;
  /** The accepted baseline's planned completion — the contract side of the variance. */
  baselinePlannedCompletion: string;
}

/** One thing the Client owes the programme. */
export type ProgrammeObligationDto = ApiProgrammeObligation;

/** A titled group of Client obligations. */
export type ProgrammeObligationSectionDto = ApiProgrammeObligationSection;

/** The alert's `obligations` sibling — the whole Client Obligations tab is built from this. */
export type ProgrammeObligationsDto = ApiProgrammeObligations;

export type ProgrammeVarianceDto = ApiProgrammeVariance;

// What the Awareness "Open" action lands on: the shared ProjectAlert plus the programme the
// backend hangs off it. This is the payload the tabs render, so nothing has to be accepted
// before a signal can be reviewed.
//
// `programme` arrives JSON-encoded (the stringified extract, the same bytes the stored record
// keeps in its `json` column), so it is parsed with `toProgrammeExtract`. The other three are
// optional: the alert does not send them today, and the tabs fall back to the extract itself.
export type ProgrammeAlertDetail = ProjectAlert & {
  programme?: ProgrammeExtractDto | string | null;
  aiProgrammeHealthCheck?: ProgrammeAiHealthCheckDto | null;
  variance?: ProgrammeVarianceDto | null;
  obligations?: ProgrammeObligationsDto | null;
};

// Body of POST /api/programme/accept — the alert the programme is accepted from. The
// endpoint takes JSON and no attachments, unlike the Defect Notice / Daily Site Report
// accepts, which post the evidence as multipart.
export interface AcceptProgrammeInput {
  projectAlertId: string;
}

/** One label/value line of the Programme Received card, with an optional source caption. */
export interface ProgrammeReceivedRow {
  label: string;
  value: string;
  caption?: string;
}

/** The signal's lifecycle tag on the Programme Received card — its label and pill tone. */
export interface ProgrammeAlertStatusView {
  label: string;
  tone: ProgrammeStatusTone;
}

// What the Programme Received card renders. Coming from Awareness the alert carries all of it;
// coming from the register the stored record's own reference, revision and submission date stand
// in when its signal cannot be joined, so the tab never renders an empty card.
export interface ProgrammeReceivedView {
  heading: string;
  /** Already display-formatted — "Received 11 Sep 2026, 07:14 AM" — or '' when undated. */
  received: string;
  /** Where the signal stands. Absent with no alert, or a status the backend has not named. */
  status?: ProgrammeAlertStatusView;
  rows: ProgrammeReceivedRow[];
}

export interface ProgrammeReceivedTabProps {
  /** The signal the programme arrived on — absent once the record's alert cannot be joined. */
  alert?: ProgrammeAlert;
  email?: ProjectAlertEmail;
  attachments: ProjectEmailConversationAttachment[];
  /** The stored programme record — the fallback source for the card's own identity. */
  record?: ProgrammeHealthResponseDto | null;
  /** "PRG-004 — Rev 3" off the record — the heading when there is no alert title to use. */
  revisionLabel?: string;
}

export type ExtractedFieldStatus = 'high' | 'review' | 'missing';

/** One row of the "Extracted from Rev N" table — a fact the extractor read off the programme. */
export interface ExtractedField {
  title: string;
  valueFound: string;
  status: ExtractedFieldStatus;
}

/** One flagged finding in the "AI programme health check" card. */
export interface HealthCheckFlag {
  category: string;
  finding: string;
  note?: string;
}

/** The AI health check card — its own title and flag count, plus the findings it lists. */
export interface ProgrammeHealthCheckView {
  title: string;
  flagCount: number;
  flags: HealthCheckFlag[];
}

export interface ExtractAndCheckTabProps {
  revisionLabel: string;
  fields: ExtractedField[];
  healthCheck: ProgrammeHealthCheckView;
}

/** One of the two "Contract Dates" tiles — a date with the reasoning that produced it. */
export interface ContractDateTile {
  label: string;
  date: string;
  caption: string;
}

/** Pill colour across the table-driven tabs — green, red, amber or grey. */
export type ProgrammeStatusTone = 'positive' | 'negative' | 'warning' | 'neutral';

/** One row of the "Key Dates" table — a milestone read straight off `sectionalKeyDates`. */
export interface PmViewKeyDate {
  label: string;
  reference: string;
  date: string;
  /** False when the revision names the milestone without dating it — the row's status. */
  dated: boolean;
}

/** The section's own status off the extract, mapped to the pill the table renders. */
export interface SectionalCompletionStatus {
  label: string;
  tone: ProgrammeStatusTone;
}

// One row of the "Sectional Completions" table. `dated` is false when the extract carried a
// section name but no date for it — the gap the card's count reports. `status` is the backend's
// own status for the section, and the one the Status column reads.
export interface SectionalCompletionRow {
  section: string;
  reference: string;
  completionDate: string;
  dated: boolean;
  /** Absent when the extract sends no status for the section. */
  status?: SectionalCompletionStatus;
}

export interface PmViewTabProps {
  revisionLabel: string;
  contractDates: ContractDateTile[];
  keyDates?: PmViewKeyDate[];
  sectionalCompletions: SectionalCompletionRow[];
}

/** One cell of the Variance dates strip — Completion Date / Planned Completion / Variance. */
export interface VarianceDateCell {
  label: string;
  value: string;
  /** Set only on the variance cell, which is tinted green/red by the slip direction. */
  tone?: ProgrammeStatusTone;
}

/** Which side of the programme the revision sits on — a flag off the extracted programme. */
export type VarianceDirection = 'ahead' | 'behind';

/** One row of the float/damages explanation list under the banner. */
export interface VarianceNote {
  label: string;
  value: string;
  caption: string;
}

export interface VarianceTabProps {
  /** Undefined when the assessment measures no variance — neither side applies, so the banner goes neutral rather than claiming one. */
  direction?: VarianceDirection;
  dates: VarianceDateCell[];
  /** Green banner — "Terminal float — 14 days" plus who owns it. */
  terminalFloatTitle: string;
  terminalFloatNote: string;
  notes: VarianceNote[];
}

/** One row of the Client Obligations table — something the Client owes against the programme. */
export interface ClientObligationRow {
  description: string;
  clauseNumber: string;
  owner: string;
  dueDate: string;
}

/** A titled group of obligations — one entry of `obligations.sections` on the alert. */
export interface ClientObligationGroup {
  section: string;
  rows: ClientObligationRow[];
}

export interface ClientObligationsTabProps {
  title: string;
  /** The assessment's own wording for what the Client owes, shown above the groups. */
  summary?: string;
  groups: ClientObligationGroup[];
}

/** One of the four Cl. 31.3 grounds for not accepting a programme. */
export interface NonAcceptanceReason {
  /** Stable key sent with the decision — not the display text, which may be reworded. */
  key: string;
  label: string;
  /** Optional note under the label, when something reads a finding for this ground. */
  caption?: string;
}

export interface AcceptRejectTabProps {
  reasons: NonAcceptanceReason[];
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  /** Free-text justification per ticked reason, keyed by reason key. */
  justifications: Record<string, string>;
  onJustificationChange: (key: string, value: string) => void;
  onAccept: () => void;
  onNotifyNonAcceptance: () => void;
  /** Set while a decision is in flight so both actions hold. */
  submitting?: boolean;
  /** The decision already on the register ("Accepted") — set once recorded, so the tab states the outcome rather than offering to overwrite it. */
  decisionRecordedLabel?: string;
}

/** One row of the Programme Register — a programme health record, mapped from the API DTO. */
export interface ProgrammeRegisterRow {
  id: string;
  reference: string;
  completionDate: string;
  variance: string;
  // The API's own health indicator, held as the code it arrived as. No backend enum is
  // published yet, so the register names the code rather than assigning it an On Track /
  // At Risk / Behind meaning the backend has not confirmed.
  healthCode?: number;
  raisedBy: string;
  raisedAt: string;
  /** The API's own status code — unnamed for the same reason as `healthCode`. */
  statusCode?: number;
  /** Source file for the download action; undefined while no file is attached. */
  fileUrl?: string;
}

/** Query params for both programme list routes (Skip/Top/Term/IncludeAll). */
export interface ProgrammeListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
}

export type ProgrammeRegisterListResponse = IPaginatedApiResponse<ProgrammeRegisterRow>;

/* -------------------------------------------------------------------------- */
/* API DTOs (mirror the Swagger schemas)                                       */
/* -------------------------------------------------------------------------- */

/** Item of GET /api/programme/project/{projectId}/summary — the register's own columns. */
export interface ProgrammeHealthSummaryDto {
  id: string;
  reference: string;
  completionDate?: string | null;
  variance?: string | null;
  health?: number | string | null;
  raisedBy?: string | null;
  raisedAt: string;
  status?: number | string | null;
  fileUrl?: string | null;
}

/** Item of GET /api/programme/project/{projectId} — the full record behind a summary row. */
export interface ProgrammeHealthResponseDto {
  id: string;
  projectId: string;
  projectEmailId?: string | null;
  reference: string;
  version?: number | string | null;
  json?: string | null;
  notAcceptReason?: string | null;
  notAcceptReasonTitle?: string | null;
  fileUrl?: string | null;
  conversationId?: string | null;
  createdOn: string;
}

/** Shared paging envelope — both list routes return one of these. */
export interface ProgrammeMetaObject {
  totalCount?: number | string;
}
export interface ProgrammePageResultDto<TItem> {
  meta?: ProgrammeMetaObject;
  items?: TItem[] | null;
}

export type ProgrammeSummaryPageResultDto = ProgrammePageResultDto<ProgrammeHealthSummaryDto>;
export type ProgrammeListPageResultDto = ProgrammePageResultDto<ProgrammeHealthResponseDto>;
