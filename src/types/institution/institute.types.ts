import { ILookup } from '@/store/lookup.store';
import { ICountry } from '../lookup.types';
import { IPaginatedResponse } from '../custom.types';
import { UploadFile } from 'antd';

export interface IInstitute {
  id: string;
  name: string;
  name_abbreviation?: string;
  name_local?: string;
  slug: string;
  desc: string;
  lat: string;
  lon: string;
  address: string;
  location: string;
  registration_number: string;
  tax_number: string;
  vat_number: string;
  bank_name: string;
  bank_address: string;
  bank_account_holder_name: string;
  bank_account_number: string;
  iban: string;
  swift_code: string;
  employee_count: string | null;
  is_public: boolean;
  is_non_profit: boolean;
  established_year: string | null;
  erasmus_code: string;
  contact_email: string;
  contact_phone: string;
  web_url: string;
  logo: string;
  cover: string;
  institute_type: ILookup;
  country: ICountry;
  meta_status: 'active';
  created_by: null;
  updated_by: null;
  created_at: null;
  updated_at: null;
}

export interface IInstituteResponse extends IPaginatedResponse<IInstitute> {}

export interface IInstituteFormValues extends Omit<
  Partial<IInstitute>,
  'logo' | 'cover' | 'country' | 'institute_type'
> {
  logo?: UploadFile[];
  cover?: UploadFile[];
  country?: string;
  institute_type?: string;
}
