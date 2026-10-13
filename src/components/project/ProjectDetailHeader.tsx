import React from 'react';
import type { ProjectDetailSummary } from '@/types/project/selection.types';
import { getStatusConfig } from '@/constants/status.constant';
import { getProjectClassificationLabel } from '@/utils/project-display';
import { MAIN_OPTIONS } from '@/constants/project.constants';
import { parseBackendDate } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isUnset = (v?: string | number | null) =>
  v === null || v === undefined || v === '' || v === 0 || v === '0';

const displayCode = (v?: string | number | null) => (isUnset(v) ? '--' : String(v));

const necFormLabel = (v?: string | number | null) =>
  isUnset(v) ? '--' : getProjectClassificationLabel(v);

const mainOptionLabel = (v?: string | number | null) => {
  if (isUnset(v)) return '--';
  const opt = MAIN_OPTIONS.find((o) => o.id === String(v).toUpperCase());
  return opt ? `${opt.id} — ${opt.label}` : String(v);
};

const formatDate = (v?: string) => {
  if (!v) return '--';
  const d = parseBackendDate(v);
  return !d
    ? '--'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (value?: number, currency?: string) => {
  if (typeof value !== 'number') return '--';
  const code = currency || 'GBP';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  }
};

// ─── Row + Section sub-components ────────────────────────────────────────────
const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-2 border-b border-slate-50 py-1.5 last:border-b-0">
    <span className="text-[11px] font-semibold tracking-wide whitespace-nowrap text-slate-400 uppercase">
      {label}
    </span>
    <span className="min-w-0 text-sm break-words text-slate-700">{value ?? '--'}</span>
  </div>
);

const Section = ({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: React.ReactNode }[];
}) => (
  <div className="flex flex-col">
    <p className="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">{title}</p>
    <div>
      {rows.map((r) => (
        <Row key={r.label} label={r.label} value={r.value} />
      ))}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  project?: ProjectDetailSummary | null;
}

const ProjectDetailHeader: React.FC<Props> = ({ project }) => {
  const statusLabel = getStatusConfig(project?.status)?.label ?? 'Unknown';
  const statusColor = getStatusConfig(project?.status)?.color;

  // green for active, gray otherwise
  const statusCls =
    statusColor === 'green' || statusLabel.toLowerCase() === 'active'
      ? 'text-emerald-600 font-semibold text-sm'
      : 'text-slate-400 font-semibold text-sm';

  const overviewRows = [
    { label: 'Reference ID', value: project?.referenceId || '--' },
    { label: 'NEC Edition', value: displayCode(project?.necEdition) },
    { label: 'NEC Form', value: necFormLabel(project?.necForm) },
    { label: 'Main Option', value: mainOptionLabel(project?.mainOption) },
    { label: 'Secondary Options', value: displayCode(project?.secondaryOptions) },
    { label: 'AI Assistance Mode', value: displayCode(project?.aiAssistenceMode) },
    { label: 'Status', value: statusLabel },
    { label: 'Created On', value: formatDate(project?.createdOn) },
  ];

  const timelineRows = [
    { label: 'Start Date', value: formatDate(project?.startDate) },
    { label: 'Completion Date', value: formatDate(project?.completionDate) },
    { label: 'Defect Date', value: formatDate(project?.defectDate) },
  ];

  const teamRows = [
    { label: 'Employer', value: project?.employer || '--' },
    { label: 'Contractor', value: project?.contractor || '--' },
    { label: 'Project Manager', value: project?.projectManager || '--' },
    { label: 'Supervisor', value: project?.supervisor || '--' },
    { label: 'Site Address', value: project?.siteAddress || '--' },
    { label: 'Postcode', value: project?.postcode || '--' },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className="px-6 py-5">
        {/* Name + Status */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="my-0 text-xl leading-tight font-bold text-slate-900">
            {project?.name || 'Selected Project'}
          </h2>
          <span className={statusCls}>{statusLabel}</span>
        </div>

        {/* Contract Value + Description */}
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Contract Value */}
          <div className="flex flex-col rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
              Contract Value
            </span>
            <span className="mt-1 text-lg font-bold text-emerald-800">
              {formatCurrency(project?.contractValue, project?.currency)}
            </span>
          </div>
          {/* Description */}
          <div className="flex flex-col rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Description
            </span>
            <span className="mt-1 text-sm text-slate-600">{project?.description || '--'}</span>
          </div>
        </div>

        {/* Three-column data grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Section title="Overview" rows={overviewRows} />
          <Section title="Timeline" rows={timelineRows} />
          <Section title="Stakeholders & Site" rows={teamRows} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailHeader;
