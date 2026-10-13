const SystemAdminId = 'f0d5ec08-2dc8-41a6-9519-d1d866af5d4c';

const OrganizationAdminId = 'bcac5992-690c-48e8-87db-2b3539928018';

const OrganizationUserId = '52b7c107-bc87-4e45-9efd-fdf8db341f9e';

export const SYSTEM_ROLE_IDS = {
  SYSTEM_ADMIN: SystemAdminId,
  ORGANIZATION_ADMIN: OrganizationAdminId,
  ORGANIZATION_USER: OrganizationUserId,
};

export const ROLE_NAMES = {
  [SystemAdminId]: 'System Admin',
  [OrganizationAdminId]: 'Admin',
  [OrganizationUserId]: 'User',
};

export const ROLE_COLORS_IN_LIST = [
  {
    id: OrganizationAdminId,
    name: 'Admin',
  },
  {
    id: OrganizationUserId,
    name: 'User',
  },
];
