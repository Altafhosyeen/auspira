export interface IStage {
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
  change_status_to: IApplicationStatusLookup;
  next_stages: string[];
  is_status_change_enabled: boolean;
  change_status_when: string;
  is_disable_exam: boolean;
  is_disable_interview: boolean;
  meta_status: string;
}

export interface IEmailTemplate {
  id: string;
  name: string;
  subject: string;
  title: string;
  body: string;
  slug: string;
  desc: string;
  context: string;
  receiver: string;
  allowed_contexts: string;
  allowed_contexts_list: string[];
  buttons: IEmailTempButtonType[];
  created_at: string | null;
  updated_at: string | null;
}

export interface IApplicationStatusLookup {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
}

export interface IEmailTempButtonType {
  for: string;
  color: string;
  label: string;
}
