import { normalizeToTitleCase } from '@/lib/utils';
import { IRolePermission, IPermission } from '@/types/auth/role.types';

export interface GroupedPermission {
  context: string;
  displayContext: string;
  permissions: IPermission[];
}

export const groupPermissionsByContext = (data: IRolePermission[]): GroupedPermission[] => {
  const groupedData = Object.values(
    data.reduce(
      (acc, item) => {
        const context = item.permission.context;

        if (!acc[context]) {
          acc[context] = {
            context,
            displayContext: normalizeToTitleCase(context),
            permissions: [],
          };
        }

        acc[context].permissions.push(item.permission);

        return acc;
      },
      {} as Record<string, GroupedPermission>
    )
  );

  return groupedData.sort((a, b) => a.displayContext.localeCompare(b.displayContext));
};

export const getInitialSelectedCounts = (data: IRolePermission[]): Record<string, number> => {
  return data.reduce(
    (acc, item) => {
      const context = item.permission.context;
      if (!acc[context]) {
        acc[context] = 0;
      }
      if (item.is_active) {
        acc[context] += 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );
};

export const getSelectedCountsFromPermissions = (
  grouped: GroupedPermission[],
  currentPermissions: Record<string, boolean>
): Record<string, number> => {
  return grouped.reduce(
    (acc, group) => {
      acc[group.context] = group.permissions.filter((perm) => currentPermissions[perm.id]).length;
      return acc;
    },
    {} as Record<string, number>
  );
};

export const getUpdatedPermissionsForAll = (
  grouped: GroupedPermission[],
  checked: boolean
): Record<string, boolean> => {
  return grouped.reduce(
    (acc, group) => {
      group.permissions.forEach((perm) => {
        acc[perm.id] = checked;
      });
      return acc;
    },
    {} as Record<string, boolean>
  );
};

export const getUpdatedPermissionsForGroup = (
  group: GroupedPermission,
  checked: boolean
): Record<string, boolean> => {
  return group.permissions.reduce(
    (acc, perm) => {
      acc[perm.id] = checked;
      return acc;
    },
    {} as Record<string, boolean>
  );
};

export const areAllPermissionsSelected = (
  grouped: GroupedPermission[],
  currentPermissions: Record<string, boolean>
): boolean => {
  const totalPermissions = grouped.reduce((sum, group) => sum + group.permissions.length, 0);

  if (totalPermissions === 0) {
    return false;
  }

  return grouped.every((group) => group.permissions.every((perm) => currentPermissions[perm.id]));
};
