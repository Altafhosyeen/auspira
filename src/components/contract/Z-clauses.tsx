'use client';

import React, { useMemo, useState } from 'react';
import { Table, Input, Tag, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Eye } from 'lucide-react';
import { useGetZClausesInfinite } from '@/hooks/modules/contract-registery';
import { useProjectStore } from '@/store/project.store';
import InfiniteScrollDiv from '@/components/shared/InfiniteScrollDiv/InfiniteScrollDiv';
import { EmptyState } from '@/components/shared/EmptyState';
import { ExpandableText } from '@/components/document-json-view/shared/ExpandableText';
import { toSearchText } from '@/components/document-json-view/shared/toSearchText';
import SourceOverviewDialog, {
  type SourceOverviewData,
} from '@/components/document-json-view/option-source/SourceOverviewDialog';

// Define the interface for our table data row
interface ZClauseData {
  key: string;
  zCode: string;
  title: string;
  changes: string;
  category: string;
  modifies: string;
  /** The API's own impact rating. Null until the backend rates the clause. */
  impact: string | null;
  /** Drives the High-Impact filter. Derived, because `impact` is not yet populated. */
  isHighImpact: boolean;
  isTimebar: boolean;
  /** Source document + content the eye action opens, with the text to highlight. */
  source: {
    code?: string;
    title?: string;
    overview?: string;
    meaning?: string;
    badge?: string;
    documentId?: string;
    page?: number;
    searchText?: string;
    /** This clause's own number + title — disambiguates a value that repeats on the page. */
    contextHints?: string[];
  };
}

// Clauses describing notice/response deadlines are treated as "modifies a time bar"
const TIMEBAR_KEYWORDS = ['time bar', 'notice', 'deadline', 'within', 'days of'];

/** Badge tone per clause category. Anything unrecognised stays neutral. */
const CATEGORY_BADGE: Record<string, string> = {
  amendment: 'badge-info!',
  new: 'badge-accent!',
  'environmental liability': 'badge-warning!',
  'community relations': 'badge-info!',
  'branding compliance': 'badge-success!',
};

/**
 * Badge tone per impact rating. The API sends free text, so match on the word
 * rather than an exact enum; unrecognised ratings still render, just neutral.
 */
const impactBadge = (impact: string): string => {
  const value = impact.toLowerCase();
  if (value.includes('high')) return 'badge-error!';
  if (value.includes('medium') || value.includes('moderate')) return 'badge-warning!';
  if (value.includes('low')) return 'badge-success!';
  return 'badge-neutral!';
};

// Shape returned by GET /api/zclauses?ProjectId={id}
export interface ApiZClause {
  id: string;
  number: string;
  title: string;
  description: string;
  category: 'Amendment' | 'New' | string;
  reference?: string | null;
  /** Impact rating. Currently null on every clause the API returns. */
  impact?: string | null;
  page?: number | null;
  createdOn?: string;
  projectDocumentUrl?: string | null;
  projectDocumentId?: string | null;
  /** Human-written overview of the clause; null until the backend generates it. */
  documentOverview?: string | null;
}

function mapApiClauseToRow(clause: ApiZClause): ZClauseData {
  const description = clause.description?.toLowerCase() ?? '';
  return {
    key: clause.id,
    zCode: clause.number,
    title: clause.title,
    changes: clause.description,
    category: clause.category,
    modifies: clause.reference || (clause.page ? `p${clause.page}` : '— new'),
    impact: clause.impact?.trim() || null,
    isHighImpact: clause.category === 'Amendment',
    isTimebar: TIMEBAR_KEYWORDS.some((keyword) => description.includes(keyword)),
    source: {
      code: clause.number || undefined,
      title: clause.title || undefined,
      // "What it changes" = the clause description; the overview is the backend's summary.
      meaning: clause.description || undefined,
      overview: clause.documentOverview || undefined,
      // Show the impact rating as the header tag; fall back to HIGH-IMPACT for amendments.
      badge:
        clause.impact?.trim().toUpperCase() ||
        (clause.category === 'Amendment' ? 'HIGH-IMPACT' : undefined),
      documentId: clause.projectDocumentId || undefined,
      page: typeof clause.page === 'number' ? clause.page : undefined,
      // Search using clause number + first part of title for reliable PDF matching.
      searchText:
        clause.number && clause.title
          ? `${clause.number} ${clause.title}`.slice(0, 120)
          : toSearchText(clause.title || clause.description),
    },
  };
}

