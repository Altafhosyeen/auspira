import type { IconType } from '@/components/module/users/UserStatsCard';

export interface StatConfig {
  title: string;
  color: string;
  icon: IconType;
  key: 'total' | 'active' | 'invited' | 'inactive';
}

export const USER_STATS_CONFIG: StatConfig[] = [
  {
    title: 'Total Users',
    color: 'bg-blue-100 text-blue-600',
    icon: 'users',
    key: 'total',
  },
  {
    title: 'Active Users',
    color: 'bg-green-100 text-green-600',
    icon: 'userCheck',
    key: 'active',
  },
  {
    title: 'Pending Invited',
    color: 'bg-orange-100 text-orange-600',
    icon: 'mail',
    key: 'invited',
  },
  {
    title: 'Guest',
    color: 'bg-gray-100 text-gray-600',
    icon: 'userPlus',
    key: 'inactive',
  },
];
