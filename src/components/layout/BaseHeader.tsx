import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  DownOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Popover, Tag, Tooltip } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SYSTEM_ROLE_IDS } from '@/constants/role.ids';
import { useLookupProject } from '@/hooks/modules/project';
import { signOutWithBackend } from '@/lib/auth/sign-out';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { getProjectNecTagConfig, isProjectActive } from '@/utils/project-display';
import SelectX from '../antd/SelectX';
import ConnectEmailModal from '../module/consent/ConnectEmailModal';
import BreadcrumbBar from './BreadcrumbBar';
import ThemeCustomizer from './theme-customizer';

/**
 * True only for the project create/edit workflow route (`/projects/<id>`), not the plain
 * `/projects` list page or the read-only document-review / signal sub-routes (which also start
 * with `/projects` but have an extra path segment) — so the header selector only locks while a
 * project is actually being created or edited.
 */
const isProjectEditRoute = (pathname: string | null) => {
  if (!pathname) return false;
  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 2 && segments[0] === 'projects';
};

const renderNecTag = (necForm: number | string | null | undefined) => {
  const config = getProjectNecTagConfig(necForm);

  if (!config) {
    return null;
  }

  return (
    <Tag bordered={false} className={config.className} style={config.style}>
      {config.label}
    </Tag>
  );
};

// Helper component to render the project status badge
const renderStatusTag = (status: number | string | null | undefined) => {
  if (isProjectActive(status)) {
    return (
      <Tag
        icon={<CheckCircleOutlined className="text-[11px] text-[#52c41a]" />}
        bordered={false}
        className="m-0! rounded-full px-2 text-xs font-semibold"
        style={{ background: '#eafff0', color: '#237804' }}
      >
        Active
      </Tag>
    );
  }
  return (
    <Tag
      icon={<LockOutlined className="text-[11px] text-[#8c8c8c]" />}
      bordered={false}
      className="m-0! rounded-full px-2 text-xs font-semibold"
      style={{ background: '#f5f5f5', color: '#595959' }}
    >
      Inactive
    </Tag>
  );
};

