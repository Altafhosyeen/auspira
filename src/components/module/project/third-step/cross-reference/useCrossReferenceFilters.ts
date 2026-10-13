'use client';

import { useMemo, useState } from 'react';
import type { Finding, SortOption, StatusFilter, ViewMode } from './types';
import { formatFieldKey } from './utils';

/** Bucket label used when grouping findings for the grid/list sections. */
const STATUS_LABEL: Record<Finding['type'] | 'resolved', string> = {
  error: 'Error',
  warning: 'Warning',
  passed: 'Passed',
  resolved: 'Resolved',
};

const severityOrder: Record<Finding['type'], number> = {
  error: 0,
  warning: 1,
  passed: 2,
};

/** Toolbar defaults — the state Reset returns to, and the baseline for "any filter active". */
const DEFAULT_SEARCH_TERM = '';
const DEFAULT_SORT_BY: SortOption = 'title';
const DEFAULT_STATUS_FILTER: StatusFilter = 'all';
const DEFAULT_DOCUMENT_FILTER = 'all';

interface UseCrossReferenceFiltersArgs<T extends Finding> {
  /** Findings to filter — already narrowed by any screen-specific filter (e.g. the contract KPI row). */
  findings: T[];
  /** Local-then-API resolution state, keyed by finding id. */
  resolvedValues: Record<string, string | undefined>;
  /** Local-then-API contract-route flags, keyed by finding id. */
  contractRoutes: Record<string, boolean | undefined>;
  /** Layout the screen opens in. Defaults to the card grid. */
  initialView?: ViewMode;
}

/**
 * Search / filter / sort / group state shared by the two cross-reference screens
 * (project onboarding step 3 and the Contract Registry tab) so both offer the same
 * toolbar controls and produce identically ordered grid and list views.
 *
 * Returns `toolbarProps` ready to spread onto `<CrossReferenceToolbar />`.
 */
