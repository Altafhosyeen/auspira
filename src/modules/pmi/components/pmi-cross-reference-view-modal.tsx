'use client';

import {
  CheckCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  FileSearchOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Modal, Skeleton, Typography } from 'antd';
import type {
  ProjectCrossReference,
  ProjectCrossReferenceKeyValue,
} from '@/components/module/project/third-step/cross-reference/types';
import { ProjectKeyCategory, ProjectKeyStatus } from '@/constants/enum.constant';
import { useGetCrossReferenceById } from '@/hooks/modules/cross-reference';
import { getDocumentTypeDisplayName } from '@/lib/utils/document.type.code';

interface PmiCrossReferenceViewModalProps {
  open: boolean;
  projectCrossReferenceId: string | null;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<number, string> = {
  [ProjectKeyCategory.None]: 'General',
  [ProjectKeyCategory.Quantitative]: 'Quantitative',
  [ProjectKeyCategory.Qualitative]: 'Qualitative',
  [ProjectKeyCategory.Date]: 'Date',
};

const STATUS_LABELS: Record<number, string> = {
  [ProjectKeyStatus.None]: 'Not evaluated',
  [ProjectKeyStatus.Passed]: 'Passed',
  [ProjectKeyStatus.Warning]: 'Warning',
  [ProjectKeyStatus.Failed]: 'Failed',
  [ProjectKeyStatus.NeedsReview]: 'Needs review',
  [ProjectKeyStatus.Resolved]: 'Resolved',
};

/** Tone the header strip, status chip and accent border take — keyed off the record's status. */
const STATUS_TONE: Record<
  number,
  { bg: string; fg: string; border: string; icon: typeof CheckCircleFilled }
> = {
  [ProjectKeyStatus.None]: {
    bg: 'bg-slate-50',
    fg: 'text-slate-600',
    border: 'border-slate-200',
    icon: InfoCircleOutlined,
  },
  [ProjectKeyStatus.Passed]: {
    bg: 'badge-success',
    fg: 'text-badge-success',
    border: 'border-badge-success',
    icon: CheckCircleFilled,
  },
  [ProjectKeyStatus.Resolved]: {
    bg: 'badge-success',
    fg: 'text-badge-success',
    border: 'border-badge-success',
    icon: CheckCircleFilled,
  },
  [ProjectKeyStatus.Warning]: {
    bg: 'badge-warning',
    fg: 'text-badge-warning',
    border: 'border-badge-warning',
    icon: ExclamationCircleFilled,
  },
  [ProjectKeyStatus.NeedsReview]: {
    bg: 'badge-warning',
    fg: 'text-badge-warning',
    border: 'border-badge-warning',
    icon: ExclamationCircleFilled,
  },
  [ProjectKeyStatus.Failed]: {
    bg: 'badge-error',
    fg: 'text-badge-error',
    border: 'border-badge-error',
    icon: ExclamationCircleFilled,
  },
};

const DEFAULT_TONE = STATUS_TONE[ProjectKeyStatus.None];

/** Initials for the "resolved by" avatar, e.g. "Altaf Hussain" → "AH". */
const initials = (fullName: string): string =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Typography.Text
      type="secondary"
      className="ds-micro! font-semibold! tracking-wide text-slate-400 uppercase"
    >
      {label}
    </Typography.Text>
    <div className="mt-1.5">{children}</div>
  </div>
);

/** One row of the source-values comparison — the document a value was extracted from, and where. */
const SourceValueRow = ({
  source,
  isAgreedValue,
}: {
  source: ProjectCrossReferenceKeyValue;
  isAgreedValue: boolean;
}) => (
  <div
    className={`flex items-start gap-3 rounded-lg border p-3 ${
      isAgreedValue ? 'border-badge-success bg-badge-success/10' : 'border-slate-200 bg-white'
    }`}
  >
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
      <FileTextOutlined className="text-slate-500" />
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <Typography.Text
          strong
          className="ds-caption! wrap-break-word text-slate-900"
          title={source.value}
        >
          {source.value}
        </Typography.Text>
        {isAgreedValue && (
          <span className="badge-success ds-micro! inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-semibold">
            <CheckCircleFilled />
            Agreed
          </span>
        )}
      </div>
      <Typography.Text className="ds-micro! mt-0.5 block text-slate-400">
        {getDocumentTypeDisplayName(source.documentType)} · {source.reference}
        {source.page ? ` · Page ${source.page}` : ''}
      </Typography.Text>
    </div>
  </div>
);

