// ==========================================
// CONTRACT DATA PART TWO — METADATA PANEL DATA TYPES
// ==========================================
// CONTRACT DATA PART 2 — exact JSON shape from the AI extraction
// (rendered generically by ContractDataPartTwoMetaPanel + section components)
// ==========================================

export interface Cd2Metric {
  label: string;
  value: string | number;
}

export interface Cd2DocumentInfo {
  title?: string;
  subtitle?: string;
  contractForm?: string;
  reference?: string;
  revision?: string;
  agent?: string;
  contractor?: string;
}

export interface Cd2Summary {
  description?: string;
  sourcePages?: string;
}

export interface Cd2Detail {
  label: string;
  value?: string;
  name?: string;
  role?: string;
  status?: string;
  option?: string;
  items?: string[] | null;
  description?: string | null;
  page?: number | string | null;
  reference?: string;
}

export interface Cd2RateItem {
  description: string;
  rate: number;
  unit: string;
  applicableHours?: string;
}

export interface Cd2UpliftItem {
  description: string;
  applicableHours: string;
  multiplier: string;
}

export interface Cd2EquipmentRateItem {
  description: string;
  rate: number;
  unit: string;
}

export interface Cd2DesignRateItem {
  role: string;
  rate: number;
  unit: string;
}

export interface Cd2ShortScheduleOfCostComponents {
  peopleRates?: {
    note?: string;
    standardHours?: string;
    items: Cd2RateItem[];
    uplifts?: Cd2UpliftItem[];
  };
  equipmentPublishedList?: {
    publisher?: string;
    edition?: string;
    adjustment?: string;
  };
  equipmentOtherRates?: {
    note?: string;
    items: Cd2EquipmentRateItem[];
  };
  designOutsideWorkingAreas?: {
    note?: string;
    items: Cd2DesignRateItem[];
  };
}

export interface Cd2ReferencedDocumentItem {
  name: string;
  section?: string;
  description?: string;
  status?: string;
  page?: number | string | null;
  reference?: string;
}

export interface Cd2ConflictingValue {
  value: string;
  source: string;
}

export interface Cd2DisagreementDetails {
  field: string;
  status: string;
  note?: string;
  conflictingValues: Cd2ConflictingValue[];
}

export interface Cd2Category {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** contractorIdentity, keyPeople, timeAndResources */
  details?: Cd2Detail[];
  /** referencedDocuments */
  items?: Cd2ReferencedDocumentItem[];
  /** price */
  feePercentage?: string;
  tenderedTotal?: string;
  shortScheduleOfCostComponents?: Cd2ShortScheduleOfCostComponents;
  /** documentDisagreementDemo */
  disagreementDetails?: Cd2DisagreementDetails;
  page?: number | string | null;
  reference?: string;
}

export interface Cd2JsonData {
  document?: Cd2DocumentInfo;
  summary?: Cd2Summary;
  metrics?: Cd2Metric[];
  categories?: Cd2Category[];
}
