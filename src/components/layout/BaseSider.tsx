import { Menu, Skeleton } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { MENU_PATH } from '@/constants';
import { SYSTEM_ROLE_IDS } from '@/constants/role.ids';
import { ADMIN_ROUTES, ORGANIZATION_ROUTES, USER_ROUTES } from '@/constants/routes';
import { getMenuItem } from '@/lib/utils/menu';
import { useAuthStore } from '@/store/auth.store';

type RouteNode = {
  key: string;
  pathname: string;
  children?: RouteNode[];
};

type RouteEntry = {
  key: string;
  pathname: string;
  openKeys: string[];
};

// Served from root /public (public stays at the repo root even with src/).
const LOGO_URL = '/assets/images/aspuria-logo.png';

// Long labels ("Project Management Instruction") would otherwise be clipped to
// an ellipsis by antd's single-line default — let them wrap instead.
const WRAPPING_LABEL = {
  whiteSpace: 'normal' as const,
  overflow: 'visible' as const,
  textOverflow: 'clip' as const,
  lineHeight: 1.35,
};

// `itemContent` covers top-level rows; submenu children and their parent titles
// are separate semantic parts and need the same treatment.
const MENU_STYLES = {
  itemContent: WRAPPING_LABEL,
  itemTitle: WRAPPING_LABEL,
  subMenu: {
    itemContent: WRAPPING_LABEL,
    itemTitle: WRAPPING_LABEL,
  },
};

function BaseSider({ collapsed }: { collapsed: boolean }) {
  // ─── HOOKS ───────────────────────────────────────────────────────────────
  const loginUser = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const pathname = usePathname();

  const routes =
    loginUser?.roleId === SYSTEM_ROLE_IDS.SYSTEM_ADMIN
      ? ADMIN_ROUTES
      : loginUser?.roleId === SYSTEM_ROLE_IDS.ORGANIZATION_ADMIN
        ? ORGANIZATION_ROUTES
        : USER_ROUTES;

  const [openKeysOverride, setOpenKeysOverride] = React.useState<{
    pathname: string;
    keys: string[];
  } | null>(null);
  const menuItems = React.useMemo(() => routes.map((route) => getMenuItem({ ...route })), [routes]);
  const routeEntries = React.useMemo<RouteEntry[]>(() => {
    const walk = (items: RouteNode[], parentKeys: string[] = []): RouteEntry[] => {
      return items.flatMap((item) => {
        const itemKey = String(item.key);
        const current: RouteEntry = {
          key: itemKey,
          pathname: item.pathname,
          openKeys: parentKeys,
        };

        const children = item.children ? walk(item.children, [...parentKeys, itemKey]) : [];

        return [current, ...children];
      });
    };

    return walk(routes as RouteNode[]);
  }, [routes]);
  // ─── HELPERS ───────────────────────────────────────────────────────────────

  const getMatchedRouteEntry = (pathname: string): RouteEntry | undefined => {
    const normalizedPath = pathname.split('?')[0];

    return routeEntries
      .filter((entry) => {
        // Parent-only submenus (e.g. Contract Control Agent) have no page of their own;
        // an empty pathname must never match, otherwise `startsWith('/')` matches everything.
        if (!entry.pathname) {
          return false;
        }

        if (entry.pathname === '/') {
          return normalizedPath === '/';
        }

        return normalizedPath === entry.pathname || normalizedPath.startsWith(`${entry.pathname}/`);
      })
      .sort((a, b) => b.pathname.length - a.pathname.length)[0];
  };

  const getSelectedMenuItemKeys = (pathname: string): string[] => {
    const matchedRoute = getMatchedRouteEntry(pathname);

    if (matchedRoute) {
      return [matchedRoute.key];
    }

    return [];
  };

  const getOpenMenuItemKeys = (pathname: string): string[] => {
    const matchedRoute = getMatchedRouteEntry(pathname);

    if (matchedRoute) {
      return matchedRoute.openKeys;
    }

    return [];
  };

  const routeOpenKeys = getOpenMenuItemKeys(pathname);
  const hasScopedOverride = openKeysOverride?.pathname === pathname;
  const openKeys = hasScopedOverride ? openKeysOverride.keys : routeOpenKeys;
  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-x-hidden text-slate-800">
      {!collapsed && (
        <div className="flex flex-col gap-y-6  pt-6 pb-4">
          <Link
            href={MENU_PATH.DASHBOARD.pathname}
            aria-label="Go to dashboard home"
            className="inline-flex w-fit cursor-pointer"
          >
            <img src={LOGO_URL} alt="Logo" className="h-14 w-auto max-w-full object-contain" />
          </Link>
        </div>
      )}

      <div
        className={`min-h-0 flex-1 ${collapsed ? 'px-2' : 'px-4'} ${collapsed ? 'pb-4' : 'pb-10'}`}
      >
        {/* <div className="mb-2 px-3 text-[14px] text-white">Menu</div> */}

        <div className="h-full w-full overflow-y-auto">
          {hydrated && !loginUser ? (
            !collapsed && (
              <div className="flex flex-col gap-3 pt-2">
                <Skeleton.Input active block className="h-9! rounded-lg!" />
                <Skeleton.Input active block className="h-9! rounded-lg!" />
                <Skeleton.Input active block className="h-9! rounded-lg!" />
                <Skeleton.Input active block className="h-9! rounded-lg!" />
              </div>
            )
          ) : (
            <Menu
              className="app-sidebar-menu"
              selectedKeys={getSelectedMenuItemKeys(pathname)}
              openKeys={collapsed ? [] : openKeys}
              mode="inline"
              items={menuItems}
              theme="light"
              inlineIndent={16}
              inlineCollapsed={collapsed}
              styles={MENU_STYLES}
              onOpenChange={(openKeys: string[]) => {
                if (!collapsed) {
                  setOpenKeysOverride({ pathname, keys: openKeys });
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BaseSider;
