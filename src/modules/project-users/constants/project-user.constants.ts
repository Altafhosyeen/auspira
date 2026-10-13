import { ProjectRole } from '@/constants/enum.constant';

// The shared api.constants.ts points PROJECTS.USERS/REMOVE_USER at
// /api/projects/:id/users, but swagger serves this feature at /api/project-user/{id}/users
// (singular, different controller) — declared locally per the module-owns-endpoints rule.
export const PROJECT_USER_ENDPOINTS = {
  LIST: '/api/project-user/:id/users',
  ASSIGN: '/api/project-user/:id/users',
  REMOVE: '/api/project-user/:id/users/:userId',
  UPDATE_ROLE: '/api/project-user/:id/users/:userId/role',
} as const;

export const PROJECT_USERS_QUERY_KEY = ['project-users'] as const;

export const PROJECT_USER_COLUMNS = {
  user: 'User',
  role: 'Role',
  email: 'Email',
  status: 'Status',
  assignDate: 'Assign Date',
  actions: 'Actions',
} as const;

export const PROJECT_ROLE_OPTIONS = [
  { label: 'Project Manager', value: ProjectRole.ProjectManager },
  { label: 'Supervisor', value: ProjectRole.Supervisor },
  { label: 'Contractor', value: ProjectRole.Contractor },
  { label: 'Observer', value: ProjectRole.Observer },
];

export const PROJECT_ROLE_NAMES: Record<number, string> = Object.fromEntries(
  PROJECT_ROLE_OPTIONS.map((option) => [option.value, option.label])
);
