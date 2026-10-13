import { ILookup } from '../lookup.types';
import { IEmailTemplate } from './email-template.types';

export interface IProgramStage {
  id: string;
  name: string;
  applicant_display_name: string;
  code: string;
  desc: string;
  slug: string;
  color_hex: string;
  is_internal: boolean;
  is_default: boolean;
  email_template: IEmailTemplate;
  change_status_to: string | null;
  next_stages: string[];
  is_status_change_enabled: boolean;
  change_status_when: string;
  is_allow_exam: boolean;
  is_allow_interview: boolean;
  is_allow_email: boolean;
  meta_status: string;
}

export interface IProgramStagesButton {
  for: string;
  color: string;
  label: string;
}

export interface IProgramStagePayload extends Partial<
  Omit<
    IProgramStage,
    'id' | 'meta_status' | 'slug' | 'email_template' | 'is_default' | 'is_internal'
  >
> {}

export interface IProgramStagesLookup extends ILookup {
  color_hex: string;
  is_internal: boolean;
  is_default: boolean;
}
