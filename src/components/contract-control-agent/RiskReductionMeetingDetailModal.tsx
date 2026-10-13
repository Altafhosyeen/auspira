'use client';

import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Modal, Skeleton, Tooltip } from 'antd';
import React from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  useGetEarlyWarningById,
  useGetEarlyWarningConversations,
} from '@/hooks/modules/early-warning';
import { useGetRiskReductionMeetingById } from '@/hooks/modules/risk-reduction-meeting';
import { EmailThreadModal } from '../contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import type { ApiEarlyWarningDetail } from './early-warning-detail.map';
import {
  DirectionIcon,
  emailDirection,
  formatSentAt,
  initialsOf,
  personaColor,
  toSnippet,
} from './email-thread-list.utils';
import { RRM_CARD as CARD, RRM_COPY } from './risk-reduction-meeting.data';
import { toRrmDetailFromApi } from './risk-reduction-meeting.map';
import { RRM_META_LABEL, RrmStatCard } from './risk-reduction-meeting-shared';

const EM_DASH = '—';
const { labels, stats } = RRM_COPY;

export interface RiskReductionMeetingDetailModalProps {
  /** The meeting's own id (`row.id` from `RiskReductionMeetingTable`) — `null` keeps the modal closed. */
  riskReductionMeetingId: string | null;
  /** The early warning this meeting was recorded against — its reference/title show in the
   * header banner. Already cached by the EW detail page, so reading it here costs no request. */
  earlyWarningId?: string;
  onClose: () => void;
}

/** Read-only meeting record, fetched on open from `GET /api/risk-reduction-meetings/{id}`.
 * Reproduces the full `RiskReductionMeeting` screen's layout (stat row, Meeting Details, Outcome
 * so far, Agreed Actions) inside a modal instead of a dedicated page. */