export default function ZClausesTable() {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const [activeFilter, setActiveFilter] = useState<'all' | 'timebar' | 'high-impact'>('all');
  const [searchText, setSearchText] = useState('');
  const [dialogData, setDialogData] = useState<SourceOverviewData | null>(null);

  // Open the shared source-overview dialog (same component as the Options tab)
  // at the clause's page with its text highlighted.
  const handleView = (source: ZClauseData['source']) => {
    if (!source.documentId) return;
    setDialogData({
      code: source.code,
      title: source.title,
      overview: source.overview,
      meaning: source.meaning,
      badge: source.badge,
      documentId: source.documentId,
      page: source.page,
      searchText: source.searchText,
      contextHints: source.contextHints,
    });
  };

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetZClausesInfinite<ApiZClause>({
      id: selectedProjectId ?? '',
      enabled: !!selectedProjectId,
    });

  const tableData = useMemo<ZClauseData[]>(
    () => (data?.pages ?? []).flatMap((page) => page.items).map(mapApiClauseToRow),
    [data]
  );

  const totalCount = data?.pages[0]?.meta.totalCount ?? tableData.length;

  const timebarCount = useMemo(
    () => tableData.filter((item) => item.isTimebar).length,
    [tableData]
  );
  const highImpactCount = useMemo(
    () => tableData.filter((item) => item.isHighImpact).length,
    [tableData]
  );

  // Filtering Logic
  const filteredData = tableData.filter((item) => {
    // Search text filter
    if (
      searchText &&
      !item.title.toLowerCase().includes(searchText.toLowerCase()) &&
      !item.zCode.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }
    // Pill category filter
    if (activeFilter === 'high-impact') {
      return item.isHighImpact;
    }
    if (activeFilter === 'timebar') {
      return item.isTimebar;
    }
    return true;
  });

  // const renderClauseTooltip = (record: ZClauseData) => (
  //   <div className="max-w-[280px] p-3 text-xs">
  //     <div className="mb-1 font-semibold text-[#1e3a8a]">
  //       {record.zCode} - {record.title}
  //     </div>
  //     <div className="leading-normal text-slate-600">{record.changes}</div>
  //   </div>
  // );

  const columns: ColumnsType<ZClauseData> = [
    {
      title: <span className="block whitespace-nowrap">CLAUSES</span>,
      dataIndex: 'zCode',
      key: 'zCode',
      width: '8%',
      render: (text) => (
        <span className="ds-body! text-text font-bold! wrap-break-word">{text}</span>
      ),
    },
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      width: '18%',
      render: (text) => <span className="ds-body-strong! text-text wrap-break-word">{text}</span>,
    },
    {
      title: 'WHAT IT CHANGES',
      dataIndex: 'changes',
      key: 'changes',
      width: '30%',
      render: (text) => (
        <ExpandableText lines={2} className="ds-body! text-slate-600">
          {text}
        </ExpandableText>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      width: '20%',
      render: (category: string) => (
        <div className="inline-block w-full overflow-hidden">
          <Tag
            className={`ds-micro! inline-block max-w-full rounded border-none px-2 py-0.5 font-bold! tracking-wider wrap-break-word ${
              CATEGORY_BADGE[category?.toLowerCase()] ?? 'badge-neutral!'
            }`}
          >
            {category?.toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'IMPACT',
      dataIndex: 'impact',
      key: 'impact',
      width: '12%',
      render: (impact: string | null) =>
        impact ? (
          <Tag
            className={`ds-micro! rounded border-none px-2 py-0.5 font-bold! tracking-wider wrap-break-word ${impactBadge(impact)}`}
          >
            {impact.toUpperCase()}
          </Tag>
        ) : (
          // The API has not rated this clause — say so rather than invent a rating.
          <span className="ds-caption! text-slate-700">—</span>
        ),
    },
    // {
    //   title: 'MODIFIES',
    //   dataIndex: 'modifies',
    //   key: 'modifies',
    //   width: '10%',
    //   render: (text) => <span className="font-mono text-[12px] text-slate-700">{text}</span>,
    // },
    {
      title: '',
      key: 'action',
      width: '5%',
      align: 'center',
      render: (_, record) => (
        <button
          type="button"
          onClick={() => handleView(record.source)}
          disabled={!record.source.documentId}
          title="View source clause"
          className="flex cursor-pointer justify-center text-slate-700 transition-colors hover:text-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-surface-subtle font-sans">
      <div className="">
        {/* Main Card container */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          {/* Controls Bar */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            {/* Filter Pills */}
            <div className="ds-caption! flex items-center gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-surface-dark text-white!'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All · {totalCount}
              </button>
              <button
                onClick={() => setActiveFilter('timebar')}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  activeFilter === 'timebar'
                    ? 'bg-surface-dark text-white!'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Modifies a time bar · {timebarCount}
              </button>
              <button
                onClick={() => setActiveFilter('high-impact')}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  activeFilter === 'high-impact'
                    ? 'bg-surface-dark text-white!'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                High-Impact · {highImpactCount}
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search Z-clauses..."
                prefix={<Search className="mr-1 text-slate-700" size={14} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="ds-caption! rounded-lg border-slate-200 py-1.5 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Table Container */}
          <InfiniteScrollDiv
            className="max-h-[600px] overflow-x-auto overflow-y-auto"
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={false}
              sticky
              className="custom-antd-table"
              rowClassName="hover:bg-surface-subtle transition-colors duration-150"
              locale={{
                emptyText: searchText ? (
                  <EmptyState
                    title="No Z-clauses found"
                    description={`No Z-clauses match "${searchText}". Try a different search term.`}
                  />
                ) : (
                  <EmptyState
                    title="No Z-clauses in this category"
                    description="Try selecting a different filter."
                  />
                ),
              }}
            />
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Spin size="small" />
              </div>
            )}
          </InfiniteScrollDiv>
        </div>
      </div>

      <SourceOverviewDialog
        open={!!dialogData}
        onClose={() => setDialogData(null)}
        kind="zclause"
        projectId={selectedProjectId ?? ''}
        data={dialogData}
      />
    </div>
  );
}
