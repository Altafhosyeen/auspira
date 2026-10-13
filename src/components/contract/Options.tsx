import { useGetProjectById, useGetProjectOptions } from '@/hooks/modules/project';
import { useProjectStore } from '@/store/project.store';
import { getProjectNecTagConfig } from '@/utils/project-display';
import { MAIN_OPTIONS } from '@/constants/project.constants';
import { MainOptionCode } from '@/constants/enum.constant';
import { toSearchText } from '@/components/document-json-view/shared/toSearchText';
import SourceOverviewDialog, {
  type SourceOverviewData,
} from '@/components/document-json-view/option-source/SourceOverviewDialog';
import { EyeOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import React, { useState } from 'react';

// Icon Components
interface IconProps {
  className?: string;
}

const FlagIcon: React.FC<IconProps> = ({ className = 'h-3 w-3' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M4 2a1 1 0 00-1 1v18a1 1 0 102 0v-6h10l1.24-2.48a1 1 0 000-.84L15 4H5V3a1 1 0 00-1-1zm2 4h7.52l-.76 1.52a1 1 0 000 .84L13.52 11H6V6z" />
  </svg>
);

// Type Definitions
interface AnalysisItem {
  id: number;
  left: {
    title: string;
    subTitle?: string;
    description: string;
    hasEye?: boolean;
    hasTooltip?: boolean;
  };
  right: {
    content: string | React.ReactNode;
    badge?: {
      text: string;
      type: 'blue' | 'orange';
    };
    link?: {
      text: string;
      url: string;
    };
  };
  asWhole: {
    content: string | React.ReactNode;
    badge?: {
      text: string;
      type: 'rose' | 'orange' | 'amber';
    };
    isMuted?: boolean;
  };
  /** Source document the eye action opens, with the content + page + text to highlight. */
  source?: {
    code?: string;
    title?: string;
    overview?: string;
    meaning?: string;
    documentId?: string;
    page?: number;
    searchText?: string;
    /** This option's own code + title — disambiguates a clause value that repeats on the page. */
    contextHints?: string[];
  };
}

/** Shape returned by GET /projects/{id}/options. */
export interface ProjectOption {
  code: string;
  title: string;
  contractText?: string;
  analysis?: string;
  page?: number;
  projectDocumentId?: string;
  projectDocumentUrl?: string;
  analysisStatus?: string;
  statusText?: string;
  /** Human-written overview of the clause; null until the backend generates it. */
  documentOverview?: string | null;
}

type ViewMode = 'side-by-side' | 'as-a-whole';

/** Subset of the project record consumed by the header cards. */
interface ProjectSummary {
  necForm?: number | string | null;
  mainOption?: number | null;
  dispute?: string | null;
  disputes?: string | null;
  secondaryOptions?: number | string | Array<string | number> | null;
  secondaryOptionValues?: Array<string | null> | null;
}

const toDisputeLabel = (project?: ProjectSummary): string => {
  const directDispute =
    (typeof project?.dispute === 'string' && project.dispute.trim()) ||
    (typeof project?.disputes === 'string' && project.disputes.trim());

  if (directDispute) return directDispute;

  return '__';
};

// Fallback items shown when the API returns no options (reference/development data).

const OptionAnalysis: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [dialogData, setDialogData] = useState<SourceOverviewData | null>(null);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  const { data: project } = useGetProjectById<ProjectSummary>({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId && selectedProjectId !== 'new',
  });

  const { data: options } = useGetProjectOptions<ProjectOption[]>(selectedProjectId ?? '');

  // Each option carries the source Conditions of Contract document it was
  // extracted from (`projectDocumentId`) plus the page + clause text. The eye
  // opens the shared source-overview dialog, which shows the option and jumps
  // the PDF to the exact page + highlights the clause text.
  const handleView = (source?: AnalysisItem['source']) => {
    if (!source?.documentId) return;
    setDialogData({
      code: source.code,
      title: source.title,
      overview: source.overview,
      meaning: source.meaning,
      documentId: source.documentId,
      page: source.page,
      searchText: source.searchText,
      contextHints: source.contextHints,
    });
  };

  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // Header card values derived from the project record (fall back to "--" while loading).
  const contractLabel = getProjectNecTagConfig(project?.necForm)?.label ?? '--';
  // Backend `mainOption` is the numeric MainOptionCode; resolve it to its A–F letter first.
  const mainOptionLetter =
    typeof project?.mainOption === 'number' ? MainOptionCode[project.mainOption] : undefined;
  const mainOption = MAIN_OPTIONS.find((o) => o.id === mainOptionLetter);
  const mainOptionLabel = mainOption ? `${mainOption.id} · ${mainOption.label}` : '--';
  const disputeLabel = toDisputeLabel(project);

  // Map API response to AnalysisItem format. Guard against undefined while the query loads.
  const items: AnalysisItem[] = React.useMemo(() => {
    if (!Array.isArray(options)) return [];

    return options.map((option: ProjectOption, index: number) => ({
      id: index + 1,
      left: {
        title: option.code || '',
        subTitle: option.title || '',
        description: option.contractText || '',
        hasEye: true,
        hasTooltip: true,
      },
      right: {
        content: option.analysis || '',
      },
      asWhole: {
        content: `${option.title}. ${option.analysis}`,
      },
      source: {
        code: option.code || undefined,
        title: option.title || undefined,
        // Prefer the backend's written overview; fall back to the verbatim clause text.
        overview: option.documentOverview || option.contractText || undefined,
        meaning: option.analysis || undefined,
        documentId: option.projectDocumentId || undefined,
        page: typeof option.page === 'number' ? option.page : undefined,
        // Prefer the verbatim contract text for a precise PDF match; fall back to the title.
        searchText: toSearchText(option.contractText || option.title),
        // This option's own code + title disambiguate a value (a sum, a date) that
        // appears more than once on the page — the PDF highlighter ranks the
        // occurrence nearest them above any other.
        contextHints: [option.code, option.title].filter(Boolean) as string[],
      },
    }));
  }, [options]);

  return (
    <div className="mx-auto space-y-6">
      {/* Top Cards Header Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {/* Card 1: Contract */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 shadow-sm lg:col-span-4">
          <span className="ds-micro! font-bold! tracking-wider text-emerald-600 uppercase">
            Contract
          </span>
          <div className="ds-heading-3! text-text mt-1 font-bold!">{contractLabel}</div>
        </div>

        {/* Card 2: Main Option */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 shadow-sm lg:col-span-4">
          <span className="ds-micro! font-bold! tracking-wider text-emerald-600 uppercase">
            Main Option
          </span>
          <div className="ds-heading-3! text-text mt-1 font-bold!">{mainOptionLabel}</div>
        </div>

        {/* Card 3: Disputes */}
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm lg:col-span-2">
          <span className="ds-micro! font-bold! tracking-wider text-slate-700 uppercase">
            Disputes
          </span>
          <div className="ds-heading-3! text-text mt-1 font-bold!">{disputeLabel}</div>
        </div>
      </div>

      {/* Segment Header and Tab Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="ds-caption! mr-2 font-semibold! text-slate-700">View</span>

          {/* View toggle — Ant Design Segmented, styled to keep the navy selected state */}
          <Segmented<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: 'Side by side', value: 'side-by-side' },
              { label: 'As a whole', value: 'as-a-whole' },
            ]}
            className="ds-caption! [&_.ant-segmented-item-selected]:bg-main-p! font-semibold! [&_.ant-segmented-item-selected]:text-white!"
          />
        </div>
      </div>

      {/* Render based on view mode state */}
      {viewMode === 'side-by-side' ? (
        <>
          {/* Side by Side Row Descriptors */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="ds-micro! pl-1 font-bold! tracking-wider text-slate-700 uppercase">
              Selected - what the contract says
            </div>
            <div className="ds-micro! hidden pl-1 font-bold! tracking-wider text-slate-700 uppercase lg:block">
              Analysis - what it means for you
            </div>
          </div>

          {/* Side by Side Grid Layout */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Left Card */}
                <div className="relative flex flex-col justify-between rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="ds-body-strong! text-text space-x-1.5">
                        <span>{item.left.title}</span>
                        {item.left.subTitle && (
                          <span className="font-normal! text-slate-700">{item.left.subTitle}</span>
                        )}
                      </div>
                      {item.left.hasEye && (
                        <div className="relative">
                          <button
                            onClick={() => handleView(item.source)}
                            onMouseEnter={() => item.left.hasTooltip && setActiveTooltip(item.id)}
                            onMouseLeave={() => item.left.hasTooltip && setActiveTooltip(null)}
                            disabled={!item.source?.documentId}
                            className="cursor-pointer text-slate-700 hover:text-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <EyeOutlined />
                          </button>

                          {/* Hover Tooltip */}
                          {item.left.hasTooltip && activeTooltip === item.id && (
                            <div className="absolute bottom-full left-[-20px] z-30 mb-3 w-72 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                              <h4 className="ds-body! text-main-p font-bold!">
                                {item.left.title} - {item.left.subTitle}
                              </h4>
                              <p className="ds-caption! text-main-p mt-1">
                                Contractor paid the lump sum for each completed activity when
                                clicked will be redirected to document overview screen.
                              </p>
                              {/* Pointer Downward Arrow */}
                              <div className="absolute -bottom-[5px] left-[22px] h-2.5 w-2.5 rotate-45 border-r border-b border-slate-100 bg-white"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="ds-caption! mt-3 text-slate-500">{item.left.description}</p>
                  </div>
                </div>

                {/* Right Card */}
                <div className="flex flex-col justify-between rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div>
                    <p className="ds-caption! text-slate-600">{item.right.content}</p>
                    {(item.right.badge || item.right.link) && (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {item.right.badge && (
                          <div
                            className={`ds-micro! flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold! tracking-wide ${
                              item.right.badge.type === 'orange'
                                ? 'border border-orange-100 bg-orange-50 text-orange-600'
                                : 'border border-blue-100 bg-blue-50 text-blue-600'
                            }`}
                          >
                            <FlagIcon />
                            {item.right.badge.text}
                          </div>
                        )}
                        {item.right.link && (
                          <a
                            href={item.right.link.url}
                            className="ds-caption! font-medium! text-blue-500 hover:text-blue-600 hover:underline"
                          >
                            → {item.right.link.text}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* As a Whole Unified View (with overflow-hidden removed to allow tooltips to overlap) */
        <div className="rounded-lg border border-slate-100 bg-white shadow-sm">
          {/* Header Row */}
          <div className="ds-micro! grid grid-cols-12 gap-4 rounded-t-lg border-b border-slate-100 bg-slate-100/80 px-6 py-3.5 font-bold! tracking-wider text-slate-500 uppercase">
            <div className="col-span-2 sm:col-span-1">Option</div>
            <div className="col-span-10 pl-4 sm:col-span-11">What it is + Analysis</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100/70">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/40 ${
                  index === items.length - 1 ? 'rounded-b-lg' : ''
                }`}
              >
                {/* Column 1: Option key */}
                <div className="ds-body-strong! text-text col-span-2 sm:col-span-1">
                  {item.left.title}
                </div>

                {/* Column 2: Content & Badges */}
                <div className="col-span-10 flex flex-col justify-between gap-4 pl-4 sm:col-span-11 sm:flex-row sm:items-center">
                  {/* Analysis Content */}
                  <div
                    className={`ds-body! ${
                      item.asWhole.isMuted
                        ? 'font-normal! text-slate-700'
                        : 'font-medium! text-slate-600'
                    }`}
                  >
                    {item.asWhole.content}
                  </div>

                  {/* Badges + Eye Hover Action */}
                  <div className="ml-auto flex shrink-0 items-center justify-end gap-5 sm:ml-0">
                    {item.asWhole.badge && (
                      <span
                        className={`ds-micro! rounded border px-2 py-0.5 font-bold! tracking-wide uppercase ${
                          item.asWhole.badge.type === 'rose'
                            ? 'border-rose-100 bg-rose-50 text-rose-500'
                            : item.asWhole.badge.type === 'orange'
                              ? 'border-amber-200 bg-amber-50 text-amber-600'
                              : 'border-amber-100 bg-amber-50/70 text-amber-500'
                        }`}
                      >
                        {item.asWhole.badge.text}
                      </span>
                    )}

                    {/* Eye tooltip container */}
                    {item.left.hasEye && (
                      <div className="relative">
                        <button
                          onClick={() => handleView(item.source)}
                          onMouseEnter={() => item.left.hasTooltip && setActiveTooltip(item.id)}
                          onMouseLeave={() => item.left.hasTooltip && setActiveTooltip(null)}
                          disabled={!item.source?.documentId}
                          className="flex cursor-pointer items-center text-slate-700 hover:text-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <EyeOutlined className="ds-body-large!" />
                        </button>

                        {/* Interactive Tooltip in "As a whole" mode */}
                        {item.left.hasTooltip && activeTooltip === item.id && (
                          <div className="absolute right-[-8px] bottom-full z-50 mb-3 w-80 rounded-lg border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                            <h4 className="ds-body! text-main-p font-bold!">
                              {item.left.title} - {item.left.subTitle}
                            </h4>
                            <p className="ds-caption! mt-2 text-slate-500">
                              Priced + activity schedule. CEs on Defined Cost + Fee; partial
                              activities unpaid when clicked will be redirected to document overview
                              screen.
                            </p>
                            {/* Pointer Downward Arrow */}
                            <div className="absolute right-[12px] -bottom-[5px] h-2.5 w-2.5 rotate-45 border-r border-b border-slate-100 bg-white"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SourceOverviewDialog
        open={!!dialogData}
        onClose={() => setDialogData(null)}
        kind="option"
        projectId={selectedProjectId ?? ''}
        data={dialogData}
      />
    </div>
  );
};

export default OptionAnalysis;
