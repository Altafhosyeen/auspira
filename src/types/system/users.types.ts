export interface IUser {
  id: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  roleId: string;
  jobTitle: string | null;
  status: number;
  acceptTerms: boolean;
  acceptDataProcessing: boolean;
  isDefault: boolean;
  organizationId: string;
  updatedOn: string;
  emailInboxConnected: boolean;
}
