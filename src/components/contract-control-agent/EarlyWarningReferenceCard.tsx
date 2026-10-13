'use client';

import { WarningFilled } from '@ant-design/icons';
import { Popconfirm, Select, Skeleton, Tooltip } from 'antd';
import Link from 'next/link';
import React from 'react';
import { MENU_PATH, ProjectAlertStatus } from '@/constants';
import { useGetEarlyWarningsLookup } from '@/hooks/modules/early-warning';
import type { ProjectAlert } from '@/hooks/modules/project-alerts';
import { useGetRiskReductionMeetingsByEarlyWarningId } from '@/hooks/modules/risk-reduction-meeting';
import ButtonX from '../antd/ButtonX';
import { RRM_CARD as CARD } from './risk-reduction-meeting.data';
import {
  cleanEarlyWarningReference,
  findEarlyWarningByReference,
  hasRecordedMeetingForAlert,
} from './risk-reduction-meeting.map';

const META_LABEL = 'ds-micro mb-1.5 block font-bold tracking-wider text-slate-400 uppercase';

/**
 * An Early Warning reference is only openable when it resolves to a registered EW for this
 * project. When it does, render a real link so the reference behaves the way it looks; when it
 * doesn't — the AI attached a reference that isn't in the register — keep it inert text with no
 * pointer or underline and say why in a tooltip, rather than leaving it looking clickable.
 */
function EarlyWarningReferenceLabel({
  reference,
  earlyWarningId,
  className = '',
}: {
  reference: string;
  earlyWarningId?: string;
  className?: string;
}) {
  if (!earlyWarningId) {
    return (
      <Tooltip title="This reference isn't in the Early Warning register, so there's nothing to open.">
        <span className={`cursor-default font-semibold ${className}`}>{reference}</span>
      </Tooltip>
    );
  }

  return (
    <Link
      href={`${MENU_PATH.CCA_EARLY_WARNING_REGISTER.pathname}/detail/${earlyWarningId}`}
      className={`font-semibold underline decoration-dotted underline-offset-2 transition-colors hover:decoration-solid ${className}`}
    >
      {reference}
    </Link>
  );
}

/**
 * Terminal decisions on the signal itself — nothing reopens Accept after these. `Reviewed` is
 * deliberately excluded — it plausibly only means "seen", and treating it as actioned would hide
 * Accept before the user ever acts. `Overdue` is excluded for the same reason: it describes the
 * EW's own deadline, not this signal.
 */
const SETTLED_ALERT_STATUSES: ReadonlySet<ProjectAlertStatus> = new Set([
  ProjectAlertStatus.Closed,
  ProjectAlertStatus.Dismissed,
]);

/**
 * The signal has an Early Warning behind it — which is *not* the same as "this meeting has been
 * recorded": the backend also stamps these when the EW was registered from the register screen or
 * from a sibling signal on the same mail thread. Latching Accept on them alone is what left the
 * button reading "Accepted" on a meeting nobody had accepted yet, so they only hold while the
 * meeting lookup can't answer for itself (see `isAccepted`).
 */
const REGISTERED_ALERT_STATUSES: ReadonlySet<ProjectAlertStatus> = new Set([
  ProjectAlertStatus.Registered,
  ProjectAlertStatus.InProgress,
]);

/** What the accept is recorded against — the register's own reference, plus the EW it belongs to
 *  so the screen can navigate to it once the meeting exists. */
export interface AcceptedEarlyWarning {
  reference: string;
  earlyWarningId?: string;
}

interface EarlyWarningReferenceCardProps {
  alert: ProjectAlert;
  /** The accept POST is in flight. */
  isAccepting: boolean;
  isDismissing: boolean;
  /** The accept POST has already succeeded on this screen — set by the parent, which owns it. */
  isAcceptedLocally: boolean;
  onAccept: (accepted: AcceptedEarlyWarning) => void;
  onDismiss: () => void;
}

/**
 * The Early Warning an accepted meeting gets recorded against: the reference the AI attached when
 * the register confirms it, otherwise a picker over the project's registered EWs. Owns the whole
 * "can this signal still be accepted?" decision — the parent only performs it.
 */
