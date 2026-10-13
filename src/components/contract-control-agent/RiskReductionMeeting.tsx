'use client';

import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  InfoCircleFilled,
  InfoCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { notification, Skeleton, Tooltip } from 'antd';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import { MENU_PATH } from '@/constants';
import {
  parseAlertCompensationEvent,
  useDeleteProjectAlert,
  useGetProjectAlertById,
} from '@/hooks/modules/project-alerts';
import { useCreateRiskReductionMeeting } from '@/hooks/modules/risk-reduction-meeting';
import { parseBackendDate } from '@/lib/utils';
import AgreedActionsCard from './AgreedActionsCard';
import EarlyWarningReferenceCard, { type AcceptedEarlyWarning } from './EarlyWarningReferenceCard';
import RiskReductionMeetingEmailCard from './RiskReductionMeetingEmailCard';
import { RRM_CARD as CARD, RRM_COPY } from './risk-reduction-meeting.data';
import { parseRiskReductionMeeting } from './risk-reduction-meeting.map';
import { RrmMetaRow, RrmStatCard } from './risk-reduction-meeting-shared';

const EM_DASH = '—';

/** Best-effort ISO conversion — the API's `meetingDate` example is ISO, but the source string
 * (extracted from the alert's meeting minutes) isn't guaranteed to parse; fall back to sending it
 * as-is rather than blocking submission. Always fed the mapper's `*Raw` backend value, never the
 * localised display string — re-parsing a formatted date would shift the instant it round-trips. */
const toIsoDate = (value: string | undefined): string => {
  if (!value || value === EM_DASH) return '';
  const date = parseBackendDate(value);
  return date ? date.toISOString() : value;
};

const orEmpty = (value: string | undefined): string => (value && value !== EM_DASH ? value : '');

const META_LABEL = 'ds-micro mb-1.5 block font-bold tracking-wider text-slate-400 uppercase';

const { labels, stats } = RRM_COPY;

// ─── Screen ──────────────────────────────────────────────────────────────────

