import { UploadFile } from 'antd';
import type { IBaseType, IPaginatedApiResponse } from '../api.types';

export interface ISystemCsvSeparator {
  id: string;
  name: string;
  value: string;
}

export interface ISystemTimezone {
  id: string;
  name: string;
  code: string;
  utc_offset: string;
}

export interface ISystemSettings extends IBaseType {
  site_name: string;
  timezone: ISystemTimezone;
  alpha_color_hex: string;
  accent_color_hex: string;
  font: string;
  cookie_consent_type: string;
  phone_field_setting: string;
  apply_btn_color_hex: string;
  browse_btn_color_hex: string;
  submit_btn_color_hex: string;
  application_max_programs: number;
  application_max_programs_one_type: number;
  application_max_types: number;
  application_max_departments: number;
  application_grouping: string;
  draft_application_deletion_days: number;
  draft_application_warning_days: number;
  apply_btn_text?: string;
  browse_btn_text?: string;
  submit_btn_text?: string;
  csv_separator?: ISystemCsvSeparator;
  meta_status?: string;
  alias_domain?: string;
  subdomain?: string;
  applicant_ref_id_prefix?: string;
  agent_ref_id_prefix?: string;
  admin_ref_id_prefix?: string;
  applicant_ref_id_suffix?: string;
  agent_ref_id_suffix?: string;
  admin_ref_id_suffix?: string;
  main_logo?: string | null;
  sec_logo?: string | null;
  cover_image?: string | null;
  slogan?: string;
  tagline?: string;
  privacy_policy_url?: string;
  marketing_cookies_text?: string;
  is_allow_clone_application?: boolean;
  is_allow_different_application_types?: boolean;
  legal_name?: string;
  legal_address?: string;
  registration_details?: string;
  main_web_url?: string;
  admission_office_email?: string;
  admission_office_phone?: string;
  from_email_name?: string;
  from_email?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  date_format?: string;
}

export interface SystemSettingsResponse extends IPaginatedApiResponse<ISystemSettings> {}

export interface ISystemSettingsForm extends Omit<
  ISystemSettings,
  'timezone' | 'csv_separator' | 'main_logo' | 'sec_logo' | 'cover_image'
> {
  timezone?: string;
  csv_separator?: string;
  main_logo?: UploadFile[];
  sec_logo?: UploadFile[];
  cover_image?: UploadFile[];
}
