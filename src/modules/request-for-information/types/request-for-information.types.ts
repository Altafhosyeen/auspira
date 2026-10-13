import type { Dayjs } from 'dayjs';
import type { IPaginatedApiResponse } from '@/types';

// Register vocabulary for the RFI Register screen.
export type RequestForInformationStatus = 'OPEN' | 'CLOSED';

export type RequestForInformationTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface RequestForInformation {
  id: string;
  projectId?: string;
  projectName?: string;
  reference: string;
  title: string;
  description?: string;
  status: RequestForInformationStatus;
  raisedByName: string;
  raisedByRole?: string;
  // Who the RFI was raised to — the party expected to respond.
  raisedToName?: string;
  dueDate?: string | null;
  dateIssued?: string | null;
  createdAt: string;
  updatedAt: string;
  // Set once the RFI already has a PMI raised against it — the register links straight to it.
  pmiId?: string;
  // Estimated cost/schedule impact of resolving the query, once known — absent until an
  // assessment puts a figure on it. Feeds the Overview's Key Summary strip.
  costImpact?: number | null;
  currency?: string;
  daysImpact?: number | null;
  // The contract clause the query is raised under — printed as the header's clause pill,
  // with `clauseDescription` as its hover. Optional: a record that names none drops the pill.
  clauseNumber?: string;
  clauseDescription?: string;
}

export interface RequestForInformationListParams {
  skip?: number;
  top?: number;
  term?: string;
  statuses?: RequestForInformationStatus[];
  includeAll?: boolean;
}

export type RequestForInformationListResponse = IPaginatedApiResponse<RequestForInformation>;

export interface CreateRequestForInformationInput {
  reference: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD, converted from Dayjs at the form boundary
  raisedByName: string;
  raisedByRole?: string;
}

export type UpdateRequestForInformationInput = Partial<CreateRequestForInformationInput>;

// One row in the RFI detail's Email Thread tab — a conversation summary, not the full
// per-message thread (that only loads once a row is opened in `EmailThreadModal`).
export interface RequestForInformationThreadMessage {
  id: string;
  authorName: string;
  subject: string;
  body: string;
  sentAt: string;
}

// Form-only shape for the Create Request For Information screen — kept separate from
// `CreateRequestForInformationInput` since the form carries fields (To/From/BCC/CC,
// project/reference display fields) the create payload does not need yet.
export interface RequestForInformationFormValues {
  to?: string[];
  from?: string;
  bcc?: string[];
  cc?: string[];
  basicRole?: string;
  dateIssued?: Dayjs;
  projectName?: string;
  requestRole?: string;
  raisedTo?: string;
  rfiSubject?: string;
  rfiDetails?: string;
  drawingReferences?: string;
  specificationReferences?: string;
  otherReferences?: string;
  proposedSolution?: string;
  responseRequiredBy?: Dayjs;
}
