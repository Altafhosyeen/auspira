export interface ProjectSelectOption {
  id: string;
  name: string;
}

/** A contact person returned by GET /api/projects/{id}/contact-persons. */
export interface ContactPerson {
  id?: string;
  name?: string;
  email?: string;
  role?: string | null;
}

export interface ProjectDetailSummary {
  id?: string;
  name?: string;
  referenceId?: string;
  description?: string | null;
  necEdition?: string | number;
  necForm?: string | number;
  mainOption?: string | number;
  secondaryOptions?: string | number;
  aiAssistenceMode?: string | number;
  contractValue?: number;
  currency?: string;
  startDate?: string;
  completionDate?: string;
  defectDate?: string;
  siteAddress?: string;
  postcode?: string | null;
  employer?: string;
  contractor?: string;
  projectManager?: string;
  supervisor?: string;
  status: string | number;
  createdOn?: string;
}
