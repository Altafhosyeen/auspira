export interface IRole {
  id: string;
  name: string;
  desc: string;
  slug: string;
  role_permissions: IRolePermission[];
  users_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  meta_status: string;
}

export interface IRolePermission {
  id: string;
  permission: IPermission;
  is_default: boolean;
  is_active: boolean;
}

export interface IPermission {
  id: string;
  name: string;
  desc: string;
  context: string;
  slug: string;
}
