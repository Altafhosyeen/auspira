import React, { useMemo } from 'react';
import { Skeleton, Tooltip } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import { SYSTEM_ROLE_IDS } from '@/constants/role.ids';
import { useGetOrganizationMe } from '@/hooks/modules/organization';
import { IOrganization } from '@/types/organization/orgnization';

/** First letters of the first two words, e.g. "Nexora Ai Ltd" → "NA". */
const getInitials = (name?: string | null) => {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

/**
 * Shows the organisation the signed-in user belongs to, as the first step of the header's
 * "Organisation → Project" context breadcrumb. Deliberately borderless/unboxed so it reads as
 * static context rather than competing with the project selector next to it, and capped well
 * under the 52px header height.
 *
 * System admins are not scoped to a single organisation, so the block (and its request) is
 * skipped for them entirely.
 *
 * @param showDivider renders the trailing separator — pass true only when a control (the project
 *   selector) actually follows, otherwise the divider dangles.
 */
const HeaderOrganization = ({ showDivider = false }: { showDivider?: boolean }) => {
  const user = useAuthStore((state) => state.user);
  const isOrganizationUser = !!user && user.roleId !== SYSTEM_ROLE_IDS.SYSTEM_ADMIN;

  const { data: organisation, isLoading } = useGetOrganizationMe<IOrganization>(undefined, {
    enabled: isOrganizationUser,
    staleTime: 10 * 60_000, // org name rarely changes — avoid refetching on every mount
  });

  const initials = useMemo(() => getInitials(organisation?.name), [organisation?.name]);

  if (!isOrganizationUser) return null;

  if (isLoading) {
    return (
      <div className="hidden h-7 items-center gap-2 md:flex">
        <Skeleton.Avatar active size={28} shape="square" />
        <Skeleton.Input active size="small" style={{ width: 110, minWidth: 110, height: 16 }} />
      </div>
    );
  }

  if (!organisation?.name) return null;

  return (
    <div className="hidden h-7 items-center gap-2 md:flex">
      <div className="bg-main-p flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] leading-none font-semibold text-white">
        {initials || <ShopOutlined className="text-xs" />}
      </div>

      <Tooltip title={organisation.name}>
        <span className="ds-body-strong text-text max-w-40 truncate">{organisation.name}</span>
      </Tooltip>

      {showDivider && <span className="bg-theme-border-subtle ml-1 h-5 w-px" aria-hidden />}
    </div>
  );
};

export default HeaderOrganization;
