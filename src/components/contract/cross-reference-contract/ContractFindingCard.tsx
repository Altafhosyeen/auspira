import React from 'react';
import { Button } from 'antd';
import {
  ChevronDownIcon,
  EyeIcon,
  MailIcon,
  CheckIcon,
} from '@/components/module/project/third-step/cross-reference/icons';
import { ProjectKeyStatus } from '@/components/module/project/third-step/cross-reference/types';
import type {
  Finding,
  FindingValueSource,
} from '@/components/module/project/third-step/cross-reference/types';
import { formatFieldKey } from '@/components/module/project/third-step/cross-reference/utils';
import type { ContractFinding, WorkflowStatus } from './types';

interface ContractFindingCardProps {
  finding: ContractFinding;
  expanded: boolean;
  resolvedValue?: string;
  contractRoute: boolean;
  /** Whether the project mailbox is connected — gates the Email action. */
  mailboxConnected: boolean;
  keysDescriptions?: Record<string, string | string[]>;
  onToggleExpand: (id: string) => void;
  onResolve: (id: string, choice: string) => void;
  onEnterManually: (id: string) => void;
  onMarkNotApplicable: (id: string) => void;
  onToggleContractRoute: (id: string, checked: boolean) => void;
  onEmail: (id: string) => void;
}

type Tone = Finding['type'];

const VALUE_TEXT: Record<Tone, string> = {
  error: 'text-red-600',
  warning: 'text-amber-600',
  passed: 'text-emerald-600',
};

/** Fallback border by severity tone, used when the API status is missing/None. */
const CARD_BORDER: Record<Tone, string> = {
  error: 'border-red-400',
  warning: 'border-amber-400',
  passed: 'border-emerald-400',
};

/**
 * Card border colour follows the API's `projectKeyStatus`:
 * Passed / Resolved → green, Failed → red, Warning / NeedsReview → amber.
 */
const STATUS_BORDER: Partial<Record<ProjectKeyStatus, string>> = {
  [ProjectKeyStatus.Passed]: 'border-emerald-400',
  [ProjectKeyStatus.Resolved]: 'border-emerald-400',
  [ProjectKeyStatus.Failed]: 'border-red-400',
  [ProjectKeyStatus.Warning]: 'border-amber-400',
  [ProjectKeyStatus.NeedsReview]: 'border-amber-400',
};

const RESOLVE_IDLE = 'border-slate-200! bg-white! text-slate-700! hover:bg-slate-50!';
const RESOLVE_ACTIVE: Record<Tone, string> = {
  error: 'border-red-200! bg-red-100! text-red-600! hover:bg-red-100!',
  warning: 'border-amber-200! bg-amber-100! text-amber-700! hover:bg-amber-100!',
  passed: 'border-emerald-200! bg-emerald-100! text-emerald-700! hover:bg-emerald-100!',
};

const STATUS_PILL: Record<WorkflowStatus, { label: string; className: string }> = {
  'needs-action': { label: 'NEEDS ACTION', className: 'bg-slate-100 text-slate-500' },
  pending: { label: 'PENDING', className: 'bg-amber-50 text-amber-600' },
  accepted: { label: 'ACCEPTED', className: 'bg-emerald-50 text-emerald-600' },
};

const ValueBox: React.FC<{ source: FindingValueSource; valueColor: string }> = ({
  source,
  valueColor,
}) => (
  <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-2">
      <span className="ds-micro! font-bold! tracking-wider text-slate-700 uppercase">
        {source.docName}
      </span>
      <span className="ds-micro! flex shrink-0 items-center gap-1 font-bold! tracking-wide text-slate-700">
        {source.page}
        <EyeIcon className="h-3 w-3 text-slate-700" />
      </span>
    </div>
    <h5 className={`ds-heading-3! mt-3 font-bold! tracking-tight wrap-break-word ${valueColor}`}>
      {source.value}
    </h5>
    {source.clause && (
      <span className="ds-caption! mt-1.5 block font-semibold! tracking-wide text-slate-700">
        {source.clause}
      </span>
    )}
  </div>
);

/** Header-right email workflow: status pill + Email/Resend action (or a tick when accepted). */
const WorkflowControls: React.FC<{
  status: WorkflowStatus;
  /** Email action is only shown once the finding is flagged as the contract route. */
  canEmail: boolean;
  /** When the route is selected but no project mailbox is connected, the action is disabled. */
  mailboxConnected: boolean;
  onEmail: () => void;
}> = ({ status, canEmail, mailboxConnected, onEmail }) => {
  const pill = STATUS_PILL[status];
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className={`ds-micro! rounded-md px-2 py-0.5 font-bold! tracking-wider uppercase ${pill.className}`}
      >
        {pill.label}
      </span>
      {status === 'accepted' ? (
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
      ) : canEmail ? (
        // Shown only when the contract route is selected; disabled until a mailbox is connected.
        <button
          type="button"
          onClick={onEmail}
          disabled={!mailboxConnected}
          title={mailboxConnected ? undefined : 'Connect a project mailbox to enable email'}
          className="ds-caption! flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold! text-emerald-600 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-700 disabled:hover:bg-slate-50"
        >
          <MailIcon className="h-3 w-3" />
          {status === 'pending' ? 'Resend' : 'Email'}
        </button>
      ) : null}
    </div>
  );
};

