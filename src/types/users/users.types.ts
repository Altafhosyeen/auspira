import type { IBaseType } from '@/types/api.types';

export interface ProjectAssignment {
  projectId: string;
  projectRole: number;
}

export interface CreateUserPayload {
  email: string;
  name: string;
  roleId: string;
  contractor?: string | null;
  areasOfInterest?: string | null;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  projectAssignments: ProjectAssignment[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roleId?: string;
  contractor?: string | null;
  areasOfInterest?: string | null;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  status?: number;
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string | null;
  fullName: string;
  roleId: string;
  jobTitle: string | null;
  phone: string | null;
  status: number;
  acceptTerms: boolean;
  acceptDataProcessing: boolean;
  isDefault: boolean;
  emailConfirmed: boolean;
  organizationId: string;
  createdOn: string;
  updatedOn: string;
  emailInboxConnected: boolean;
  contractor: string | null;
  areasOfInterest: string | null;
  allocatedProjectsCount: number;
}

export interface UserResponse extends IBaseType {
  email: string;
  name: string;
  roleId: string;
  contractor?: string | null;
  areasOfInterest?: string | null;
  projectAssignments: ProjectAssignment[];
}

export interface UserStat {
  active: number;
  inactive: number;
  invited: number;
  total: number;
}
