import { Dayjs } from 'dayjs';

export interface IAdministratorPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  dob?: string | null;
  country_id?: string | null;
  avatar?: string | null;
  is_admin?: boolean;
  verified_at?: Date | null;
  id?: string;
  roles?: string[];
  is_allowed_filtered_applications?: boolean;
  is_all_stages_allowed?: boolean;
  is_all_departments_allowed?: boolean;
  is_all_programs_allowed?: boolean;
  is_all_regions_allowed?: boolean;
  allowed_stages?: string[];
  allowed_regions?: string[];
  allowed_departments?: string[];
  allowed_programs?: string[];
  allowed_department_programs?: string[];
  accessPolicy?: boolean;
  acc_activation_timestamp?: string | null;
  acc_termination_timestamp?: string | null;
  stages?: string[];
  regions?: string[];
}

export type TProgramSelectionFields = Partial<Record<`${string}_program_ids`, string[]>>;

// export type TAdministratorFormValues = TProgramSelectionFields & IAdministratorPayload

export type TAdministratorFormValues = TProgramSelectionFields &
  Omit<IAdministratorPayload, 'dob'> & {
    dob?: Dayjs | null;
  };