export const ContractFindingCard: React.FC<ContractFindingCardProps> = ({
  finding,
  expanded,
  resolvedValue,
  contractRoute,
  mailboxConnected,
  keysDescriptions,
  onToggleExpand,
  onResolve,
  onEnterManually,
  onMarkNotApplicable,
  onEmail,
}) => {
  const isComparison = finding.presentation === 'comparison' && !!finding.sources?.length;
  const isAccepted = finding.status === 'accepted';
  const valueColor = isAccepted ? 'text-emerald-600' : VALUE_TEXT[finding.type];
  // Accepted findings are always green (workflow state); otherwise the border follows the API
  // status, falling back to the severity tone when the status is missing/None.
  const cardBorder = isAccepted
    ? 'border-emerald-400'
    : ((finding.keyStatus !== undefined ? STATUS_BORDER[finding.keyStatus] : undefined) ??
      CARD_BORDER[finding.type]);
  const resolveLabelStyle = finding.resolveLabelStyle ?? 'value';

  const resolveLabel = (source: FindingValueSource, index: number) => {
    if (resolveLabelStyle === 'letter') return `Use Value ${index === 0 ? 'A' : 'B'}`;
    return `Use ${source.resolveLabel ?? source.value}`;
  };

  return (
    <div
      // Collapsed: a click anywhere on the card expands it. Expanded: the card
      // itself is inert so inner controls work; collapse via the chevron.
      onClick={() => {
        if (!expanded) onToggleExpand(finding.id);
      }}
      className={`rounded-xl border-2 bg-white p-4 shadow-sm ${cardBorder} ${
        expanded ? '' : 'cursor-pointer'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="ds-body-strong! text-text tracking-tight">{finding.title}</h4>
          <span className="ds-micro! mt-1.5 block font-bold! tracking-wider text-slate-700 uppercase">
            {finding.category}
            {finding.field && ` · FIELD: ${formatFieldKey(finding.field)}`}
          </span>
        </div>
        {/* Interactive controls stop propagation so they don't also expand the card. */}
        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {finding.presentation === 'missing' && finding.page && (
            <span className="ds-caption! flex items-center gap-1 font-bold! tracking-wide text-slate-700">
              {finding.page}
              <EyeIcon className="h-3 w-3 text-slate-700" />
            </span>
          )}
          <WorkflowControls
            status={finding.status}
            canEmail={contractRoute}
            mailboxConnected={mailboxConnected}
            onEmail={() => onEmail(finding.id)}
          />
          <button
            type="button"
            onClick={() => onToggleExpand(finding.id)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="rounded-md p-0.5 text-slate-700 transition-colors hover:text-slate-600"
          >
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${expanded ? '' : '-rotate-90'}`}
            />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <>
          {/* Value comparison — wraps into a grid so 5–6 sources stay readable */}
          {isComparison && (
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {finding.sources!.map((source) => (
                <ValueBox key={source.docName} source={source} valueColor={valueColor} />
              ))}
            </div>
          )}

          {/* Missing / not-found notice */}
          {finding.presentation === 'missing' &&
            (() => {
              const desc = keysDescriptions?.[finding.id] ?? finding.description;
              return (
                <div className="mt-3 space-y-2 rounded-lg border border-dashed border-red-200 bg-white p-4">
                  {finding.statusLabel && (
                    <p className="ds-caption! font-bold! tracking-wide text-red-600 uppercase">
                      {finding.statusLabel}
                    </p>
                  )}
                  <p className="ds-caption! font-medium! text-slate-500">{desc}</p>
                </div>
              );
            })()}

          {/* Description (comparison only) */}
          {isComparison &&
            (() => {
              const items = Array.isArray(keysDescriptions) ? keysDescriptions : [keysDescriptions];
              return (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="ds-caption! flex gap-2 font-medium! text-slate-500">
                        <span className="shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

          {/* Accepted confirmation bar — replaces the action row */}
          {isAccepted && finding.accepted ? (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-3">
              <span className="flex items-center gap-2">
                <span className="ds-micro! flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-bold! text-emerald-700">
                  {finding.accepted.role}
                </span>
                <span className="ds-caption! font-bold! text-slate-700">
                  {finding.accepted.name}
                  <span className="ml-1 font-medium! text-slate-700">{finding.accepted.role}</span>
                </span>
              </span>
              <span className="ds-caption! font-semibold! text-emerald-600">
                {finding.accepted.note}
              </span>
            </div>
          ) : (
            /* Actions */
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {isComparison &&
                  finding.sources!.map((source, index) => {
                    const isActive = resolvedValue ? resolvedValue === source.value : index === 0;
                    return (
                      <Button
                        key={source.docName}
                        onClick={() => onResolve(finding.id, source.value)}
                        className={`ds-caption! h-9 rounded-lg border px-4 font-bold! ${
                          isActive ? RESOLVE_ACTIVE[finding.type] : RESOLVE_IDLE
                        }`}
                      >
                        {resolveLabel(source, index)}
                      </Button>
                    );
                  })}

                <Button
                  type="text"
                  onClick={() => onEnterManually(finding.id)}
                  className="ds-caption! h-9 rounded-lg font-semibold! text-slate-600 hover:text-slate-800"
                >
                  Enter manually
                </Button>

                {finding.presentation === 'missing' && (
                  <Button
                    type="text"
                    onClick={() => onMarkNotApplicable(finding.id)}
                    className={`ds-caption! h-9 rounded-lg font-semibold! ${
                      resolvedValue === 'N/A'
                        ? 'text-blue-600'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Mark as Not Applicable
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

ContractFindingCard.displayName = 'ContractFindingCard';
