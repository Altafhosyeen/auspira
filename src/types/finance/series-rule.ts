export interface ISeriesRule {
  id: string;
  name: string;
  desc: string;
  custom_text: string;
  created_at: string | null;
  updated_at: string | null;
  is_active?: boolean;
}

export interface IInvoiceSeriesRule {
  id: string;
  series_rule: ISeriesRule;
  index: number;
  custom_text: string;
  is_active: boolean;
  last_increment: number;
  reset_count: number;
}
