import { ProjectRole } from '@/constants/enum.constant';

// Purely descriptive copy for the assign modal's "Access Summary" — the backend has no
// permissions API to drive this from; it mirrors the fixed access each projectRole grants.
export const PROJECT_ROLE_ACCESS_SUMMARY: Record<number, string[]> = {
  [ProjectRole.ProjectManager]: [
    'View project and documents',
    'Raise Early Warnings',
    'Raise Compensation Events',
    'View Programme',
    'Approve quotations and assessments',
    'Participate in communications',
  ],
  [ProjectRole.Supervisor]: [
    'View project and documents',
    'Raise Early Warnings',
    'Raise Compensation Events',
    'View Programme',
    'Participate in communications',
  ],
  [ProjectRole.Contractor]: [
    'View project and documents',
    'Raise Early Warnings',
    'Raise Compensation Events',
    'View Programme',
    'Participate in communications',
  ],
  [ProjectRole.Observer]: ['View project and documents', 'View Programme'],
};