const BaseHeader = ({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
}) => {
  const [open, setOpen] = useState(false);
  // antd hides the closed-state label during search by making its text transparent, but
  // that rule only overrides inherited color — the badge Tags inside our label set their
  // own color inline, so they stay visible and collide with the search input. Hiding the
  // label ourselves while there's a search term sidesteps that.
  const [projectSearchValue, setProjectSearchValue] = useState('');
  const pathname = usePathname();
  const isProjectSelectorLocked = isProjectEditRoute(pathname);
  const user = useAuthStore((state) => state.user);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const setProjectOptions = useProjectStore((state) => state.setProjectOptions);
  const setSelectedProjectId = useProjectStore((state) => state.setSelectedProjectId);

  const { data: projects, isLoading: isProjectsLoading } = useLookupProject();

  // Dynamic custom options generator with checkmarks, tags, and subtitle metadata
  const projectOptions = useMemo(
    () =>
      (projects ?? []).map((project: any) => {
        const isSelected = selectedProjectId === project.id;

        return {
          value: project.id,
          // Custom tag used to load only the plain name when selector input is collapsed
          projectName: project.name,
          label: (
            <div className="flex w-full items-start gap-3 py-1.5">
              {/* Checkmark icon - aligned to top to support multi-line text wrapping */}
              {isSelected && (
                <CheckOutlined className="mt-1 shrink-0 text-sm font-bold text-[#1890ff]" />
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {/* Row 1: Full Project Name (Allows wrapping, no truncation) */}
                <div className="leading-snug">
                  <span
                    className={`block text-sm font-semibold break-words ${
                      isSelected ? 'text-[#1890ff]' : 'text-gray-900'
                    }`}
                  >
                    {project.name}
                  </span>
                </div>

                {/* Row 2: Dynamic Info & Status Badges */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {renderNecTag(project.necForm)}
                  {renderStatusTag(project.status)}

                  {/* Subtle bullet separator */}
                  <span className="text-xs text-gray-300 select-none">•</span>

                  {/* <span
                    className={`text-xs font-medium ${
                      isSelected ? 'text-[#3b97ff]' : 'text-gray-500'
                    }`}
                  >
                    {project.referenceId || 'N/A'}
                  </span> */}
                </div>
              </div>
            </div>
          ),
        };
      }),
    [projects, selectedProjectId]
  );

  // Renders the closed-state display. Suppressed while a search term is typed — antd
  // overlays the search input on the same spot and can only fade out plain inherited text,
  // so a rich node with its own colors has to hide itself instead. Returns '' rather than
  // null: a nullish label makes antd fall back to echoing the raw option value instead of
  // rendering nothing.
  const renderSelectedProjectLabel = () => {
    if (projectSearchValue) return '';
    const project = (projects ?? []).find((p: any) => p.id === selectedProjectId);
    if (!project) return '';

    return (
      <span className="flex items-center gap-2 truncate">
        <span className="truncate">{project.name}</span>
        {renderNecTag(project.necForm)}
        {renderStatusTag(project.status)}
      </span>
    );
  };

  useEffect(() => {
    const nextOptions = (projects ?? []).map((project: any) => ({
      id: String(project.id),
      name: String(project.name ?? ''),
    }));
    setProjectOptions(nextOptions);
  }, [projects, setProjectOptions]);

  const hide = () => setOpen(false);

  const handleLogout = async () => {
    hide();
    await signOutWithBackend('/login');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const content = (
    <div className="w-60">
      {/* User info header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-3">
        <Avatar
          size={40}
          className="bg-[#1e3a5f] text-sm font-semibold"
          icon={!user?.fullName ? <UserOutlined /> : undefined}
        >
          {user?.fullName
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </Avatar>
        <div className="min-w-0">
          <p className="my-0 truncate text-sm font-semibold text-gray-900">{user?.fullName}</p>
          <p className="my-0 truncate text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-1 px-2 py-3">
        <Link href="/settings/profile" onClick={hide}>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-[#E5EEFF] hover:text-[#1e3a5f]"
          >
            <UserOutlined className="text-base" />
            <span>Profile Settings</span>
          </button>
        </Link>
        <Link href="/settings/profile?tab=security" onClick={hide}>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-all duration-200 hover:bg-[#E5EEFF] hover:text-[#1e3a5f]"
          >
            <LockOutlined className="text-base" />
            <span>Security</span>
          </button>
        </Link>
      </div>

      {/* Divider */}
      <div className="my-2 border-t border-gray-200" />

      {/* Logout */}
      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogoutOutlined className="text-base" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex w-full items-center justify-between pr-2 sm:pr-3 lg:pr-5">
      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          type="text"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-0! text-gray-600 transition-all duration-300 hover:bg-gray-200 hover:text-gray-900"
          onClick={onToggleSidebar}
          title={collapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <MenuOutlined
            className="text-lg transition-transform duration-500"
            style={{
              transform: collapsed ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        </Button>

        <div className="flex h-full min-w-0 items-center overflow-hidden whitespace-nowrap">
          <BreadcrumbBar />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
        {user?.roleId === SYSTEM_ROLE_IDS.ORGANIZATION_ADMIN && (
          <Tooltip
            title={
              isProjectSelectorLocked
                ? 'Project switching is locked while you create or edit a project, so your unsaved changes stay with the right project. Finish or leave this page to switch.'
                : ''
            }
          >
            {/* Wrapper element so the tooltip still fires while the select itself is disabled */}
            <span className="hidden sm:block">
              <SelectX
                className="w-full sm:min-w-40 md:min-w-52 lg:min-w-65"
                disabled={isProjectSelectorLocked}
                suffixIcon={<DownOutlined className="text-xs text-gray-400" />}
                placeholder="Select project"
                loading={isProjectsLoading}
                value={selectedProjectId ?? undefined}
                options={projectOptions}
                // Options render multi-line custom content (name + wrapped badges); the
                // virtual list assumes a fixed row height and clips/overlaps taller rows.
                virtual={false}
                onChange={(value) => setSelectedProjectId(value ? String(value) : null)}
                // Shows name + NEC/status badges in closed state; suppressed while searching
                // so the search input never overlaps it.
                labelRender={renderSelectedProjectLabel}
                showSearch
                searchValue={projectSearchValue}
                onSearch={setProjectSearchValue}
                onOpenChange={(nextOpen) => {
                  if (!nextOpen) setProjectSearchValue('');
                }}
                filterOption={(inputValue, option) => {
                  const project = (projects ?? []).find((p: any) => p.id === option?.value);
                  if (!project) return false;
                  const searchTarget = `${project.name} ${project.referenceId || ''}`.toLowerCase();
                  return searchTarget.includes(inputValue.toLowerCase());
                }}
                dropdownStyle={{ padding: '4px' }}
              />
            </span>
          </Tooltip>
        )}

        <ConnectEmailModal />
        <ThemeCustomizer />
        <Badge count={4} size="small">
          <Button
            type="text"
            className="flex h-10 w-10 items-center justify-center rounded-full p-0! text-gray-600 transition-all duration-300 hover:bg-gray-200 hover:text-gray-900"
            title="Notifications"
          >
            <BellOutlined className="text-lg" />
          </Button>
        </Badge>
        {/* ✅ Avatar Popover */}
        <Popover
          content={content}
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}
          placement="bottomRight"
        >
          <div className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 transition-all duration-300 hover:bg-gray-100">
            <Avatar
              size={36}
              className="bg-[#1e3a5f] text-xs font-semibold"
              icon={!user?.fullName ? <UserOutlined /> : undefined}
            >
              {user?.fullName
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Avatar>
            <DownOutlined className="text-xs text-gray-400" />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default BaseHeader;
