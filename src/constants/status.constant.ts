// constants/status.constant.ts

import { Status } from './enum.constant';

// Enum definition lives in ./enum.constant; re-exported here alongside its helper.
export { Status };

export const getStatusConfig = (status?: number | string) => {
  switch (status) {
    case Status.Pending:
      return {
        label: 'Pending',
        color: 'processing',
      };

    case Status.Active:
      return {
        label: 'Active',
        color: 'success',
      };

    case Status.InActive:
      return {
        label: 'Inactive',
        color: 'default',
      };

    case Status.Invited:
      return {
        label: 'Invited',
        color: 'blue',
      };

    case Status.Deleted:
      return {
        label: 'Deleted',
        color: 'error',
      };

    case Status.Rejected:
      return {
        label: 'Rejected',
        color: 'red',
      };

    case Status.Suspended:
      return {
        label: 'Suspended',
        color: 'warning',
      };

    default:
      return {
        label: 'Unknown',
        color: 'default',
      };
  }
};
