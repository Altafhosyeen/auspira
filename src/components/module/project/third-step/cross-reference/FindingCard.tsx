'use client';

import { Tooltip } from 'antd';
import { FileText } from 'lucide-react';
import type React from 'react';
import { CheckIcon, ChevronRightIcon, InstructionIcon, MailIcon } from './icons';
import type { Finding } from './types';
import { ProjectKeyStatus } from './types';
import { ValueTagList } from './ValueTagList';

interface FindingCardProps {
  finding: Finding;
  resolved: boolean;
  selected?: boolean;
  /** Whether this finding is flagged as the contract route — shows the "Contract Route" badge. */
  isContractRoute?: boolean;
  /**
   * Email/Thread actions are only wired up by the Contract Registry's cross-reference
   * screen; the project-onboarding step omits them (no mailbox wiring at that stage).
   * Mirrors the same props on `DataPointTable` so grid and list offer identical actions.
   */
  onEmail?: (findingId: string) => void;
  onViewThread?: (findingId: string) => void;
  /** Navigates to the PMI raised from this finding; shown when `finding.projectManagerInstructionId` is set. */
  onViewPmi?: (projectManagerInstructionId: string) => void;
  onView: (findingId: string) => void;
}

type Tone = Finding['type'];
type StatusKey = Tone | 'resolved';

/** Fallback border by severity tone, used when the API status is missing/None. */
const TONE_BORDER: Record<Tone, string> = {
  error: 'border-l-red-500',
  warning: 'border-l-amber-400',
  passed: 'border-l-emerald-400',
};

/** Card left-edge accent follows the API's `projectKeyStatus` where available. */
const STATUS_BORDER: Partial<Record<ProjectKeyStatus, string>> = {
  [ProjectKeyStatus.Passed]: 'border-l-emerald-400',
  [ProjectKeyStatus.Resolved]: 'border-l-emerald-400',
  [ProjectKeyStatus.Failed]: 'border-l-red-500',
  [ProjectKeyStatus.Warning]: 'border-l-amber-400',
  [ProjectKeyStatus.NeedsReview]: 'border-l-amber-400',
};

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

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  resolved,
  selected = false,
  isContractRoute = false,
  onEmail,
  onViewThread,
  onViewPmi,
  onView,
}) => {
  const status: StatusKey = resolved ? 'resolved' : finding.type;
  // Same precedence as the list view: once a thread exists, "Email" becomes "Thread".
  const canViewThread = isContractRoute && !!finding.conversationId && !!onViewThread;
  const canEmail = isContractRoute && !!onEmail && !canViewThread;
  const pmiId = finding.projectManagerInstructionId;
  const canViewPmi = !!pmiId && !!onViewPmi;
  const cardBorder = resolved
    ? 'border-l-emerald-400'
    : ((finding.keyStatus !== undefined ? STATUS_BORDER[finding.keyStatus] : undefined) ??
      TONE_BORDER[finding.type]);
  // Both the badge count and the tooltip list read from `documents`, the same set the drawer
  // renders. `sources` is deduplicated per distinct value, not per document, so counting it
  // made the badge contradict both the tooltip and the drawer.
  const documents = finding.documents?.length ? finding.documents : finding.associatedDocs;
  // Comparison findings show the actual conflicting values extracted from each
  // document as individual tags — that's the useful signal, not the boilerplate
  // description text. Findings with no extracted values fall back to that text.
  const valueTags = finding.sources?.length ? finding.sources.map((s) => s.value) : null;
  const summary = Array.isArray(finding.description)
    ? finding.description.filter(Boolean).join(' • ')
    : finding.description;

  return (
    <button
      type="button"
      onClick={() => onView(finding.id)}
      className={`group flex h-full w-full flex-col gap-3 rounded-2xl border border-l-4 bg-white p-4 text-left shadow-sm transition ${cardBorder} ${
        selected ? 'ring-main-p ring-2' : 'hover:shadow-md'
      }`}
      style={{
        borderTopColor: '#e2e8f0',
        borderRightColor: '#e2e8f0',
        borderBottomColor: '#e2e8f0',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="ds-body-strong! min-w-0 leading-snug text-slate-900">{finding.title}</h3>
        <span
          className={`ds-micro! shrink-0 rounded-full px-2.5 py-1 font-bold! ${STATUS_BADGE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {valueTags ? (
        <ValueTagList
          values={valueTags}
          tagClassName="ds-micro! max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 font-semibold! text-slate-600"
        />
      ) : summary ? (
        <p className="ds-caption! line-clamp-2 text-slate-500" title={summary}>
          {summary}
        </p>
      ) : null}

      <div className="mt-auto flex cursor-pointer flex-wrap items-center gap-2 pt-1">
        <Tooltip
          title={
            <ul className="m-0 list-disc space-y-0.5 pl-4">
              {documents.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          }
        >
          <span className="ds-caption! flex shrink-0 items-center gap-1.5 text-slate-900">
            <FileText className="h-4 w-4 text-slate-800" />
            {documents.length} docs
          </span>
        </Tooltip>
        {isContractRoute ? (
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
            className="inline-flex shrink-0 items-center gap-1 cursor-pointer rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
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
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
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
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <MailIcon className="h-3 w-3" />
            Email
          </button>
        ) : null}
        <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-slate-200">
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
};

FindingCard.displayName = 'FindingCard';