export default function EarlyWarningReferenceCard({
  alert,
  isAccepting,
  isDismissing,
  isAcceptedLocally,
  onAccept,
  onDismiss,
}: EarlyWarningReferenceCardProps) {
  const [referenceInput, setReferenceInput] = React.useState<string | undefined>(undefined);

  // Always fetched — besides populating the reference picker, it's also used to confirm that an
  // AI-attached `earlyWarningReference` is actually a registered EW before trusting it below.
  const { data: ewLookup, isLoading: isLookupLoading } = useGetEarlyWarningsLookup({
    projectId: alert.projectId,
    enabled: !!alert.projectId,
  });
  const referenceOptions = (ewLookup ?? []).map((item) => ({
    value: item.reference,
    label: item.title ? `${item.reference} — ${item.title}` : item.reference,
  }));

  // The AI may attach a reference to the alert that isn't (or no longer is) a valid registered EW
  // for this project — only skip the picker once the lookup confirms the reference actually exists.
  // Matched through `findEarlyWarningByReference`, never by string equality: the alert carries the
  // extractor's own note on the end of the reference ("EWN-1239 (not linked with any known Early
  // Warning in Auspira)"), which no register entry will ever equal.
  const attachedEarlyWarning = findEarlyWarningByReference(ewLookup, alert.earlyWarningReference);
  const referenceConfirmed = !!attachedEarlyWarning;

  // Whichever EW the accept would be recorded against: the one the AI attached when the register
  // confirms it, otherwise the one the user picked. Held as the register's own record so both the
  // meeting check and the POST body use the canonical reference, never the extractor's noisy one.
  const activeEarlyWarning = referenceConfirmed
    ? attachedEarlyWarning
    : findEarlyWarningByReference(ewLookup, referenceInput);
  const activeEarlyWarningId = activeEarlyWarning?.id;

  // Definitive "has this alert already been accepted?" check, and the only one that survives a
  // reload: every recorded meeting carries the `projectAlertId` it was created from, so a meeting
  // already listed against this EW for this alert means Accept has run. Resolved through the
  // lookup because the meetings endpoint is keyed by EW id while the alert only holds a reference.
  // Only checked against the AI-confirmed reference — a reference the user is manually picking in
  // the fallback picker is a fresh destination they are actively choosing, not one to pre-block on
  // a lookup keyed by whatever EW happens to be selected at the moment.
  const {
    data: existingMeetings,
    isLoading: isMeetingCheckLoading,
    isSuccess: isMeetingCheckDone,
  } = useGetRiskReductionMeetingsByEarlyWarningId({
    earlyWarningId: referenceConfirmed ? activeEarlyWarningId : undefined,
  });

  const alreadyRecorded = React.useMemo(
    () => referenceConfirmed && hasRecordedMeetingForAlert(existingMeetings, alert.id),
    [referenceConfirmed, existingMeetings, alert.id]
  );

  // True once the meetings endpoint has answered for the EW in play — the definitive "was this
  // alert already accepted?" check. Until an EW resolves (no reference attached, or one the
  // register doesn't have until the user picks it) there is nothing to ask, and the alert's own
  // status is all there is to go on.
  const isMeetingCheckAnswered = !!activeEarlyWarningId && isMeetingCheckDone;

  // Accepting is a once-per-alert action, latched from several independent angles because
  // `isAccepting` alone only covered the window while the request was in flight:
  //   - `alreadyRecorded`    — a meeting already exists for this alert. Server truth, survives reload.
  //   - `alertStatus`        — secondary server signal, only while the AI-confirmed reference's own
  //                            meeting lookup can't resolve; once it has answered, its "no meeting
  //                            for this alert" is the stronger evidence. Never applied against a
  //                            reference the user is manually picking — that is always a fresh,
  //                            still-open choice for them to submit.
  //   - `isAcceptedLocally`  — covers the gap between the request resolving and the screen unmounting.
  const isAccepted =
    isAcceptedLocally ||
    alreadyRecorded ||
    SETTLED_ALERT_STATUSES.has(alert.alertStatus) ||
    (referenceConfirmed &&
      !isMeetingCheckAnswered &&
      REGISTERED_ALERT_STATUSES.has(alert.alertStatus));
  // Held while the meeting check is still in flight — enabling Accept before the answer arrives is
  // exactly the window a duplicate slips through.
  const isAcceptDisabled = isAccepted || isAccepting || isMeetingCheckLoading;
  // Only a meeting actually recorded against this alert earns the "Accepted" wording and the solid
  // treatment. A signal held closed by its status alone was never accepted here, and labelling it
  // as such is what made the button look finished when it wasn't.
  const isConfirmedAccepted = isAcceptedLocally || alreadyRecorded;
  const acceptLabel = isAccepting ? 'Accepting…' : isConfirmedAccepted ? 'Accepted' : 'Accept';

  // Mirrors the precedence baked into `isAcceptDisabled`/`isAccepted` above, so the tooltip always
  // names whichever condition is actually holding the button closed.
  const acceptDisabledReason = isConfirmedAccepted
    ? 'This signal has already been accepted.'
    : SETTLED_ALERT_STATUSES.has(alert.alertStatus)
      ? 'This signal has already been closed or dismissed.'
      : isAccepted
        ? 'This signal is already registered against an Early Warning — select its reference to check whether a meeting was recorded.'
        : isAccepting
          ? 'Submitting your acceptance — please wait.'
          : isMeetingCheckLoading
            ? 'Checking for an existing meeting record — please wait.'
            : undefined;
  // Dismissing after acceptance would soft-delete the alert that now backs a real meeting record.
  const dismissDisabledReason = isDismissing
    ? 'Dismissing — please wait.'
    : isConfirmedAccepted
      ? 'This signal has already been accepted and linked to a meeting record.'
      : isAccepted
        ? (acceptDisabledReason ?? 'This signal has already been actioned.')
        : isAccepting
          ? 'Wait for the acceptance to finish before dismissing.'
          : isMeetingCheckLoading
            ? 'Checking for an existing meeting record — please wait.'
            : undefined;

  // What the register holds is what the backend links the meeting to — sending the extractor's
  // "EWN-1239 (not linked with any known Early Warning in Auspira)" verbatim is a reference no
  // EW answers to, so the meeting would be created against nothing.
  const handleAccept = (reference?: string) => {
    const matched = findEarlyWarningByReference(ewLookup, reference);
    const canonical = matched?.reference ?? cleanEarlyWarningReference(reference);
    if (!canonical) return;
    onAccept({ reference: canonical, earlyWarningId: matched?.id });
  };

  const dismissButton = (
    <Popconfirm
      title="Dismiss this signal?"
      description="This soft-deletes the alert — it will no longer appear in the awareness queue."
      okText="Dismiss"
      cancelText="Cancel"
      onConfirm={onDismiss}
      // Once accepted, the alert backs a real meeting record — dismissing it would soft-delete
      // the source of what was just created.
      disabled={isAcceptDisabled}
    >
      <ButtonX
        disabled={isDismissing || isAcceptDisabled}
        disabledReason={dismissDisabledReason}
        className="w-full flex-1 rounded border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDismissing ? 'Dismissing…' : 'Dismiss'}
      </ButtonX>
    </Popconfirm>
  );

  return (
    <div className={CARD}>
      <h3 className="heading-card border-b border-slate-100 pb-1">Early Warning Reference</h3>

      {isLookupLoading && alert.earlyWarningReference ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : referenceConfirmed ? (
        <>
          <p className="ds-caption text-slate-500">
            This meeting is linked to{' '}
            <EarlyWarningReferenceLabel
              reference={attachedEarlyWarning?.reference as string}
              earlyWarningId={attachedEarlyWarning?.id}
              className="text-slate-800"
            />
            .
          </p>
          <div className="flex gap-2">
            <ButtonX
              disabled={isAcceptDisabled}
              disabledReason={acceptDisabledReason}
              onClick={() => handleAccept(attachedEarlyWarning?.reference)}
              className={`w-full flex-1 rounded py-2.5 text-center text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isConfirmedAccepted
                  ? 'bg-main-p! text-white!'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {acceptLabel}
            </ButtonX>
            {dismissButton}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <WarningFilled className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="ds-caption font-semibold text-amber-900">
                {alert.earlyWarningReference
                  ? 'Suggested reference not found in the register.'
                  : 'No Early Warning has been registered yet.'}
              </p>
              <p className="ds-caption mt-0.5 text-amber-800">
                {alert.earlyWarningReference ? (
                  <>
                    Auspira attached{' '}
                    {/* Nothing resolved it, so it is inert by definition — and shown without the
                        extractor's trailing note, which this copy explains in its own words. */}
                    <EarlyWarningReferenceLabel
                      reference={cleanEarlyWarningReference(alert.earlyWarningReference)}
                    />
                    , but it isn&apos;t a registered Early Warning for this project. Select the
                    correct reference below.
                  </>
                ) : (
                  "This meeting isn't linked to a registered Early Warning reference."
                )}
              </p>
            </div>
          </div>
          <div>
            <label className={META_LABEL} htmlFor="rrm-reference-number">
              Reference Number
            </label>
            <Select
              id="rrm-reference-number"
              className="w-full"
              placeholder="Select a reference number"
              showSearch
              allowClear
              loading={isLookupLoading}
              value={referenceInput}
              onChange={(value) => setReferenceInput(value)}
              options={referenceOptions}
              optionFilterProp="label"
              notFoundContent={
                isLookupLoading ? 'Loading…' : 'No early warnings found for this project.'
              }
            />
          </div>

          <div className="flex gap-2">
            <ButtonX
              disabled={!referenceInput || isAcceptDisabled}
              disabledReason={
                !referenceInput ? 'Select a reference number first.' : acceptDisabledReason
              }
              onClick={() => handleAccept(referenceInput)}
              className={`w-full flex-1 rounded py-2.5 text-center text-xs font-bold transition-colors ${
                isConfirmedAccepted
                  ? 'bg-main-p! text-white!'
                  : !referenceInput || isAcceptDisabled
                    ? 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-300'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {acceptLabel}
            </ButtonX>
            {dismissButton}
          </div>
        </>
      )}
    </div>
  );
}