/** Read-only record of a Early Warning Meeting already held — nothing here is editable. */
export default function RiskReductionMeeting() {
  const [refDecision, setRefDecision] = React.useState<'accept' | null>(null);
  // `isAccepting` only becomes true on the next render, so two clicks landing in the same frame
  // both read it as false and fire two POSTs. This flips synchronously inside the click handler,
  // closing that window; it is only released again if the request fails.
  const acceptLockRef = React.useRef(false);
  const { mutateAsync: createMeeting, isPending: isAccepting } = useCreateRiskReductionMeeting();
  const { mutateAsync: dismissAlert, isPending: isDismissing } = useDeleteProjectAlert();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // `useParams` types every segment as `string | string[]`. This route carries the project alert
  // id — the same id `AwarenessPage` links to signals with — whose `riskReductionMeeting` field
  // holds the meeting record as a JSON-encoded string.
  const id = String(params?.id ?? '');

  // Set when this screen is reached from an already-recorded meeting (e.g. the Risk Reduction
  // Meeting tab on Early Warning Detail) rather than from the awareness/signal triage queue —
  // the meeting is already linked to a registered EW, so Accept/Dismiss don't apply.
  const isReadOnly = searchParams.get('readonly') === 'true';

  const { data: alert, isLoading } = useGetProjectAlertById({ id, enabled: !!id });

  const detail = React.useMemo(
    () => parseRiskReductionMeeting(alert?.riskReductionMeeting),
    [alert]
  );

  const agreedActions = detail?.agreedActions ?? [];
  const totalActions = agreedActions.length;
  const completedCount = agreedActions.filter((a) => a.checked).length;

  const outcomeSoFar =
    totalActions === 0
      ? 'No agreed actions have been recorded for this meeting yet.'
      : completedCount === totalActions
        ? 'All agreed actions have been completed.'
        : `${completedCount} of ${totalActions} agreed actions completed so far.`;

  if (isLoading || !alert) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const clauseBadge =
    detail && detail.clauseDescription !== EM_DASH
      ? detail.clauseDescription
      : alert.clauseDescription || RRM_COPY.clauseBadgeFallback;

  // The meeting's own JSON blob only ever carries a clause description; the number and
  // title (when the mail named one) live on the alert's separate compensation-event read,
  // falling back to the alert's own fields when the extractor wrote them there instead.
  const alertClause = parseAlertCompensationEvent(alert.compensationEvent);
  const clauseNumber = alertClause?.clauseNumber || alert.clauseNumber || undefined;
  const clauseDescriptionForHeader =
    alertClause?.clauseDescription || alert.clauseDescription || undefined;

  /** Whether the signal may still be accepted is `EarlyWarningReferenceCard`'s decision — this
   *  only performs the accept, guarded by `acceptLockRef` against a same-frame double click. */
  const handleAccept = async ({ reference, earlyWarningId }: AcceptedEarlyWarning) => {
    if (acceptLockRef.current || refDecision === 'accept') return;
    acceptLockRef.current = true;

    try {
      await createMeeting({
        projectAlertId: alert.id,
        earlyWarningReference: reference,
        projectEmailId: alert.projectEmailId,
        clauseNumber: (alertClause?.clauseNumber || alert.clauseNumber || '').trim(),
        clauseTitle: (alertClause?.clauseTitle || alert.clauseTitle || '').trim(),
        clauseDescription: orEmpty(
          detail?.clauseDescription !== EM_DASH
            ? detail?.clauseDescription
            : (alertClause?.clauseDescription ?? alert.clauseDescription ?? undefined)
        ),
        meetingDetailObject: {
          meetingDate: toIsoDate(detail?.meetingDateRaw),
          location: orEmpty(detail?.format),
          participants: orEmpty(detail?.participantsText),
          summary: detail?.summary ?? '',
          outcomeSoFar,
        },
        agreedActions: agreedActions.map((act) => ({
          description: act.label,
          isCompleted: act.checked,
          responsibleParty: orEmpty(act.assignee),
          dueDate: toIsoDate(act.dueDateRaw) || null,
        })),
      });
      notification.success({ message: 'Early Warning Meeting accepted.' });
      setRefDecision('accept');
      // Land on the Early Warning the meeting was just recorded against, so the user sees the
      // record they created rather than the queue they came from. Only the register can say which
      // EW that is — with no match there is no detail page to open, so fall back to going back.
      if (earlyWarningId) {
        router.push(`${MENU_PATH.CCA_EARLY_WARNING_REGISTER.pathname}/detail/${earlyWarningId}`);
      } else {
        router.back();
      }
    } catch {
      // The axios interceptor already surfaces a global error toast on failure. Release the lock
      // so a genuine failure stays retryable — only a success is permanent.
      acceptLockRef.current = false;
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissAlert({ id: alert.id });
      notification.success({ message: 'Signal dismissed.' });
      router.push('/');
    } catch {
      // The axios interceptor already surfaces a global error toast on failure.
    }
  };

  return (
    <div>
      {/* --- Header --- */}
      <header className="mb-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="ds-heading-2 text-text tracking-tight">Early Warning Meeting</h1>
          {clauseNumber && (
            <span className="badge-success border-badge-success-soft ds-micro rounded border px-2 py-0.5 font-mono font-bold tracking-wider">
              NEC4 Cl. {clauseNumber}
            </span>
          )}
          {clauseDescriptionForHeader && (
            <Tooltip title={clauseDescriptionForHeader}>
              <InfoCircleOutlined
                aria-hidden
                className="cursor-help text-base text-slate-400 transition-colors hover:text-slate-600"
              />
            </Tooltip>
          )}
        </div>
        {clauseDescriptionForHeader && <p className="sr-only">{clauseDescriptionForHeader}</p>}
      </header>

      {/* --- Info Banner --- */}
      <div className="badge-info border-badge-info-soft mb-4 flex items-start gap-3 rounded border p-4">
        <InfoCircleFilled className="text-badge-info mt-0.5 shrink-0 text-base" />
        <div className="text-[13px] leading-relaxed">
          <p className="text-text font-semibold">{alert.title}</p>
          {alert.description && <p className="-mt-2!">{alert.description}</p>}
        </div>
      </div>

      {/* --- Stat Row --- */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <RrmStatCard label={stats.clause.label} value={clauseBadge} note={stats.clause.note} />
        <RrmStatCard
          label={stats.meetingHeld.label}
          value={detail?.meetingDateShort ?? EM_DASH}
          note={detail?.format ?? EM_DASH}
        />
        <RrmStatCard
          label={stats.participants.label}
          value={String(detail?.participantCount ?? 0)}
          note={detail?.participantsText ?? ''}
        />
        <RrmStatCard
          label={stats.actions.label}
          value={`${completedCount} / ${totalActions}`}
          note={stats.actions.note}
        />
      </div>

      {/* --- Two-Column Layout --- */}
      <div className={`grid grid-cols-1 gap-2 ${isReadOnly ? '' : 'lg:grid-cols-3'}`}>
        {/* Left Column: Core Details & Action Tracker */}
        <div className={`space-y-2 ${isReadOnly ? '' : 'lg:col-span-2'}`}>
          {/* Meeting Details */}
          <div className={CARD}>
            <h3 className="heading-card border-b border-slate-100 pb-1">
              {RRM_COPY.meetingDetailsTitle}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RrmMetaRow
                icon={<CalendarOutlined />}
                label={labels.meetingDate}
                value={detail?.meetingDate ?? EM_DASH}
              />
              <RrmMetaRow
                icon={<EnvironmentOutlined />}
                label={labels.format}
                value={detail?.format ?? EM_DASH}
              />
            </div>

            <RrmMetaRow
              icon={<TeamOutlined />}
              label={labels.participants}
              value={detail?.participantsText ?? EM_DASH}
            />

            <div className="border-t border-slate-100 pt-4">
              <span className={META_LABEL}>{labels.summary}</span>
              <p className="px-0 text-[13px] leading-relaxed text-slate-700">
                {detail?.summary || (
                  <span className="text-xs text-slate-400">{RRM_COPY.summaryEmptyState}</span>
                )}
              </p>
            </div>
          </div>

          {/* Outcome so far */}
          <div className={CARD}>
            <h3 className="heading-card border-b border-slate-100 pb-1">
              {RRM_COPY.outcomeSoFarTitle}
            </h3>
            <div className="badge-info border-badge-info-soft flex items-start gap-3 rounded border p-4">
              <ClockCircleOutlined className="text-badge-info mt-0.5 shrink-0 text-base" />
              <div className="text-[13px] leading-relaxed">{outcomeSoFar}</div>
            </div>
          </div>

          {/* Agreed Actions */}
          <AgreedActionsCard actions={agreedActions} />
        </div>

        {/* Right Column: Reference & Next Steps — hidden once the meeting is already linked to a
            registered EW and viewed read-only from Early Warning Detail. */}
        {!isReadOnly && (
          <div className="space-y-2 lg:col-span-1">
            <EarlyWarningReferenceCard
              alert={alert}
              isAccepting={isAccepting}
              isDismissing={isDismissing}
              isAcceptedLocally={refDecision === 'accept'}
              onAccept={handleAccept}
              onDismiss={handleDismiss}
            />

            {/* The mail the minutes were extracted from — read it before deciding. */}
            <RiskReductionMeetingEmailCard alert={alert} />
          </div>
        )}
      </div>
    </div>
  );
}
