import { ICountry } from '../lookup.types';
import { ICurrency, IInvoiceTemplate } from './invoice-templates';

export interface IFeeType {
  id: string;
  name: string;
  desc: string;
  slug: string;
}

export interface IInvoiceType {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ISeries {
  id: string;
  name: string;
  slug: string;
}

export interface IFeeInterval {
  id: string;
  name: string;
  desc: string;
}

export interface ICountryFee {
  id: string;
  country: ICountry;
  currency: ICurrency;
  fee_interval: IFeeInterval;
  amount: string;
  desc: string;
}

export interface ISystemEvent {
  id: string;
  name: string;
  code: string;
  context: string;
  model_name: string;
}

export interface IFeeAutomationTrigger {
  id: string;
  system_event: ISystemEvent;
  is_active: boolean;
  trigger_values?: unknown[];
}

export interface IProgramFeeAssignment {
  id?: string;
  program_ids: string[];
}

export interface IFee {
  id?: string;
  name: string;
  desc: string;
  slug?: string;
  fee_type: IFeeType;
  invoice_template: IInvoiceTemplate;
  country_fees?: ICountryFee[];
  fee_automation_triggers?: IFeeAutomationTrigger[];
  program_fees?: IProgramFeeAssignment[];
  fee_interval?: IFeeInterval;
  amount: string;
}
export interface IFeeQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  fee_type_id?: string;
}

/* ----------------------------- PAYLOAD TYPES ---------------------------- */
export interface ICreateFeePayload {
  name: string;
  desc?: string;
  fee_type_id: string;
  invoice_template_id: string;
  fee_interval_id: string;
  amount: string;
  currency_id?: string;
  country_fees?: Array<{
    id?: string; // Optional for new fees, present for updates
    country_id: string;
    currency_id: string;
    fee_interval_id: string;
    amount: string;
    desc?: string;
  }>;
  fee_automation_triggers?: Array<{
    id: string;
    system_event: ISystemEvent;
    is_active: boolean;
    trigger_values?: Array<{ value: string }>;
  }>;
  invoicing_mode?: 'none' | 'per_application' | 'per_course' | 'per_priority';
  invoice_row_text?: string;
  include_invoice_template_rows?: boolean;
  notify_applicant?: boolean;
  program_fees?: IProgramFeeAssignment[];
}

export interface IUpdateFeeParams {
  id?: string;
  data: ICreateFeePayload;
}

export interface IFeeEditFormValues {
  name: string;
  desc?: string;
  fee_type_id: string;
  invoice_template_id: string;
  fee_interval_id: string;
  amount: string;
  currency_id?: string;
  country_fees?: Array<{
    id?: string;
    country?: { id: string; name?: string; code?: string; abbreviation?: string };
    currency?: { id: string; name?: string; code?: string; symbol?: string };
    fee_interval?: { id: string; name?: string; desc?: string };
    amount?: string;
    desc?: string;
  }>;
  fee_automation_triggers?: IFeeAutomationTrigger[];
  invoicing_mode?: 'none' | 'per_application' | 'per_course' | 'per_priority';
  invoice_row_text?: string;
  include_invoice_template_rows?: boolean;
  notify_applicant?: boolean;
}

export interface IFeeEditFormProps {
  loading?: boolean;
  isSaving?: boolean;
  initialValues?: IFeeEditFormValues | null;
  onBack: () => void;
  feeId?: string;
}
