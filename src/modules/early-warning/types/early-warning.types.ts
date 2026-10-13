import type { Dayjs } from 'dayjs';
import type { IPaginatedApiResponse } from '@/types';

// Register status vocabulary — a top-level field on the record:
// 0 = Open, 1 = Closed, 2 = NotAccepted, 3 = Discard.
export type EarlyWarningRegisterStatus = 'OPEN' | 'CLOSED' | 'NOT_ACCEPTED' | 'DISCARD';

/** Enum for Early Warning table status filters */
export enum EarlyWarningStatusFilter {
  ALL = 'ALL',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  NOT_ACCEPTED = 'NOT_ACCEPTED',
  DISCARD = 'DISCARD',
}

export type EarlyWarningImpact = 'DELAY' | 'KEY_DATE' | 'COST' | 'PERFORMANCE';

/** Register tab grouping. */
export type EarlyWarningRegisterTab = 'ACTIVE' | 'ARCHIVED' | 'DISCARDED';

export interface EarlyWarning {
  id: string;
  reference: string;
  title: string;
  description?: string;
  source: string;
  raisedOn: string;
  raisedBy: string;
  raisedAt: string | null;
  impacts: EarlyWarningImpact[];
  status: EarlyWarningRegisterStatus;
  statusCode?: number;
  displayStatus?: string;
  /** Earliest outstanding lifecycle due date, formatted for display; null when none. */
  dueDate: string | null;
  dueOverdue: boolean;
  closed: boolean;
  closedAt: string | null;
  closingReason: string | null;
  closedBy: string | null;
  potentialImpacts?: string;
}

export type EarlyWarningListResponse = IPaginatedApiResponse<EarlyWarning>;

/** Form values for the register form — antd shape (Dayjs date, recipient arrays). */
export interface RegisterEarlyWarningFormValues {
  ewReference: string;
  projectName?: string;
  projectReference?: string;
  /** Select mode="tags" with maxCount=1 — array of at most one sender email. */
  raisedBy?: string[];
  to?: string[];
  cc?: string[];
  bcc?: string[];
  riskTitle: string;
  riskDescription?: string;
  potentialImpact?: string;
  proposedActions?: string;
  /** DatePicker value — formatted to an ISO date only when the payload is built. */
  dateRaised?: Dayjs;
  source?: string;
  /** Free-text time impact (e.g. "3-4 weeks") — folded into PotentialImpacts on submit. */
  timeImpact?: string;
  /** Free-text cost impact (e.g. "TBC") — folded into PotentialImpacts on submit. */
  costImpact?: string;
  keyDatesAffected?: string;
  impactTypes?: string[];
  /** Cl. 15.4 follow-up chosen on the design's sidebar. */
  firstAction?: string;
}

/** Everything the register submit needs beyond the form fields themselves. */
export interface RegisterEarlyWarningContext {
  projectId: string;
  /** Omitted when the EW is raised manually — there is no originating alert. */
  projectAlertId?: string;
  projectName: string;
  projectReference: string;
  attachments?: File[];
  // Impacts / actions parsed off the originating alert's impactAssessment JSON. The
  // form has no fields for them, so they ride through the context and merge into
  // PotentialImpacts / ProposedActions at payload build time. (Recipients are real
  // form fields again — see RegisterEarlyWarningFormValues.)
  prefillImpacts?: string;
  prefillActions?: string;
  // Clause fields — separate top-level fields on the create payload (default to Cl. 15.1).
  clauseNumber?: string;
  clauseTitle?: string;
  clauseDescription?: string;
}
