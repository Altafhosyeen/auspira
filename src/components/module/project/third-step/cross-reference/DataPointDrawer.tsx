'use client';

import { Button, Checkbox, type CheckboxChangeEvent, Divider, Input, Modal, Tooltip } from 'antd';
import { FileText, HelpCircle, History, SparklesIcon, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useGetCrossReferenceAuditTrail } from '@/hooks/modules/cross-reference';
import { AuditTrailTimeline } from './AuditTrailTimeline';
import { ContractRouteConfirmModal } from './ContractRouteConfirmModal';
import CrossReferenceSourceDialog, {
  type CrossReferenceSourceData,
} from './CrossReferenceSourceDialog';
import { DataPointGuidancePanel } from './DataPointDrawerHelp';
import { ChevronDownIcon, EyeIcon, WarningTriangleIcon } from './icons';
import {
  type AuditTrailEntry,
  type Finding,
  type FindingValueSource,
  ProjectKeyStatus,
  type WorkflowStatus,
} from './types';
import { formatFieldKey } from './utils';
import { ValueTagList } from './ValueTagList';

interface DataPointDrawerProps {
  finding: Finding | null;
  open: boolean;
  resolvedValue?: string;
  contractRoute: boolean;
  /**
   * Makes the route checkbox read-only. The route is decided during project
   * onboarding; the contract registry only reports what it was set to.
   */
  contractRouteDisabled?: boolean;
  /** True while the save request is in flight — drives the Save button spinner. */
  saving?: boolean;
  /**
   * Email workflow state. Omit `onEmail` entirely to hide the whole email affordance
   * (the project step has no mailbox wiring; the contract registry does).
   */
  emailStatus?: WorkflowStatus;
  /** Whether the project mailbox is connected — gates the Email action. */
  mailboxConnected?: boolean;
  onEmail?: (findingId: string) => void;
  onClose: () => void;
  onResolve: (findingId: string, choice: string) => void;
  onMarkNotApplicable: (findingId: string) => void;
  onToggleContractRoute: (findingId: string, checked: boolean) => void;
  /**
   * Contract-route confirmation dialog state. Rendered nested inside this modal
   * (stacked with a higher z-index) so it reads as a step within the same flow.
   */
  contractRouteConfirm?: {
    open: boolean;
    title: string;
    loading?: boolean;
    /** Overrides the confirm button label — see `ContractRouteConfirmModal`. */
    confirmLabel?: string;
    description?: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

/**
 * Stable identity for one source row. Selection is tracked by this rather than by the
 * value, because several documents commonly report the *same* value — keying on the value
 * highlighted every one of those rows at once.
 *
 * Sources are deduplicated on document + value upstream, so this is unique per row.
 */
const sourceIdentity = (source: FindingValueSource): string =>
  `${source.documentName || source.docName}|${source.value}`;

/** Header icon tone follows the finding's severity, same palette as the card grid. */
const HEADER_ICON_STYLE: Record<Finding['type'], { bg: string; fg: string }> = {
  error: { bg: 'bg-red-50', fg: 'text-red-400' },
  warning: { bg: 'bg-amber-50', fg: 'text-amber-600' },
  passed: { bg: 'bg-emerald-50', fg: 'text-emerald-600' },
};

export const DataPointDrawer: React.FC<DataPointDrawerProps> = ({
  finding,
  open,
  resolvedValue,
  contractRoute,
  contractRouteDisabled = false,
  saving = false,
  emailStatus = 'needs-action',
  onClose,
  onResolve,
  onToggleContractRoute,
  contractRouteConfirm,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [manualValue, setManualValue] = useState('');
  const [seededFor, setSeededFor] = useState<string | undefined>(undefined);
  const [viewSource, setViewSource] = useState<CrossReferenceSourceData | null>(null);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);

  const { data: auditTrailData, isLoading: auditTrailLoading } = useGetCrossReferenceAuditTrail<
    AuditTrailEntry[]
  >({
    projectCrossReferenceId: finding?.id ?? '',
    enabled: open && !!finding,
  });

  if (open && finding && seededFor !== finding.id) {
    setSeededFor(finding.id);
    // Seed from the already-agreed value by preselecting the first row carrying it.
    const seeded = resolvedValue
      ? finding.sources?.find((source) => source.value === resolvedValue)
      : undefined;
    setSelectedKey(seeded ? sourceIdentity(seeded) : undefined);
    setManualValue('');
    // Collapse guidance again so a new data point opens on its own summary rather than
    // inheriting the previous one's expanded state.
    setHelpExpanded(false);
  }

  if (!open && seededFor !== undefined) setSeededFor(undefined);
  if (!finding) return null;

  // Bullet items (the array form) join into one clamp-able block, "• " per line, so
  // `ExpandableText` can measure and clamp them the same way it does a plain string.
  const descriptionText = Array.isArray(finding.description)
    ? finding.description
        .filter(Boolean)
        .map((item) => `• ${item}`)
        .join('\n')
    : finding.description;

  const isComparison = finding.presentation === 'comparison' && !!finding.sources?.length;
  const isResolved = finding.keyStatus === ProjectKeyStatus.Resolved;
  const iconStyle = HEADER_ICON_STYLE[finding.type];

  const handleViewSource = (source: FindingValueSource) => {
    if (!source.documentUrl && !source.projectDocumentId) return;
    setViewSource({
      documentUrl: source.documentUrl,
      projectDocumentId: source.projectDocumentId,
      // `pageNumber` is undefined when the backend could not pin the value to a page.
      page: source.pageNumber ?? 1,
      extractedValue: source.value,
      documentName: source.documentName ?? source.docName,
      documentTypeLabel: source.documentTypeLabel,
      label: finding.title,
      errorMessage: finding.errorMessage ?? undefined,
      description: Array.isArray(finding.description)
        ? finding.description.join('\n')
        : finding.description,
      // The data-point's own label and this row's clause reference are the sibling
      // text most likely printed right next to the value in the source document —
      // e.g. a "Total of the Prices" heading or a "CL. 3.1" clause number beside a
      // figure that also appears elsewhere on the page. Disambiguates duplicates.
      contextHints: [finding.title, source.clause].filter(Boolean) as string[],
    });
  };

  const handleSelect = (source: FindingValueSource) => {
    setSelectedKey(sourceIdentity(source));
    setManualValue('');
  };

  const handleManualChange = (value: string) => {
    setManualValue(value);
    if (value.trim()) setSelectedKey(undefined);
  };

  // Saving still resolves to the selected row's value — only the highlight is per-row.
  const selectedSource = finding.sources?.find((source) => sourceIdentity(source) === selectedKey);
  const pendingValue = manualValue.trim() || selectedSource?.value.trim() || '';
  // Once a PMI has been raised from this finding its value is settled by that instruction,
  // so the choice is read-only here — no re-picking a value, no raising a second PMI.
  const pmiRaised = !!finding.projectManagerInstructionId;
  const canSave = pendingValue.length > 0 && !saving && !pmiRaised;

  const handleSave = () => {
    if (canSave) onResolve(finding.id, pendingValue);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        closable={false}
        centered
        width={800}
        destroyOnHidden
        styles={{
          body: { padding: 0, maxHeight: '85vh', display: 'flex', flexDirection: 'column' },
        }}
        className="cross-reference-drawer"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${iconStyle.bg} ${iconStyle.fg}`}
          >
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="ds-heading-3! m-0! font-bold!" style={{ color: '#122741' }}>
              {finding.title}
            </h2>
            <p className="ds-micro! mt-0.5 mb-0! font-semibold! tracking-wider text-slate-500 uppercase">
              {finding.category}
              {finding.field && ` • ${formatFieldKey(finding.field)}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {emailStatus && emailStatus !== 'needs-action' && (
              <span className="ds-micro! rounded-full bg-amber-100 px-2.5 py-1 font-bold! tracking-wider text-amber-700 uppercase">
                Needs review
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-white px-5 py-4">
          {/* Contract Route Field */}

          {/* Not-found notice */}
          {finding.presentation === 'missing' && (
            <div className="mt-3 flex gap-3 rounded-md! border border-amber-200 bg-amber-50 p-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-amber-600">
                <WarningTriangleIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="ds-caption! mb-0! font-bold! text-amber-900">
                  A supporting clause was not found automatically.
                </p>
                <p className="ds-caption! mt-0.5 mb-0! font-medium! text-amber-800">
                  Review the possible values below, select the correct source, or enter the value
                  manually.
                </p>
              </div>
            </div>
          )}

          {/* Suggest values */}
          {isComparison && (
            <div className="">
              <DataPointGuidancePanel
                descriptionText={descriptionText}
                expanded={helpExpanded}
                onToggle={() => setHelpExpanded((prev) => !prev)}
              />

              <div className="my-2 mb-2 flex items-start gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50">
                  <SparklesIcon className="h-3.5 w-3.5" />
                </span>
                <div className="">
                  <p className="ds-caption! mb-0! font-bold! text-slate-700">Suggest values</p>
                  <p className="ds-micro! mt-1! mb-0! text-slate-500">
                    Values found in your contract documents
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {finding.sources!.map((source) => {
                  const sourceKey = sourceIdentity(source);
                  const isSelected = sourceKey === selectedKey;
                  const canView = !!source.documentUrl || !!source.projectDocumentId;
                  // A comma-separated list of codes (e.g. "X2, X16, X18, Y(UK)2") reads better
                  // as separate tags. Guard against splitting a plain number apart (e.g.
                  // "£4,250,000.00") by only treating it as a list when every part has some
                  // non-numeric content.
                  const valueParts =
                    source.value
                      ?.split(',')
                      .map((v) => v.trim())
                      .filter(Boolean) ?? [];
                  const showValueAsTags =
                    valueParts.length > 0 && !valueParts.some((v) => /^[\d.]+$/.test(v));
                  // Value(s) render as one wrapped tag row, wrapping to a second line before
                  // collapsing behind "See more" (ValueTagList). The doc type stays out of these
                  // tags — it describes the document, not the value, so it sits under the file
                  // name where it can name this row's own document rather than only the first.
                  const badgeTags = source.value
                    ? showValueAsTags
                      ? valueParts
                      : [source.value]
                    : [];
                  return (
                    // A <label> makes the whole card the radio's click target natively,
                    // so keyboard activation and the checked state come from the input
                    // rather than hand-rolled role/onKeyDown handling.
                    <label
                      key={sourceKey}
                      className={`flex flex-col gap-1.5 rounded-xl border p-3 transition-all ${pmiRaised ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                        isSelected
                          ? 'border-main-p bg-sky-50'
                          : `border-slate-200 bg-white ${pmiRaised ? '' : 'hover:border-slate-300'}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`value-${finding.id}`}
                          checked={isSelected}
                          disabled={pmiRaised}
                          onChange={() => handleSelect(source)}
                          className="accent-main-p h-4 w-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                        />

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <FileText className="h-4 w-4" />
                        </span>

                        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            {/* <p className="ds-caption! mb-0! min-w-0 font-bold! wrap-break-word text-slate-900">
                              {source.documentName || source.docName}
                            </p> */}
                            {/* The document-type family behind this row's file, so a value found in
                                e.g. Contract Data Part 1 is distinguishable from one in Part 2 even
                                when the uploaded file names look alike. */}
                            {source.documentTypeLabel && (
                              <p className="ds-micro! mb-0! font-semibold! tracking-wide text-slate-700 uppercase">
                                {source.documentTypeLabel}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={!canView}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSource(source);
                            }}
                            className="ds-micro! inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold! text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            {/* `pageNumber` is undefined when the backend sent page 0 (unknown). */}
                            {source.pageNumber ? `Page ${source.pageNumber}` : 'View'}
                          </button>
                        </div>
                      </div>

                      {/* pl-18 matches radio (16px) + gap (12) + icon (32) + gap (12) so the tags
                          line up with the document name above; pl-17 sat 4px to the left. */}
                      {badgeTags.length > 0 && (
                        <div className="pl-18">
                          <ValueTagList
                            values={badgeTags}
                            tagClassName="ds-micro! inline-block rounded-md bg-slate-100 px-2 py-1 font-semibold! text-slate-600"
                          />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enter another value */}
          {!isResolved && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-2">
                <p className="ds-caption! mb-0! font-bold! text-slate-700">Enter another value</p>
                <Tooltip title="If none of the suggested values are correct, enter the value manually.">
                  <HelpCircle className="mt-1 h-3.5 w-3.5 shrink-0 cursor-help text-slate-400" />
                </Tooltip>
              </div>

              <Input
                type="text"
                size="large"
                value={manualValue}
                onChange={(e) => handleManualChange(e.target.value)}
                disabled={pmiRaised}
                placeholder="Enter value"
              />

              {/* <div className="border-main-p/20 mt-2 flex items-start gap-3 rounded-2xl border bg-sky-50 p-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white">
                  <InfoIcon className="h-3 w-3" />
                </span>
                <p className="ds-micro! mb-0! font-medium! text-slate-600">
                  A record will be saved with your selection for audit and traceability.
                </p>
              </div> */}
            </div>
          )}
          <div className="border-main-p/20 mt-2 rounded-md! border bg-sky-50 p-3">
            <Checkbox
              checked={contractRoute}
              onChange={(e: CheckboxChangeEvent) =>
                onToggleContractRoute(finding.id, e.target.checked)
              }
              disabled={contractRouteDisabled}
            >
              <span className="ds-caption! font-bold! tracking-wide text-slate-800">
                Yes, mark as contract route
              </span>
            </Checkbox>
            <p className="ds-micro! mt-0.5 mb-0! ml-6 font-medium! text-slate-500">
              Select if this key is defined in the contract and should be used as the official
              reference for routing and traceability.
            </p>
          </div>
          {/* Activity history */}
          <div className="mt-3 rounded-2xl border border-slate-200 p-3">
            <button
              type="button"
              onClick={() => setHistoryExpanded((prev) => !prev)}
              aria-expanded={historyExpanded}
              className="flex w-full items-center justify-between gap-2 text-slate-500"
            >
              <span className="flex items-center gap-2">
                <History className="h-3.5 w-3.5 shrink-0" />
                <span className="ds-caption! font-bold! text-slate-700">Activity history</span>
                {!!auditTrailData?.length && (
                  <span className="ds-micro! rounded-full bg-slate-100 px-1.5 py-0.5 font-semibold! text-slate-500">
                    {auditTrailData.length}
                  </span>
                )}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                  historyExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>
            {historyExpanded && (
              <>
                <Divider className="my-2!" />
                <AuditTrailTimeline entries={auditTrailData ?? []} loading={auditTrailLoading} />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3">
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              className="ds-caption! h-10 rounded-lg border-slate-200! bg-white! font-semibold! text-slate-700 hover:bg-slate-50!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              disabled={!canSave}
              loading={saving}
              className="ds-caption!"
            >
              Notify PMI
            </Button>
          </div>
        </div>

        {contractRouteConfirm && (
          <ContractRouteConfirmModal
            open={contractRouteConfirm.open}
            title={contractRouteConfirm.title}
            loading={contractRouteConfirm.loading}
            confirmLabel={contractRouteConfirm.confirmLabel}
            description={contractRouteConfirm.description}
            onConfirm={contractRouteConfirm.onConfirm}
            onCancel={contractRouteConfirm.onCancel}
            getContainer={false}
          />
        )}
      </Modal>

      <CrossReferenceSourceDialog
        open={!!viewSource}
        source={viewSource}
        onClose={() => setViewSource(null)}
      />
    </>
  );
};

DataPointDrawer.displayName = 'DataPointDrawer';
