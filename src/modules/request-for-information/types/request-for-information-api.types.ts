// Wire shapes for /api/rfis, mirroring the backend DTOs exactly.
// The UI never consumes these directly — `toRequestForInformation` maps them onto the
// module's domain model first.

/** Numeric fields come back as number or string depending on the serialiser. */
export type ApiNumber = number | string;

export interface RequestForInformationResponseDto {
  id: string;
  projectId: string;
  projectName?: string | null;
  reference: string;
  title: string;
  description: string | null;
  status: ApiNumber;
  statusName: string | null;
  raisedByName: string;
  raisedByRole: string | null;
  raisedToName?: string | null;
  dueDate: string | null;
  dateIssued: string | null;
  createdOn: string;
  updatedOn: string | null;
  pmiId?: string | null;
}

export interface RequestForInformationPageResultDto {
  meta: { totalCount: ApiNumber };
  items: RequestForInformationResponseDto[];
}

/** Query params for GET /api/rfis/project/{projectId}. */
export interface RequestForInformationProjectListParams {
  skip?: number;
  top?: number;
  term?: string;
  includeAll?: boolean;
  statuses?: string[];
}
