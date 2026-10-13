// ==========================================
// CONTRACT DATA PART ONE — METADATA PANEL DATA TYPES
// ==========================================

export interface MetricCardData {
  label: string;
  value: string;
}

export interface ContractDataRow {
  label: string;
  /** Plain text value. Omit when rendering `pills` instead. */
  value?: string;
  /** Renders a row of small option pills in place of `value`. */
  pills?: string[];
  subtext?: string;
  isBlank?: boolean;
  badgeText?: string;
  refTagText?: string;
  /** Page the ref tag cites — when present, the tag becomes clickable and jumps the document viewer here. */
  refTagPage?: number;
  /** Label-only group-heading row (no value/pills by design) — always rendered, never filtered as "missing". */
  isSpacer?: boolean;
  /**
   * True for rows in the "People" category — styles `value` as a name (blue,
   * matching the Key People section on Contract Data Part 2) and renders
   * `badgeText` as a plain role-style line instead of a bordered pill.
   */
  isPerson?: boolean;
}

// ==========================================
// CONTRACT DATA PART 1 — exact JSON shape from the AI extraction
// (rendered generically by ContractDataPartOneMetaPanel)
// ==========================================

export interface Cd1Detail {
  label: string;
  /** Plain string, or an array of option codes rendered as pills (e.g. Secondary Options) */
  value: string | string[];
  page?: number | string | null;
  reference?: string;
  /** Short flag rendered as an uppercase badge next to the value, e.g. "in Form of Agreement", "blank" */
  note?: string;
  /** Longer explanatory line rendered below the value */
  description?: string;
}

export interface Cd1Category {
  id: string;
  title: string;
  /** Flat list of rows (clientIdentity, people, dates) */
  details?: Cd1Detail[];
  /** Grouped rows under a sub-heading (definedTerms) */
  groups?: { groupName: string; details: Cd1Detail[] }[];
}

export interface Cd1Metric {
  label: string;
  value: string;
}

export interface Cd1DocumentInfo {
  title?: string;
  subtitle?: string;
  contractForm?: string;
  reference?: string;
  project?: string;
}

export interface Cd1Summary {
  description?: string;
  sourcePages?: string;
}

export interface Cd1JsonData {
  document?: Cd1DocumentInfo;
  summary?: Cd1Summary;
  metrics?: Cd1Metric[];
  categories?: Cd1Category[];
}
