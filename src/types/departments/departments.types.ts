import { IPaginatedResponse } from '../custom.types';
import { IInstitute } from '../institution/institute.types';
import { ICountry } from '../lookup.types';

export interface IDepartment {
  id: string;
  name: string;
  desc: string;
  slug: string;
  abbreviation: string;
  local_name: string;
  location: string;
  address: string;
  web_url: string;
  lat: number | null;
  lon: number | null;
  institute: IInstitute;
  country: ICountry;
  meta_status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface IDepartmentResponse extends IPaginatedResponse<IDepartment> {}

export interface IDepartmentPayload {
  name: string;
  local_name: string;
  location: string;
  address: string;
}
