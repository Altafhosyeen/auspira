'use client';

import { Badge, Skeleton, Tabs } from 'antd';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import type { ApiDocumentTypeGroup } from '@/components/contract/Contract';
import type { ProgrammeVariant } from '@/components/contract/programme/types';
import { mapCrossReferenceGroupsToFindings } from '@/components/module/project/third-step/cross-reference/mapApiFindings';
import PageX from '@/components/shared/PageX';
import {
  CONTRACT_REGISTRY_CROSS_REFERENCE_TAB,
  CONTRACT_REGISTRY_TAB_PARAM,
} from '@/constants/routes.constants';
import {
  useGetAllDocuments,
  useGetTimeBarInfinite,
  useGetZClausesInfinite,
} from '@/hooks/modules/contract-registery';
import { useGetCrossReferenceGroups } from '@/hooks/modules/cross-reference';
import { useGetProjectOptions } from '@/hooks/modules/project';
import { useProjectStore } from '@/store/project.store';

const PROGRAMME_TAB_KEY = '6';

const PROGRAMME_HEADINGS: Record<ProgrammeVariant, { heading: string; subheading: string }> = {
  accepted: {
    heading: 'Accepted Programme',
    subheading: 'Clause 31 submission · Rev 05 · P6 XER · Option A',
  },
  revised: {
    heading: 'Revised Programme',
    subheading: 'Clause 32 submission · Rev 03 · P6 XER · data date 4 Jun 2026',
  },
};

const PROGRAMME_DESCRIPTIONS: Record<ProgrammeVariant, string> = {
  accepted:
    "The contract baseline every later revision is measured against. Read from the programme's own activity IDs and dates — not page position — so it holds whether it's 100 activities or 10,000.",
  revised:
    'Same programme, eight months on. The diff against the Accepted Programme is the headline — what moved, what was added, and what it did to the critical path. The accepted baseline underneath is never altered.',
};

// const Overview = dynamic(() => import('@/components/contract/Overview'), {
//   loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
// });
const Contract = dynamic(() => import('@/components/contract/Contract'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
});
const Options = dynamic(() => import('@/components/contract/Options'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
});
const ZClauses = dynamic(() => import('@/components/contract/Z-clauses'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
});
const Time = dynamic(() => import('@/components/contract/Time'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
});

const Programme = dynamic(() => import('@/components/contract/Programme'), {
  loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
});

const CrossReferenceContract = dynamic(
  () => import('@/components/contract/CrossReferenceContract'),
  {
    loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
  }
);

const ProjectUsersTab = dynamic(
  () => import('@/modules/project-users').then((mod) => mod.ProjectUsersTab),
  {
    loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
  }
);
const ACTIVE_TAB_STORAGE_KEY = 'contract-registry-active-tab';
const ACTIVE_TAB_EVENT = 'contract-registry-active-tab-change';
const DEFAULT_TAB_KEY = '2';

/** Tab keys a deep link may ask for via `?tab=` (e.g. a PMI's "View Cross Reference"). */
const LINKABLE_TAB_KEYS = new Set([CONTRACT_REGISTRY_CROSS_REFERENCE_TAB]);

const readLinkedTab = () => {
  const tab = new URLSearchParams(window.location.search).get(CONTRACT_REGISTRY_TAB_PARAM);
  return tab && LINKABLE_TAB_KEYS.has(tab) ? tab : null;
};

