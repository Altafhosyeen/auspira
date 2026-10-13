// ==========================================
// HSQE REQUIREMENTS — METADATA PANEL DATA TYPES
// ==========================================
// HSQE — exact JSON shape from the AI extraction
// (rendered generically by HSQEMetaPanel + section components)
// ==========================================

export interface HsqeMetric {
  label: string;
  value: string;
}

export interface HsqeDocumentInfo {
  title?: string;
  subtitle?: string;
  project_code?: string;
  contract_type?: string;
  agent_role?: string;
  document_state?: string;
}

export interface HsqeDetail {
  label: string;
  key: string;
  description?: string;
  reference?: string;
  page?: string | null;
}

export interface HsqeCategory {
  id: string;
  title: string;
  status?: string;
  details: HsqeDetail[];
  pollution_prevention_expanded_controls?: string[] | null;
}

export interface HsqeReferencedPlan {
  plan_name: string;
  description?: string;
  status?: string;
}

export interface HsqeContractFunction {
  audience: string;
  role_description: string;
}

export interface HsqeJsonData {
  document?: HsqeDocumentInfo;
  summary?: { description?: string; sourcePages?: string };
  metrics?: HsqeMetric[];
  categories?: HsqeCategory[];
  referenced_plans_and_procedures?: HsqeReferencedPlan[];
  contract_functions?: HsqeContractFunction[];
}
