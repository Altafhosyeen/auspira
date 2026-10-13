export interface Country {
  id: string;
  name: string;
  code: string;
  abbreviation: string;
}

export interface CountryVatRule {
  id?: string;
  country: Country;
  vat?: string;
  rate: string;
  created_at?: string;
  updated_at?: string;
}

export interface ICountryVatRuleUpdatePayload {
  id?: string;
  vat: string;
  country_id: string;
  rate: string | number;
}

export interface IVatRule {
  id?: string | null;
  name: string;
  desc?: string | null;
  rate: string;
  is_default?: boolean;
  slug?: string | null;
  country_vat_rules?: CountryVatRule[] | null;
}

export interface IVatRuleUpdatePayload extends Omit<IVatRule, 'country_vat_rules'> {
  country_vat_rules?: ICountryVatRuleUpdatePayload[];
}

export interface IVatRuleQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