export function useCrossReferenceFilters<T extends Finding>({
  findings,
  resolvedValues,
  contractRoutes,
  initialView = 'grid',
}: UseCrossReferenceFiltersArgs<T>) {
  const [searchTerm, setSearchTerm] = useState(DEFAULT_SEARCH_TERM);
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT_BY);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(DEFAULT_STATUS_FILTER);
  const [documentFilter, setDocumentFilter] = useState(DEFAULT_DOCUMENT_FILTER);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [showUnresolvedOnly, setShowUnresolvedOnly] = useState(false);
  const [showContractRouteOnly, setShowContractRouteOnly] = useState(false);
  const [view, setView] = useState<ViewMode>(initialView);

  const documentOptions = useMemo(
    () => Array.from(new Set(findings.flatMap((f) => f.associatedDocs))).sort(),
    [findings]
  );

  const filteredFindings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return findings.filter((finding) => {
      const isResolved = !!(resolvedValues[finding.id] ?? finding.resolvedValue);

      if (showErrorsOnly && finding.type !== 'error') return false;
      if (statusFilter === 'resolved' && !isResolved) return false;
      if (
        statusFilter !== 'all' &&
        statusFilter !== 'resolved' &&
        (finding.type !== statusFilter || isResolved)
      )
        return false;
      if (documentFilter !== 'all' && !finding.associatedDocs.includes(documentFilter))
        return false;
      if (showUnresolvedOnly && isResolved) return false;
      if (showContractRouteOnly && !(contractRoutes[finding.id] ?? finding.isContractRoute))
        return false;

      if (!term) return true;

      const haystack = [
        finding.title,
        finding.category,
        // Both forms: the raw key still matches a pasted `CONTRACTOR_ENTITY_NAME`, the
        // formatted one matches what the card and drawer actually print.
        finding.field,
        formatFieldKey(finding.field),
        finding.statusLabel,
        resolvedValues[finding.id],
        finding.type,
        ...(Array.isArray(finding.description) ? finding.description : [finding.description]),
        ...(finding.sources ?? []).flatMap((source) => [
          source.docName,
          source.value,
          source.page,
          source.clause,
        ]),
        ...finding.associatedDocs,
        // File names of the source documents, so searching one matches the finding.
        ...(finding.documents ?? []),
      ];

      return haystack.some((entry) => entry?.toLowerCase().includes(term));
    });
  }, [
    findings,
    resolvedValues,
    searchTerm,
    showErrorsOnly,
    statusFilter,
    documentFilter,
    showContractRouteOnly,
    showUnresolvedOnly,
    contractRoutes,
  ]);

  const sortedFindings = useMemo(() => {
    return [...filteredFindings].sort((a, b) => {
      const resolvedA = !!(resolvedValues[a.id] ?? a.resolvedValue);
      const resolvedB = !!(resolvedValues[b.id] ?? b.resolvedValue);

      if (sortBy === 'severity') {
        return severityOrder[a.type] - severityOrder[b.type] || a.title.localeCompare(b.title);
      }

      if (sortBy === 'unresolved') {
        if (resolvedA !== resolvedB) return resolvedA ? 1 : -1;
        return severityOrder[a.type] - severityOrder[b.type];
      }

      if (sortBy === 'sources') {
        return (
          (b.sources?.length ?? 0) - (a.sources?.length ?? 0) || a.title.localeCompare(b.title)
        );
      }

      return a.title.localeCompare(b.title);
    });
  }, [filteredFindings, resolvedValues, sortBy]);

  // Both views are grouped by status (Errors / Warnings / Passed / Resolved) so the
  // grid and the list present findings in the same order.
  const groupedFindings = useMemo(() => {
    const buckets = new Map<string, T[]>();

    for (const finding of sortedFindings) {
      const resolved = !!(resolvedValues[finding.id] ?? finding.resolvedValue);
      const key = resolved ? 'Resolved' : STATUS_LABEL[finding.type];

      const bucket = buckets.get(key) ?? [];
      bucket.push(finding);
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries());
  }, [resolvedValues, sortedFindings]);

  /** Empty-state copy that reflects whether a search term is narrowing the results. */
  const emptyText = searchTerm.trim()
    ? `No matches for "${searchTerm.trim()}".`
    : 'No findings match your filters.';

  /** True when anything is narrowing the list — gates the Reset button. */
  const filtersDirty =
    searchTerm !== DEFAULT_SEARCH_TERM ||
    sortBy !== DEFAULT_SORT_BY ||
    statusFilter !== DEFAULT_STATUS_FILTER ||
    documentFilter !== DEFAULT_DOCUMENT_FILTER ||
    showErrorsOnly ||
    showUnresolvedOnly ||
    showContractRouteOnly;

  /** Clears every filter, search and sort. `view` is a layout choice, so it survives. */
  const resetFilters = () => {
    setSearchTerm(DEFAULT_SEARCH_TERM);
    setSortBy(DEFAULT_SORT_BY);
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setDocumentFilter(DEFAULT_DOCUMENT_FILTER);
    setShowErrorsOnly(false);
    setShowUnresolvedOnly(false);
    setShowContractRouteOnly(false);
  };

  const toolbarProps = {
    searchTerm,
    onSearchTermChange: setSearchTerm,
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    documentFilter,
    onDocumentFilterChange: setDocumentFilter,
    documentOptions,
    sortBy,
    onSortByChange: setSortBy,
    showErrorsOnly,
    onShowErrorsOnlyChange: setShowErrorsOnly,
    showUnresolvedOnly,
    onShowUnresolvedOnlyChange: setShowUnresolvedOnly,
    showContractRouteOnly,
    onShowContractRouteOnlyChange: setShowContractRouteOnly,
    filtersDirty,
    onResetFilters: resetFilters,
    view,
    onViewChange: setView,
  };

  return {
    toolbarProps,
    view,
    searchTerm,
    emptyText,
    filtersDirty,
    resetFilters,
    documentOptions,
    filteredFindings,
    sortedFindings,
    groupedFindings,
  };
}
