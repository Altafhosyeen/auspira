import type { User } from '@/types/users/users.types';

// GET /api/project-user/{id}/users returns UserResponseDto rows — the org-wide
// User shape plus the user's role and assignment date on this project.
export type ProjectUser = User & {
  projectRole: number;
  assignedOn: string | null;
};

export interface GetProjectUsersParams {
  skip?: number;
  top?: number;
  term?: string;
  // Multi-select status filter — comma-joined into the single `status` query param
  // the backend declares (lowercase, singular).
  status?: number[];
}

export interface AssignProjectUserPayload {
  userId: string;
  projectRole: number;
  notes?: string | null;
}

export interface UpdateProjectUserRolePayload {
  userId: string;
  projectRole: number;
}
