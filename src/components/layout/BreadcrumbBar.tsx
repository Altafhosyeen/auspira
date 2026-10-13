'use client';

import { Breadcrumb, type BreadcrumbProps, Flex, Tooltip } from 'antd';
import { usePathname } from 'next/navigation';
import React from 'react';
import { BREADCRUMB_MAP, type BreadcrumbDefinition, PARENT_ROUTES } from '@/constants';

type MatchedBreadcrumb = {
  pattern: string;
  definition: BreadcrumbDefinition;
  pathParts: string[];
};

const isDynamicSegment = (segment: string) => segment.startsWith(':');

const getPathParts = (path: string) => path.split('/').filter(Boolean);

const BREADCRUMB_ENTRIES = Object.entries(BREADCRUMB_MAP).map(([pattern, definition]) => ({
  pattern,
  definition,
  patternParts: getPathParts(pattern),
}));

function matchPattern(pathname: string): MatchedBreadcrumb | null {
  const pathParts = getPathParts(pathname);

  for (const entry of BREADCRUMB_ENTRIES) {
    if (entry.patternParts.length !== pathParts.length) continue;

    const isMatch = entry.patternParts.every(
      (part, index) => isDynamicSegment(part) || part === pathParts[index]
    );

    if (isMatch) {
      return {
        pattern: entry.pattern,
        definition: entry.definition,
        pathParts,
      };
    }
  }

  return null;
}

const resolveHrefFromPattern = (pattern: string, pathParts: string[]) => {
  const patternParts = getPathParts(pattern);
  const resolvedParts = patternParts.map((part, index) =>
    isDynamicSegment(part) ? pathParts[index] : part
  );

  return `/${resolvedParts.join('/')}`;
};

const resolveLabel = (
  definition: BreadcrumbDefinition,
  pattern: string,
  pathParts: string[],
  isLast: boolean
) => {
  if (!isLast) return definition.label;

  const patternParts = getPathParts(pattern);
  const containsNewDynamicValue = patternParts.some(
    (part, index) => isDynamicSegment(part) && pathParts[index] === 'new'
  );

  return containsNewDynamicValue ? '' : definition.label;
};

const renderBreadcrumbTitle = (label: string) => {
  if (!label) return null;

  return (
    <Tooltip title={label} placement="bottom">
      <span className="app-breadcrumb-title">
        <span className="app-breadcrumb-text">{label}</span>
      </span>
    </Tooltip>
  );
};

// Main Component
const BreadcrumbBar: React.FC = () => {
  const pathname = usePathname();

  const breadcrumbItems = React.useMemo<BreadcrumbProps['items']>(() => {
    if (!pathname || pathname === '/') return undefined;

    const match = matchPattern(pathname);
    if (!match) return undefined;

    const items: NonNullable<BreadcrumbProps['items']> = [];
    if (match.definition.parentLabel) {
      items.push({ title: renderBreadcrumbTitle(match.definition.parentLabel) });
    } else {
      const parent = match.definition.parent ?? match.pathParts[0];
      const parentRoute = PARENT_ROUTES.find((route) => route.path === parent);

      if (parentRoute) {
        items.push({
          title: renderBreadcrumbTitle(parentRoute.title),
        });
      }
    }

    const fullChain = [...(match.definition.chain ?? []), match.pattern];

    fullChain.forEach((pattern, index) => {
      const definition = BREADCRUMB_MAP[pattern];
      if (!definition) return;

      const resolvedHref = resolveHrefFromPattern(pattern, match.pathParts);
      const isLast = index === fullChain.length - 1;
      const label = resolveLabel(definition, pattern, match.pathParts, isLast);

      // An empty label would still render antd's separator, leaving a dangling "/"
      // after the parent crumb — skip the crumb entirely instead.
      if (!label) return;

      items.push(
        isLast
          ? {
              title: renderBreadcrumbTitle(label),
            }
          : {
              href: resolvedHref,
              title: renderBreadcrumbTitle(label),
            }
      );
    });

    return items;
  }, [pathname]);

  if (!pathname || pathname === '/') return null;
  if (!breadcrumbItems) return null;

  // Keep the header compact on deep routes — only the last two crumbs (parent + current).
  const visibleItems =
    (breadcrumbItems?.length ?? 0) > 2 ? breadcrumbItems!.slice(-2) : breadcrumbItems;

  return (
    <Flex align="center" className="min-w-0" style={{ height: '100%' }}>
      <Breadcrumb items={visibleItems} className="app-header-breadcrumb max-w-full" />
    </Flex>
  );
};

export default BreadcrumbBar;