// Read the persisted tab from localStorage via useSyncExternalStore so the
// server renders the default and the client picks up the saved tab without a
// hydration mismatch or a setState-in-effect.
const subscribeActiveTab = (callback: () => void) => {
  window.addEventListener(ACTIVE_TAB_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(ACTIVE_TAB_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

export default function ContractRegistryPage() {
  const activeTabKey = React.useSyncExternalStore(
    subscribeActiveTab,
    // A `?tab=` deep link wins over the remembered tab, so the linked tab paints first.
    () => readLinkedTab() ?? window.localStorage.getItem(ACTIVE_TAB_STORAGE_KEY) ?? DEFAULT_TAB_KEY,
    () => DEFAULT_TAB_KEY
  );

  // Adopt a `?tab=` deep link as the remembered tab, then drop it from the URL so later tab
  // clicks (which only write localStorage) aren't pinned by it. Other params — the finding
  // the Cross-reference tab should open — are left for that tab to consume.
  React.useEffect(() => {
    const linkedTab = readLinkedTab();
    if (!linkedTab) return;
    window.localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, linkedTab);
    const url = new URL(window.location.href);
    url.searchParams.delete(CONTRACT_REGISTRY_TAB_PARAM);
    window.history.replaceState(window.history.state, '', url);
    window.dispatchEvent(new Event(ACTIVE_TAB_EVENT));
  }, []);
  const [programmeVariant, setProgrammeVariant] = React.useState<ProgrammeVariant>('accepted');
  const tabsWrapRef = React.useRef<HTMLDivElement>(null);

  // Z-clause total for the tab count badge. Shares the ZClauses table's query key,
  // so this is deduped — no extra request once that tab has loaded.
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { data: zClausePages } = useGetZClausesInfinite({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });
  const zClauseCount = zClausePages?.pages[0]?.meta.totalCount ?? 0;

  // Time-bar total for its tab count badge. Shares the Time tab's query key, so deduped.
  const { data: timeBarPages } = useGetTimeBarInfinite({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });
  const timeBarCount = timeBarPages?.pages[0]?.meta.totalCount ?? 0;

  // Options total for its tab count badge. Shares the Options tab's query key, so deduped.
  const { data: optionsData } = useGetProjectOptions<unknown[]>(selectedProjectId ?? '');
  const optionsCount = optionsData?.length ?? 0;

  // Contract total for its tab count badge. Shares the Contract tab's query key, so deduped.
  const { data: allDocs } = useGetAllDocuments<ApiDocumentTypeGroup[]>({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });
  const contractCount = React.useMemo(
    () => (allDocs ?? []).reduce((acc, group) => acc + (group.documents?.length ?? 0), 0),
    [allDocs]
  );

  // Cross-reference total for its tab count badge. Shares the CrossReference tab's query key, so deduped.
  const { data: crossRefGroups } = useGetCrossReferenceGroups({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });
  const crossRefCount = React.useMemo(
    () => mapCrossReferenceGroupsToFindings(crossRefGroups).length,
    [crossRefGroups]
  );

  // The tab content area is a shared scroller — reset it so every tab
  // switch starts at the top instead of inheriting the previous tab's offset.
  const handleTabChange = (key: string) => {
    window.localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, key);
    window.dispatchEvent(new Event(ACTIVE_TAB_EVENT));
    tabsWrapRef.current?.querySelector('.ant-tabs-content-holder')?.scrollTo({ top: 0 });
  };

  const isProgrammeTabActive = activeTabKey === PROGRAMME_TAB_KEY;
  const heading = isProgrammeTabActive
    ? PROGRAMME_HEADINGS[programmeVariant].heading
    : 'Contract Registry';
  const subheading = isProgrammeTabActive ? (
    <>
      {PROGRAMME_HEADINGS[programmeVariant].subheading}
      <br />
      {PROGRAMME_DESCRIPTIONS[programmeVariant]}
    </>
  ) : (
    'NEC4 ECC Option A · Stena Line Ports ↔ GPS Marine. Refurbishment of the Salt Island Bridge, Holyhead. W2 disputes · Y(UK)2 payment · ICE adjudicator. 23 Z-clauses, 5 modify standard time bars.'
  );

  const tabItems = [
    {
      key: '2',
      label: contractCount ? `Contract ${contractCount}` : 'Contract',
      children: (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <Contract />
        </Suspense>
      ),
    },
    {
      key: '3',
      label: optionsCount ? `Options & Form ${optionsCount}` : 'Options & Form',
      children: (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <Options />
        </Suspense>
      ),
    },
    {
      key: '4',
      // Trailing count renders as a badge (see the label mapper below).
      label: zClauseCount ? `Z-Clauses ${zClauseCount}` : 'ZClauses',
      children: (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <ZClauses />
        </Suspense>
      ),
    },
    {
      key: '5',
      label: timeBarCount ? `Time bars ${timeBarCount}` : 'Time bars',
      children: (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <Time />
        </Suspense>
      ),
    },
    {
      key: PROGRAMME_TAB_KEY,
      label: 'Programme',
      children: (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <Programme variant={programmeVariant} onVariantChange={setProgrammeVariant} />
        </Suspense>
      ),
    },
    {
      key: '7',
      label: crossRefCount ? `Cross-reference ${crossRefCount}` : 'Cross-reference',
      children: (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <CrossReferenceContract />
        </Suspense>
      ),
    },
    {
      key: '8',
      label: 'Project Users',
      children: (
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <ProjectUsersTab />
        </Suspense>
      ),
    },
  ];

  return (
    <PageX
      heading={heading}
      subheading={subheading}
      stickyHeader
      scrollClassName="flex h-full flex-col"
      className="min-h-0 flex-1"
    >
      <div className="contract-tabs" ref={tabsWrapRef}>
        <Tabs
          activeKey={activeTabKey}
          onChange={handleTabChange}
          items={tabItems.map((item) => ({
            key: item.key,
            destroyOnHide: false,
            children: item.children,
            label: (
              <span className="block px-1 py-0.5 text-xs md:text-sm">
                {/* Only a trailing number is de-emphasised (a count, e.g. "Time bars 21");
                    multi-word names like "Options & Form" render at full size. */}
                {/\s\d+$/.test(item.label) ? (
                  <>
                    {item.label.replace(/\s\d+$/, '')}
                    <Badge
                      count={Number(item.label.match(/\d+$/)?.[0])}
                      overflowCount={999}
                      className="[&_.ant-badge-count]:bg-main-p! ml-2! [&_.ant-badge-count]:text-white! [&_.ant-badge-count]:shadow-none!"
                    />
                  </>
                ) : (
                  item.label
                )}
              </span>
            ),
          }))}
        />
      </div>
    </PageX>
  );
}
