import { IRole } from '../auth/role.types';

export interface IRoleQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface IRoleEditFormProps {
  loading?: boolean;
  isSaving?: boolean;
  initialValues?: IRole | null;
  onBack?: () => void;
  onSubmit?: (values: IRole) => Promise<void> | void;
}
