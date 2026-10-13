import type { ApiDocumentRecord } from '@/components/document-json-view/shared/ApiDocumentReview';
import { toSearchText } from '@/components/document-json-view/shared/toSearchText';
import { displayFileName } from '@/lib/utils';
import type { Section, TimeBarApiResponse, TimelineItem } from './types';

/** Flattens the project's document tree (top-level + children) into an id → display-name map. */
export const buildDocNameMap = (docs: ApiDocumentRecord[] | undefined): Map<string, string> => {
  const map = new Map<string, string>();
  if (!Array.isArray(docs)) return map;
  for (const doc of docs) {
    if (doc.fileName) map.set(String(doc.id), displayFileName(doc.fileName));
    doc.children?.forEach((child) => {
      if (child.fileName) map.set(String(child.id), displayFileName(child.fileName));
    });
  }
  return map;
};

// group -> section header metadata, keyed by the API's lowercase group string
const GROUP_SECTION_META: Record<string, { title: string }> = {
  'compensation event': { title: 'COMPENSATION EVENTS' },
  'programme, quality & payment': { title: 'PROGRAMME, QUALITY & PAYMENT' },
  'bonds, warranties & disputes': { title: 'BONDS, WARRANTIES & DISPUTES' },
};

export const mapTimeBarResponseToSections = (
  response: TimeBarApiResponse | undefined,
  docNameById: Map<string, string>
): Section[] => {
  if (!response?.items?.length) return [];

  const itemsByGroup = new Map<string, TimelineItem[]>();

  response.items.forEach((apiItem) => {
    const groupKey = apiItem.group.toLowerCase();
    const isModified = !!apiItem.modifies && apiItem.modifies.trim() !== '';
    // Prefer the actual document name behind the id — the raw `source` field is
    // frequently just the document's storage GUID, which isn't a useful label.
    const resolvedSource =
      (apiItem.projectDocumentId && docNameById.get(apiItem.projectDocumentId)) ||
      apiItem.source ||
      '-';

    const item: TimelineItem = {
      id: apiItem.id,
      clause: apiItem.clause || '-',
      period: apiItem.period || '-',
      who: apiItem.who || '-',
      clockStarts: apiItem.clockStartsWhen || '-',
      source: resolvedSource,
      modifies: apiItem.modifies,
      modified: isModified,
      modifiedTag: isModified ? 'Modified' : undefined,
      sourceRef: apiItem.projectDocumentId
        ? {
            code: apiItem.clause || undefined,
            title: apiItem.period || apiItem.clause || undefined,
            // "What it means" = when the clock starts; overview = backend summary.
            meaning: apiItem.clockStartsWhen || undefined,
            overview: apiItem.documentOverview || undefined,
            badge: isModified ? 'MODIFIED' : undefined,
            documentId: apiItem.projectDocumentId,
            page: typeof apiItem.page === 'number' ? apiItem.page : undefined,
            searchText: toSearchText(apiItem.clockStartsWhen || apiItem.source || apiItem.clause),
            sourceLabel: apiItem.projectDocumentId
              ? docNameById.get(apiItem.projectDocumentId)
              : undefined,
            // This row's own clause + period text disambiguate a clock value that repeats on the page.
            contextHints: [apiItem.clause, apiItem.period].filter(Boolean) as string[],
          }
        : undefined,
    };

    const existing = itemsByGroup.get(groupKey);
    if (existing) {
      existing.push(item);
    } else {
      itemsByGroup.set(groupKey, [item]);
    }
  });

  return Array.from(itemsByGroup.entries()).map(([groupKey, items]) => {
    const meta = GROUP_SECTION_META[groupKey];
    return {
      title: meta?.title ?? groupKey.toUpperCase(),
      items,
    };
  });
};
