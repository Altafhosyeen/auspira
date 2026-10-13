// ==========================================
// JSON SCOPE DOCUMENT — generic, citation-driven shape
// (rendered by JsonMetadataPanel)
// ==========================================
export interface JsonCitation {
  document: string;
  reference: string;
  page: number | string;
  text?: string;
}

export interface JsonSummaryCard {
  label: string;
  value: string;
}

export interface JsonScopeItem {
  text: string;
  citation: JsonCitation;
}

export interface JsonScopeCategory {
  name: string;
  items: JsonScopeItem[];
}

export interface JsonDesignStandard {
  code: string;
  description: string;
  citation: JsonCitation;
}

export interface JsonPerformanceParameter {
  name: string;
  value: string;
  citation: JsonCitation;
}

export interface JsonObligationItem {
  title: string;
  override?: string;
  description: string;
  period: string;
  citation: JsonCitation;
}

export interface JsonConstraintItem {
  text: string;
  citation: JsonCitation;
}

export interface JsonScopeSection {
  id: string;
  number: string;
  title: string;
  description?: string;
  contractDelivery?: string;
  citation?: JsonCitation;
  categories?: JsonScopeCategory[];
  designStandards?: JsonDesignStandard[];
  performanceParameters?: JsonPerformanceParameter[];
  items?: JsonObligationItem[] | JsonConstraintItem[];
  /** Callout footnote rendered in an amber box below the section's items (e.g. compensation-event disclaimer on Constraints) */
  note?: string;
}

export interface JsonReferencedDocument {
  id: string;
  name: string;
  reference: string;
  status: 'ingested' | 'queued' | string | null;
  pages: number;
}

export interface JsonScopeDocument {
  document: {
    title: string;
    subtitle: string;
    reference: string;
    classification: string;
    status: string;
    revision: string;
    revisionDate: string;
  };
  summary?: { description?: string; sourcePages?: string };
  summaryCards: JsonSummaryCard[];
  sections: JsonScopeSection[];
  documents: JsonReferencedDocument[];
}