const RiskReductionMeetingDetailModal = ({
  riskReductionMeetingId,
  earlyWarningId,
  onClose,
}: RiskReductionMeetingDetailModalProps) => {
  const { data, isLoading } = useGetRiskReductionMeetingById({
    riskReductionMeetingId: riskReductionMeetingId ?? '',
    enabled: !!riskReductionMeetingId,
  });

  const { data: earlyWarning } = useGetEarlyWarningById<ApiEarlyWarningDetail>({
    id: earlyWarningId ?? '',
    enabled: !!riskReductionMeetingId && !!earlyWarningId,
  });

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useGetEarlyWarningConversations({
      id: riskReductionMeetingId ?? '',
      enabled: !!riskReductionMeetingId,
    });

  const [threadModalOpen, setThreadModalOpen] = React.useState(false);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState('');

  const handleThreadClick = (conversationId: string, subject: string) => {
    setSelectedConversationId(conversationId);
    setSelectedSubject(subject);
    setThreadModalOpen(true);
  };

  const detail = React.useMemo(() => (data ? toRrmDetailFromApi(data) : null), [data]);
  const agreedActions = detail?.agreedActions ?? [];
  const totalActions = agreedActions.length;
  const completedCount = agreedActions.filter((a) => a.checked).length;
  const progressPct = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  const outcomeSoFar =
    totalActions === 0
      ? 'No agreed actions have been recorded for this meeting yet.'
      : completedCount === totalActions
        ? 'All agreed actions have been completed.'
        : `${completedCount} of ${totalActions} agreed actions completed so far.`;

  return (
    <Modal
      open={!!riskReductionMeetingId}
      onCancel={onClose}
      footer={null}
      centered
      width={1400}
      destroyOnHidden
      closable={false}
      styles={{ body: { maxHeight: '93vh', overflowY: 'auto', position: 'relative' } }}
    >
      {/* Close lives inside the scrollable body (AntD's pinned X floats over content on scroll) */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-500 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-700"
      >
        <CloseOutlined className="text-sm" />
      </button>

      {isLoading || !detail ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <div className="flex flex-col gap-4 pt-1">
          {/* Header — brand-tinted banner */}
          <div className="from-main-p/10 relative overflow-hidden rounded-xl border border-slate-200/80 bg-linear-to-br via-white to-white p-5">
            <span className="bg-main-p/5 pointer-events-none absolute -top-14 -right-10 h-44 w-44 rounded-full" />
            <span className="bg-main-p/5 pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full" />

            <div className="relative flex items-start gap-4 pr-8">
              <span className="bg-main-p shadow-main-p/25 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg">
                <CalendarOutlined className="text-xl" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="ds-micro text-main-p/80 font-bold tracking-widest uppercase">
                  Meeting Record
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <h3 className="ds-heading-3 text-text tracking-tight">
                    Early Warning Meeting Request
                  </h3>
                  {detail.clauseNumber && (
                    <span className="badge-success border-badge-success-soft ds-micro flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 font-semibold whitespace-nowrap">
                      {detail.clauseTitle
                        ? `Cl.${detail.clauseNumber} — ${detail.clauseTitle}`
                        : `Cl.${detail.clauseNumber}`}
                      {detail.clauseDescription !== EM_DASH && (
                        <Tooltip title={detail.clauseDescription}>
                          <InfoCircleOutlined className="cursor-help opacity-70" />
                        </Tooltip>
                      )}
                    </span>
                  )}
                </div>

                {earlyWarning && (
                  <p className="mt-1 truncate text-[13px] font-medium text-slate-600">
                    <span className="text-main-p font-semibold">{earlyWarning.reference}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    {earlyWarning.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <RrmStatCard
              label={stats.clause.label}
              value={detail.clauseDescription}
              note={stats.clause.note}
            />
            <RrmStatCard
              label={stats.meetingHeld.label}
              value={detail.meetingDateShort}
              note={detail.format}
            />
            <RrmStatCard
              label={stats.participants.label}
              value={String(detail.participantCount)}
              note={detail.participantsText}
            />
            <RrmStatCard
              label={stats.actions.label}
              value={`${completedCount} / ${totalActions}`}
              note={stats.actions.note}
            />
          </div>

          {/* Meeting Details + Related Threads — the meeting's linked email conversations sit
              alongside its details so a reader can jump straight to the correspondence that led
              to it, the same click-to-open pattern `EarlyWarningThreadsPanel` uses. */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`${CARD} lg:col-span-2`}>
              {/* <h3 className="heading-card border-b border-slate-100 pb-1">
                {RRM_COPY.meetingDetailsTitle}
              </h3> */}

              <div className="border-t border-slate-100 pt-4">
                <span className={RRM_META_LABEL}>{labels.summary}</span>
                <p className="px-0 text-[13px] leading-relaxed text-slate-700">
                  {detail.summary || (
                    <span className="text-xs text-slate-400">{RRM_COPY.summaryEmptyState}</span>
                  )}
                </p>
              </div>
            </div>

            <div className={`${CARD} flex flex-col lg:col-span-1`}>
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                <h3 className="heading-card">Related Threads</h3>
                {!isLoadingConversations && conversations.length > 0 && (
                  <span className="bg-main-p/10 text-main-p ds-micro rounded-full px-2 py-0.5 font-bold">
                    {conversations.length}
                  </span>
                )}
              </div>

              {isLoadingConversations ? (
                <Skeleton active paragraph={{ rows: 3 }} title={false} />
              ) : conversations.length === 0 ? (
                <EmptyState
                  icon={<MailOutlined className="text-lg text-slate-700" />}
                  title="No email threads yet"
                  description="Messages linked to this early warning will appear here once they arrive."
                />
              ) : (
                <div className="flex max-h-84 flex-col gap-2 overflow-y-auto pr-1">
                  {conversations.map((msg: any) => {
                    const sender = msg.senderEmail || 'Unknown sender';
                    const direction = emailDirection(msg);
                    return (
                      <button
                        key={msg.conversationId}
                        type="button"
                        onClick={() => handleThreadClick(msg.conversationId, msg.subject)}
                        className="w-full overflow-hidden rounded-lg border border-slate-200/80 bg-white text-left transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-2 px-3 py-2.5">
                          <span
                            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                            style={{ backgroundColor: personaColor(sender) }}
                          >
                            {initialsOf(sender)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">
                                {sender}
                              </p>
                              <DirectionIcon direction={direction} size="sm" />
                            </div>
                            <p className="text-main-p truncate text-xs font-semibold">
                              {msg.subject || '(no subject)'}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {toSnippet(msg.body || '') || '(no content)'}
                            </p>
                            <p className="mt-1 text-[10px] whitespace-nowrap text-slate-400">
                              {formatSentAt(msg.timestampUtc)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Outcome so far — same card as the RRM screen */}
          <div className={CARD}>
            <h3 className="heading-card border-b border-slate-100 pb-1">
              {RRM_COPY.outcomeSoFarTitle}
            </h3>
            <div className="badge-info border-badge-info-soft flex items-start gap-3 rounded border p-4">
              <ClockCircleOutlined className="text-badge-info mt-0.5 shrink-0 text-base" />
              <div className="text-[13px] leading-relaxed">{outcomeSoFar}</div>
            </div>
          </div>

          {/* Agreed Actions — same card as the RRM screen */}
          <div className={CARD}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h3 className="heading-card">{RRM_COPY.agreedActionsTitle}</h3>
              {/* <span className="ds-micro font-bold tracking-wider text-slate-400 uppercase">
                {completedCount} of {totalActions} {RRM_COPY.agreedActionsProgressSuffix} ·{' '}
                {progressPct}%
              </span> */}
            </div>

            {/* <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="bg-warning h-full rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div> */}

            <div className="w-full divide-y divide-slate-100">
              {totalActions === 0 ? (
                <p className="py-3.5 text-sm text-slate-400">No agreed actions recorded yet.</p>
              ) : (
                agreedActions.map((act) => (
                  <div
                    key={act.id}
                    className="flex w-full items-start justify-between gap-4 py-3.5 text-left"
                  >
                    <span className="flex min-w-0 items-start gap-2.5">
                      {act.checked ? (
                        <CheckCircleFilled className="text-success mt-0.5 text-base" />
                      ) : (
                        <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-200 bg-white" />
                      )}
                      <span
                        className={`text-sm font-medium ${act.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                      >
                        {act.label}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold tracking-wide whitespace-nowrap text-slate-400">
                      {act.assignee} · {act.dueDate}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <EmailThreadModal
        open={threadModalOpen}
        projectId={earlyWarning?.projectId}
        conversationId={selectedConversationId}
        subjectFallback={selectedSubject}
        onClose={() => setThreadModalOpen(false)}
      />
    </Modal>
  );
};

export default RiskReductionMeetingDetailModal;
