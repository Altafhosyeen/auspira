import { IPaginatedResponse } from '../custom.types';

export interface IApplicationStatus {
  id: string;
  name: string;
  slug: string;
  desc: string;
  color_hex: string;
  is_default: boolean;
  applicant_can_edit_application: boolean;
  applicant_hide_inbox: boolean;
  applicant_hide_fee: boolean;
  applicant_hide_interview: boolean;
  applicant_hide_exam: boolean;
  applicant_hide_task: boolean;
  applicant_hide_docs: boolean;
  admin_hide_in_search: boolean;
  admin_can_edit_application: boolean;
  admin_can_edit_stage: boolean;
  admin_can_edit_administrators: boolean;
  admin_can_edit_agency: boolean;
  admin_can_edit_task: boolean;
  admin_can_edit_fee: boolean;
  admin_can_edit_interview: boolean;
  admin_can_edit_exam: boolean;
  admin_can_edit_docs: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface IApplicationStatusPayload extends Partial<
  Omit<
    IApplicationStatus,
    'id' | 'slug' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'
  >
> {}

export interface IApplicationStatusResponse extends IPaginatedResponse<IApplicationStatus> {}
