import { useMemo } from 'react';
import type { ApiDocumentRecord } from '@/components/document-json-view/shared/ApiDocumentReview';
import { useGetTimeBarInfinite } from '@/hooks/modules/contract-registery';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import { buildDocNameMap, mapTimeBarResponseToSections } from './map-time-bar';
import type { Section, TimeBarApiItem, TimeBarApiResponse, TimeBarFilter } from './types';

interface UseTimeBarDataParams {
  projectId: string | null | undefined;
  searchText: string;
  activeFilter: TimeBarFilter;
  selectedGroups: string[];
}

const matchesSearch = (item: Section['items'][number], searchLower: string) =>
  item.clause.toLowerCase().includes(searchLower) ||
  item.period.toLowerCase().includes(searchLower) ||
  item.who.toLowerCase().includes(searchLower) ||
  item.clockStarts.toLowerCase().includes(searchLower) ||
  item.source.toLowerCase().includes(searchLower) ||
  !!item.modifies?.toLowerCase().includes(searchLower);

const matchesPill = (item: Section['items'][number], activeFilter: TimeBarFilter) => {
  if (activeFilter === 'modified') return !!item.modified;
  if (activeFilter === 'contractor') return item.who === 'C' || item.who === 'Contractor';
  return true;
};

/**
 * Fetches the time-bar pages plus the project's document names, then derives everything the
 * table renders: the filtered sections, the flat row list, the category options and the counts.
 */
export const useTimeBarData = ({
  projectId,
  searchText,
  activeFilter,
  selectedGroups,
}: UseTimeBarDataParams) => {
  const {
    data: timeBarPages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetTimeBarInfinite<TimeBarApiItem>({
    enabled: !!projectId,
    id: projectId || '',
  });

  // Resolves each row's `projectDocumentId` to its actual file name for the SOURCE
  // column — the API's own `source` field is frequently just the storage GUID.
  const { data: docs } = useGetDocumentsByProjectId<ApiDocumentRecord[]>({
    id: projectId || '',
    enabled: !!projectId,
    skipLoader: true,
  });
  const docNameById = useMemo(() => buildDocNameMap(docs), [docs]);

  // Flatten all pages into a single response for mapTimeBarResponseToSections
  const timeBarData = useMemo(() => {
    if (!timeBarPages?.pages) return undefined;
    const allItems = timeBarPages.pages.flatMap((page) => page.items);
    const totalCount = timeBarPages.pages[0]?.meta.totalCount ?? 0;
    return { meta: { totalCount }, items: allItems } as TimeBarApiResponse;
  }, [timeBarPages]);

  const sections = useMemo(
    () => mapTimeBarResponseToSections(timeBarData, docNameById),
    [timeBarData, docNameById]
  );

  const filteredSections = useMemo(() => {
    const searchLower = searchText.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            (!searchText || matchesSearch(item, searchLower)) && matchesPill(item, activeFilter)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, searchText, activeFilter]);

  // Flattened into one continuous row list — the table has no grouping bands, so each row carries
  // its category in the CATEGORY column instead. An empty tick list means "show every category".
  const visibleRows = useMemo(
    () =>
      filteredSections
        .filter((section) => selectedGroups.length === 0 || selectedGroups.includes(section.title))
        .flatMap((section) => section.items.map((item) => ({ item, group: section.title }))),
    [filteredSections, selectedGroups]
  );

  // Every known category stays in the tick list even when the search filters it down to zero, so
  // the checkboxes don't jump around as the user types. Counts reflect the search/pill filters.
  const groupOptions = useMemo(() => {
    const countByTitle = new Map(filteredSections.map((s) => [s.title, s.items.length]));
    return sections.map((section) => ({
      value: section.title,
      label: (
        <span className="ds-caption! flex items-center gap-1.5 text-slate-700">
          {section.title}
          <span className="ds-micro! font-semibold! text-slate-400">
            {countByTitle.get(section.title) ?? 0}
          </span>
        </span>
      ),
    }));
  }, [sections, filteredSections]);

  // Use the API's total count for "All" to match the tab badge
  const totalCountFromApi = timeBarData?.meta?.totalCount ?? 0;

  const counts = useMemo(() => {
    let modified = 0;
    let contractor = 0;

    sections.forEach((s) => {
      s.items.forEach((item) => {
        if (item.modified) modified++;
        if (item.who === 'C' || item.who === 'Contractor') contractor++;
      });
    });

    return { all: totalCountFromApi, modified, contractor };
  }, [sections, totalCountFromApi]);

  return { visibleRows, groupOptions, counts, hasNextPage, isFetchingNextPage, fetchNextPage };
};
