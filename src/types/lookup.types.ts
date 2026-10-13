export interface ILookup {
  id: string;
  name: string;
  abbreviation?: string;
  code?: string;
  slug?: string;
}
export interface ICountry extends ILookup {
  region: ILookup;
}

export interface IStage extends ILookup {
  color_hex: string;
  is_internal: boolean;
  is_default: boolean;
}

export interface IProgram extends ILookup {
  department: string;
  department_name: string;
  type_classifier_id?: string;
  degree_name?: string;
  degree_abbreviation?: string;
  accreditation?: string;
  duration_unit?: string;
  duration_value?: number;
}

export interface ITimezone extends ILookup {
  utc_offset: string;
}
