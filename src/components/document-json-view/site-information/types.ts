// ==========================================
// SITE INFORMATION — METADATA PANEL DATA TYPES
// ==========================================
// GENERIC JSON SHAPE — exact shape returned by the AI extraction
// (document.jsonData). The panel renders this generically: every
// label/value/details/children/status/reference is data-driven,
// nothing is hardcoded per section or item.
// ==========================================

/** A free-form key/value record, e.g. { material: "...", depth: "..." } */
export type SiteInfoChild = Record<string, string>;

export interface SiteInfoItem {
  label: string;
  value: string;
  details?: string | null;
  children?: SiteInfoChild[] | null;
  status?: string | null;
  reference?: string | null;
  page?: number | string | null;
}

export interface SiteInfoSection {
  title: string;
  items: SiteInfoItem[];
}

export interface SiteInfoMetric {
  label: string;
  value: string;
}

export interface SiteInfoContract {
  form?: string;
  option?: string;
}

export interface SiteInfoJsonData {
  title?: string;
  project?: string;
  contract?: SiteInfoContract;
  summary?: { description?: string; sourcePages?: string };
  metrics?: SiteInfoMetric[];
  sections?: SiteInfoSection[];
}
