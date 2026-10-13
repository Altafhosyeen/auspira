export interface IDefaultAdmin {
  email: string;
  fullName: string;
  phoneNumber: string | null;
  jobTitle: string | null;
  acceptTerms: boolean;
  acceptDataProcessing: boolean;
  password: string;
  confirmPassword: string;
}

export interface IOrganization {
  id?: string;
  name: string;
  address: string | null;
  industrySector: string | null;
  houseNumber: string | null;
  expectedUsers: number;
  status?: number;
  defaultAdmin: IDefaultAdmin;
}
