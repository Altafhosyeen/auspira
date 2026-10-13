'use client';

import { Tooltip } from 'antd';
import { FileText } from 'lucide-react';
import type React from 'react';
import { CheckIcon, ChevronRightIcon, InstructionIcon, MailIcon } from './icons';
import type { Finding } from './types';
import { ValueTagList } from './ValueTagList';

interface DataPointTableProps {
  findings: Finding[];
  selectedId: string | null;
  resolvedValues: Record<string, string | undefined>;
  emptyText?: React.ReactNode;
  /**
   * Contract-route flags and Email/Thread actions are only wired up by the Contract Registry's
   * cross-reference screen (`CrossReferenceContract.tsx`) — the project-onboarding step omits
   * these props entirely so no Email affordance shows there (no mailbox wiring at that stage).
   */
  contractRoutes?: Record<string, boolean | undefined>;
  onEmail?: (findingId: string) => void;
  onViewThread?: (findingId: string) => void;
  /** Navigates to the PMI raised from a finding; shown when `finding.projectManagerInstructionId` is set. */
  onViewPmi?: (projectManagerInstructionId: string) => void;
  onRowClick: (findingId: string) => void;
}

type Tone = Finding['type'];
type StatusKey = Tone | 'resolved';

const STATUS_BADGE: Record<StatusKey, string> = {
  error: 'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-700',
  passed: 'bg-emerald-50 text-emerald-600',
  resolved: 'bg-emerald-50 text-emerald-700',
};

const STATUS_LABEL: Record<StatusKey, string> = {
  error: 'Error',
  warning: 'Warning',
  passed: 'Passed',
  resolved: 'Resolved',
};

/** Row left-edge accent + icon-box tone, keyed the same way as the status badge. */
const STATUS_BORDER: Record<StatusKey, string> = {
  error: 'border-l-red-500',
  warning: 'border-l-amber-400',
  passed: 'border-l-emerald-400',
  resolved: 'border-l-emerald-400',
};

const STATUS_ICON_STYLE: Record<StatusKey, { bg: string; fg: string }> = {
  error: { bg: 'bg-red-50', fg: 'text-red-400' },
  warning: { bg: 'bg-amber-50', fg: 'text-amber-600' },
  passed: { bg: 'bg-emerald-50', fg: 'text-emerald-600' },
  resolved: { bg: 'bg-emerald-50', fg: 'text-emerald-600' },
};

export const DataPointTable: React.FC<DataPointTableProps> = ({
  findings,
  selectedId,
  resolvedValues,
  emptyText = 'No findings in this data-point category.',
  contractRoutes,
  onEmail,
  onViewThread,
  onViewPmi,
  onRowClick,
}) => {
  const isContractRoute = (finding: Finding) =>
    contractRoutes?.[finding.id] ?? !!finding.isContractRoute;

  if (!findings.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-2">
      {findings.map((finding) => {
        const resolved = !!(resolvedValues[finding.id] ?? finding.resolvedValue);
        const status: StatusKey = resolved ? 'resolved' : finding.type;
        const canViewThread =
          isContractRoute(finding) && !!finding.conversationId && !!onViewThread;
        const canEmail = isContractRoute(finding) && !!onEmail && !canViewThread;
        const pmiId = finding.projectManagerInstructionId;
        const canViewPmi = !!pmiId && !!onViewPmi;
        // Comparison findings show the actual conflicting values extracted from each
        // document as individual tags — that's the useful signal, not the boilerplate
        // description text. Findings with no extracted values fall back to that text.
        const valueTags = finding.sources?.length ? finding.sources.map((s) => s.value) : null;
        // Badge count and tooltip list read from the same set the drawer renders — see the
        // matching note in `FindingCard`.
        const documents = finding.documents?.length ? finding.documents : finding.associatedDocs;
        const subtitle =
          finding.presentation === 'missing' && finding.statusLabel
            ? finding.statusLabel
            : Array.isArray(finding.description)
              ? finding.description.filter(Boolean).join(' • ')
              : finding.description;

        return (
          <button
            key={finding.id}
            type="button"
            onClick={() => onRowClick(finding.id)}
            className={`group flex w-full items-start gap-3 rounded-2xl border border-l-4 bg-white px-4 py-3 text-left shadow-sm transition ${STATUS_BORDER[status]} ${
              finding.id === selectedId ? 'ring-main-p ring-1' : 'hover:shadow-md'
            }`}
            style={{
              borderTopColor: '#e2e8f0',
              borderRightColor: '#e2e8f0',
              borderBottomColor: '#e2e8f0',
            }}
          >
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${STATUS_ICON_STYLE[status].bg} ${STATUS_ICON_STYLE[status].fg}`}
            >
              <FileText className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className="min-w-0 truncate text-left text-sm leading-snug font-semibold text-slate-900"
                  title={finding.title}
                >
                  {finding.title}
                </h3>
                <span
                  className={`ds-micro! inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-bold! ${STATUS_BADGE[status]}`}
                >
                  {STATUS_LABEL[status]}
                </span>
                <Tooltip
                  title={
                    <ul className="m-0 list-disc space-y-0.5 pl-4">
                      {documents.map((doc) => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  }
                >
                  <span className="ds-caption! inline-flex shrink-0 items-center rounded-full bg-slate-100 px-3 py-1 font-bold! text-slate-700">
                    {documents.length} docs
                  </span>
                </Tooltip>
              </div>
              {valueTags ? (
                <div className="mt-1">
                  <ValueTagList
                    values={valueTags}
                    tagClassName="ds-micro! max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 font-semibold! text-slate-600"
                  />
                </div>
              ) : subtitle ? (
                <p className="ds-caption! mt-0.5 truncate text-slate-500" title={subtitle}>
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
              {isContractRoute(finding) ? (
                <span className="ds-micro! border-main-p/20 text-main-p inline-flex shrink-0 items-center gap-1 rounded-full border bg-sky-50 px-2.5 py-1 font-bold!">
                  <CheckIcon className="h-3 w-3" />
                  Contract Route
                </span>
              ) : null}
              {canViewPmi && pmiId && onViewPmi ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewPmi(pmiId);
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                >
                  <InstructionIcon className="h-3 w-3" />
                  View PMI
                </button>
              ) : null}
              {canViewThread ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewThread?.(finding.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                >
                  <MailIcon className="h-3 w-3" />
                  Thread
                </button>
              ) : null}
              {canEmail ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEmail?.(finding.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <MailIcon className="h-3 w-3" />
                  Email
                </button>
              ) : null}
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-600" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

DataPointTable.displayName = 'DataPointTable';
