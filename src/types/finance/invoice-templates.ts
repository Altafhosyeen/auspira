export interface ICurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}
export interface IType {
  id: string;
  name: string;
  abbreviation: string;
}

export interface IInvoiceTemplateItem {
  id?: string;
  invoice_template?: string;
  name: string;
  desc?: string;
  quantity: string;
  unit_price: string;
  index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IInvoiceTemplate {
  id?: string;
  name: string;
  slug?: string;
  desc: string;
  deadline_days?: number;
  reminder_days?: number;
  instructions: string;
  disclaimer?: string;
  currency: ICurrency;
  type: IType;
  vat_rule?: { id?: string; vat_rule_id?: string };
  series?: { id: string; series_id: string };
  items?: IInvoiceTemplateItem[];
}

export interface IInvoiceTemplatePayloadItem {
  id?: string;
  name: string;
  desc?: string;
  quantity: string;
  unit_price: string;
  index: number;
}

export interface IInvoiceTemplatePayload {
  id?: string;
  name: string;
  slug?: string;
  desc: string;
  deadline_days?: number;
  reminder_days?: number;
  instructions: string;
  disclaimer?: string;
  currency_id: string;
  type_id: string;
  vat_rule_id?: string | null;
  series_id: string;
  items: IInvoiceTemplatePayloadItem[];
}

export interface IUpdateInvoiceTemplateParams {
  id: string;
  data: IInvoiceTemplate;
}

export interface IInvoiceTemplateQueryParams {
  skip?: number;
  top?: number;
  term?: string;
}