// Read-only view of a single cross-reference record — fetched straight from
// GET /api/project-cross-references/{projectCrossReferenceId}, independent of the
// grouped findings list the Contract Registry tab uses. Opened from the PMI register's
// "View Cross Reference" action so a PM can see what the PMI was raised over without
// leaving the register.
const PmiCrossReferenceViewModal = ({
  open,
  projectCrossReferenceId,
  onClose,
}: PmiCrossReferenceViewModalProps) => {
  const { data, isFetching, isError } = useGetCrossReferenceById<ProjectCrossReference>({
    projectCrossReferenceId: projectCrossReferenceId ?? '',
    enabled: open && !!projectCrossReferenceId,
  });

  const tone = data ? (STATUS_TONE[data.projectKeyStatus] ?? DEFAULT_TONE) : DEFAULT_TONE;
  const StatusIcon = tone.icon;
  const sources = data?.projectCrossReferenceKeyValues ?? [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={600}
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
    >
      {/* Header — tone follows the record's status once it loads, neutral while pending.
          The close button lives in this flex row (not antd's absolutely-positioned
          default) so it never overlaps the coloured strip. */}
      <div
        className={`flex items-start gap-3 rounded-t-lg border-b px-6 py-5 ${tone.bg} ${tone.border}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70">
          <FileSearchOutlined className={`text-lg ${tone.fg}`} />
        </span>
        <div className="min-w-0 flex-1">
          <Typography.Text className="ds-micro! block font-bold! tracking-wider text-slate-500 uppercase">
            Cross Reference
          </Typography.Text>
          <Typography.Text strong className="ds-heading-4! block truncate" title={data?.label}>
            {isFetching ? 'Loading…' : data?.label || data?.key || 'Untitled data point'}
          </Typography.Text>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-700"
        >
          <CloseOutlined />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {isFetching ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : isError || !data ? (
          <div className="badge-error flex items-center gap-2 rounded-lg px-4 py-3">
            <ExclamationCircleFilled className="text-badge-error" />
            <Typography.Text className="text-badge-error!">
              Could not load this cross-reference. Please try again.
            </Typography.Text>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Status row — the three at-a-glance chips, aligned in one strip. */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`ds-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${tone.bg} ${tone.fg}`}
              >
                <StatusIcon />
                {STATUS_LABELS[data.projectKeyStatus] ?? 'Unknown'}
              </span>
              <span className="badge-neutral ds-caption inline-flex items-center rounded-full px-3 py-1 font-semibold">
                {CATEGORY_LABELS[data.projectKeyCategory] ?? 'General'}
              </span>
              {data.isContractRoute && (
                <span className="badge-info ds-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold">
                  <CheckCircleFilled />
                  Contract route
                </span>
              )}
            </div>

            {/* Agreed / extracted value — the single most-referenced field, so it gets its
                own card rather than sitting flush with the other text fields. */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Typography.Text className="ds-micro! block font-semibold! tracking-wide text-slate-400 uppercase">
                Agreed Value
              </Typography.Text>
              <Typography.Text
                strong
                className="ds-body! mt-1 block wrap-break-word text-slate-900"
              >
                {data.value || '—'}
              </Typography.Text>
            </div>

            {data.description && (
              <Field label="Description">
                <Typography.Paragraph className="ds-caption! mb-0! text-slate-600">
                  {data.description}
                </Typography.Paragraph>
              </Field>
            )}

            {data.errorMessage && (
              <div className="badge-error flex gap-2.5 rounded-lg px-4 py-3">
                <ExclamationCircleFilled className="text-badge-error mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <Typography.Text className="ds-caption! text-badge-error! block font-bold!">
                    Conflict detected
                  </Typography.Text>
                  <Typography.Text className="ds-caption! text-badge-error! mt-0.5 block">
                    {data.errorMessage}
                  </Typography.Text>
                </div>
              </div>
            )}

            {/* Source values — every value the extraction found, by document, so the PM
                can see exactly what disagreed without opening each document in turn. */}
            {sources.length > 0 && (
              <Field label={`Found in ${sources.length} document${sources.length > 1 ? 's' : ''}`}>
                <div className="flex flex-col gap-2">
                  {sources.map((source) => (
                    <SourceValueRow
                      key={source.id}
                      source={source}
                      isAgreedValue={!!data.value && source.value === data.value}
                    />
                  ))}
                </div>
              </Field>
            )}

            {(data.resolvedBy || data.resolvedAt) && (
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="bg-main-p flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {data.resolvedBy ? initials(data.resolvedBy.fullName) : <CheckCircleFilled />}
                </span>
                <div className="min-w-0">
                  <Typography.Text className="ds-caption! block font-semibold! text-slate-700">
                    {data.resolvedBy ? `Resolved by ${data.resolvedBy.fullName}` : 'Resolved'}
                  </Typography.Text>
                  {data.resolvedAt && (
                    <Typography.Text className="ds-micro! block text-slate-400">
                      {formatDateTime(data.resolvedAt)}
                    </Typography.Text>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PmiCrossReferenceViewModal;
