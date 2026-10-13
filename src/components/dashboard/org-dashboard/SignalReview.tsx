'use client';

/**
 * SignalReview
 * Detail screen — "Review — Contractor Email"
 * Route: /projects/signals/[id]  →  app/(dashboard)/projects/signals/[id]/page.tsx
 */

import { FileTextOutlined } from '@ant-design/icons';
import { Input, notification, Skeleton } from 'antd';
import { Mail, TriangleAlert } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import { ALERT_TYPE_META, DEFAULT_TYPE_META } from '@/constants/org-dashboard.constants';
import { useDownloadAttachment } from '@/hooks/modules/attachments';
import { useGetProjectEmailConversationDetails } from '@/hooks/modules/project';
import {
  getPrimaryAlertEmail,
  humanizeCamelCase,
  parseImpactAssessment,
  parseMissingInformation,
  useGetProjectAlertById,
  useNotAcceptProjectAlert,
} from '@/hooks/modules/project-alerts';
import {
  type ClauseChip,
  CompensationEventPageHeader,
  formatDaysRemaining,
  getAlertDeadline,
  getTimeBarForDeadline,
  isTimeBarRunning,
  resolveAlertClauseChip,
} from '@/modules/compensation-event';
import { useProjectAlertBridgeStore } from '@/store/project-alert.store';
import { AlertEmailItem } from './AlertEmailItem';
import {
  REVIEW_COLORS as C,
  type DecisionKey,
  formatAlertTimestamp,
  getAcceptDestination,
  getConfidenceTier,
  getDecisionCards,
  IMPACT_TYPE_LABEL,
} from './signal-review.helpers';
import {
  AssessmentBullet,
  DecisionButton,
  GapRow,
  ReviewRail,
  SectionCard,
  SectionHeading,
} from './signal-review.parts';

export default function SignalReview() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');

  const { data: alert, isLoading } = useGetProjectAlertById({ id, enabled: !!id });
  const { mutateAsync: notAcceptAlert, isPending: isNotAccepting } = useNotAcceptProjectAlert();
  const { mutate: downloadAttachment } = useDownloadAttachment();
  // Attachments hang off the mail thread rather than the alert — the rail's Attachment tile and
  // the email card's own attachment row both read them from here.
  const { data: conversationDetails } = useGetProjectEmailConversationDetails({
    projectId: alert?.projectId,
    conversationId: alert?.conversationId ?? undefined,
  });
  const [decision, setDecision] = useState<DecisionKey | null>(null);
  const [notAcceptedReason, setNotAcceptedReason] = useState('');
  // `null` means "untouched" — resolved below to just the first email once the alert has loaded.
  const [openEmailIds, setOpenEmailIds] = useState<string[] | null>(null);
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const setPendingProjectAlert = useProjectAlertBridgeStore((s) => s.setPendingProjectAlert);

  if (isLoading || !alert) return <Skeleton active paragraph={{ rows: 10 }} />;

  // The alert's own email fields (sender/to/cc/subject/body) live on `projectAlertEmails`, not the alert itself.
  const primaryEmail = getPrimaryAlertEmail(alert);
  const alertEmails = alert.projectAlertEmails ?? [];
  const hasMultipleEmails = alertEmails.length > 1;
  const defaultOpenEmailIds = alertEmails.slice(0, 1).map((email) => email.id);
  const resolvedOpenEmailIds = openEmailIds ?? defaultOpenEmailIds;
  const allEmailsExpanded =
    alertEmails.length > 0 && resolvedOpenEmailIds.length === alertEmails.length;
  const attachments = conversationDetails?.[0]?.attachments ?? [];

  const toggleEmail = (emailId: string) =>
    setOpenEmailIds((prev) => {
      const current = prev ?? defaultOpenEmailIds;
      return current.includes(emailId)
        ? current.filter((openId) => openId !== emailId)
        : [...current, emailId];
    });

  const toggleAllEmails = () =>
    setOpenEmailIds(allEmailsExpanded ? [] : alertEmails.map((email) => email.id));

  const gaps = parseMissingInformation(alert.missingInformation).map((item) => ({
    title: humanizeCamelCase(item.label),
    detail: item.description,
  }));

  const impact = parseImpactAssessment(alert.impactAssessment);
  // The assessment's bullet list — whichever of the three impact fields the extractor filled in.
  const findings = [
    impact?.potentialImpacts && { label: 'Potential impact', value: impact.potentialImpacts },
    impact?.keyDatesAffected && { label: 'Key dates affected', value: impact.keyDatesAffected },
    impact?.proposedActions && { label: 'Proposed action', value: impact.proposedActions },
  ].filter((finding): finding is { label: string; value: string } => Boolean(finding));

  // Read off the same map the row's badge uses, so a Programme alert doesn't surface the
  // backend's `Programee` spelling and a type with no entry still reads as a plain "Signal".
  const humanizedType = (ALERT_TYPE_META[alert.alertType] ?? DEFAULT_TYPE_META).fullLabel;
  const typeArticle = /^[aeiou]/i.test(humanizedType) ? 'an' : 'a';
  const flaggedSummary = `Auspira has flagged this as a possible ${humanizedType}. Review before any register entry is created.`;
  const confidenceTier =
    typeof alert.confidencePercentage === 'number'
      ? getConfidenceTier(alert.confidencePercentage)
      : null;

  const timeBar = getTimeBarForDeadline(getAlertDeadline(alert));

  // What the notice band says — the signal's summary, falling back to the read Auspira wrote
  // when the backend left `summary` null.
  const noticeSummary = alert.summary?.trim() || alert.description?.trim() || '';

  // Straight off the response: the chip prints the clause numbers the extractor found, and the
  // clause sentence the backend wrote rides its tooltip. A signal that names no number keeps the
  // icon alone — nothing is invented to fill the label.
  const headerClause: ClauseChip | undefined =
    resolveAlertClauseChip(alert) ??
    (alert.clauseDescription ? { lines: [alert.clauseDescription] } : undefined);

  const handleAccept = async () => {
    setDecision('accept');
    // An Early Warning signal records the acceptance server-side before the register form opens
    // — the backend creates the EW from the alert itself, so the decision is captured even if
    // the user abandons the form. CE-family signals have no such endpoint and go straight through.
    // if (alert.alertType === ProjectAlertType.EarlyWarning) {
    //   try {
    //     await acceptEarlyWarning({
    //       projectAlertId: alert.id,
    //       conversationId: alert.conversationId,
    //     });
    //   } catch {
    //     // The axios interceptor already surfaces a global error toast — stay on the review
    //     // screen rather than opening a register form for an acceptance that never landed.
    //     return;
    //   }
    // }
    // The alert object cannot ride the URL, so every destination reads it off the bridge store.
    setPendingProjectAlert(alert);
    // CE-family signals are already CE artefacts, so they skip the Early Warning register:
    // a compensation event opens the CE creation screen, a quotation opens the Contractor
    // Quotation screen keyed by the alert id.
    router.push(getAcceptDestination(alert.alertType, alert.id));
  };

  const handleNotAccepted = async () => {
    // The decision is contractual, so it is written down: the first click opens the reason card
    // and only a second one — with a reason in it — records the signal as not accepted.
    if (decision !== 'notAccepted') {
      setDecision('notAccepted');
      return;
    }
    const reason = notAcceptedReason.trim();
    if (!reason) return;
    try {
      await notAcceptAlert({ projectAlertId: alert.id, reason });
      notification.success({ message: `${humanizedType} recorded as not accepted.` });
      router.back();
    } catch {
      // The axios interceptor already surfaces a global error toast on failure — keep the reason
      // the PM just typed on screen rather than losing it to a retry.
    }
  };

  const decisionCards = getDecisionCards();

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header — the CE workflow's shared title bar, so the review screen reads like every
          other screen in the flow. The clause chip carries its own tooltip. */}
      <CompensationEventPageHeader
        title={`Review — ${alert.title}`}
        clause={headerClause}
        icon={<FileTextOutlined style={{ color: C.main, fontSize: 38 }} />}
      />
      {/* Why the signal was raised — one-time context, carried for screen readers only; the
          notice band below says what Auspira read in the email. */}
      <p className="sr-only">{flaggedSummary}</p>

      {/* The signal's summary — what the notice is about. The clause it stands under is not
          repeated here: it hangs off the header chip, on hover. */}
      {noticeSummary && (
        <div
          className="rounded-md border px-5 py-3"
          style={{ background: C.mainSoft, borderColor: C.bannerBorder }}
        >
          <p className="ds-body! my-0 leading-relaxed" style={{ color: C.text }}>
            {noticeSummary}
          </p>
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Email card */}
          {alert.projectEmailId && alertEmails.length > 0 ? (
            /* max-h + the scroll wrapper below keep the card header pinned while the emails
               themselves scroll — otherwise a long thread pushes the decision cards off-screen. */
            <SectionCard className="flex max-h-[720px] flex-col overflow-hidden">
              <div className="shrink-0 border-b px-6 py-5" style={{ borderColor: C.border }}>
                <SectionHeading
                  icon={Mail}
                  tone="main"
                  title="Contractor Email — As Received"
                  trailing={
                    <div className="flex shrink-0 items-center gap-3">
                      {hasMultipleEmails && (
                        <button
                          type="button"
                          onClick={toggleAllEmails}
                          className="ds-micro! font-semibold! transition-opacity hover:opacity-70"
                          style={{ color: C.main }}
                        >
                          {allEmailsExpanded ? 'Collapse all' : 'Expand all'}
                        </button>
                      )}
                      <span className="ds-caption!" style={{ color: C.textMuted }}>
                        {formatAlertTimestamp(alert.createdOn)}
                      </span>
                    </div>
                  }
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {alertEmails.map((email, index) => (
                  <AlertEmailItem
                    key={email.id}
                    email={email}
                    fallbackBody={alert.description}
                    open={resolvedOpenEmailIds.includes(email.id)}
                    onToggle={() => toggleEmail(email.id)}
                    // The thread owns the attachments, so they are listed against its first email.
                    attachments={index === 0 ? attachments : undefined}
                    onDownloadAttachment={(url, fileName) => downloadAttachment({ url, fileName })}
                  />
                ))}
              </div>
            </SectionCard>
          ) : (
            <SectionCard className="px-6 py-5">
              <p className="ds-body! my-0 font-bold!" style={{ color: C.text }}>
                {alert.title}
              </p>
              <p className="ds-caption! mt-2 mb-0 leading-relaxed" style={{ color: C.textMuted }}>
                {alert.description}
              </p>
            </SectionCard>
          )}

          {/* Assessment */}
          <SectionCard className="px-6 py-5">
            <p
              className="ds-body! my-0 font-bold! tracking-wider uppercase"
              style={{ color: C.text }}
            >
              Auspira Assessment — What Was Detected
            </p>
            {/* Dropped when the notice band above is already printing this same paragraph — the
                backend leaves `summary` null often enough for both to fall back to it. */}
            {alert.description && alert.description.trim() !== noticeSummary && (
              <p className="ds-caption! mt-3 mb-0 leading-relaxed" style={{ color: C.textMuted }}>
                {alert.description}
              </p>
            )}

            {impact && impact.impactTypes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {impact.impactTypes.map((type) => (
                  <span
                    key={type}
                    className="ds-micro! rounded-full px-2 py-0.5 font-semibold!"
                    style={{ background: C.mainSoft, color: C.main }}
                  >
                    {IMPACT_TYPE_LABEL[type] ?? humanizeCamelCase(type)}
                  </span>
                ))}
              </div>
            )}

            {findings.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                {findings.map((finding) => (
                  <AssessmentBullet
                    key={finding.label}
                    label={finding.label}
                    value={finding.value}
                  />
                ))}
              </div>
            )}

            {alert.clauseDescription && (
              <p className="ds-caption! mt-4 mb-0 leading-relaxed" style={{ color: C.textMuted }}>
                Note: Auspira cannot confirm this is a valid {humanizedType} — that is a contractual
                decision for you as PM. The assessment is based on {alert.clauseDescription}
              </p>
            )}
          </SectionCard>

          {/* Missing info — dropped entirely when the email had no gaps. A card that only says
              "nothing missing" is noise on a screen the reviewer is scanning for problems. */}
          {gaps.length > 0 && (
            <SectionCard className="px-6 py-5">
              <SectionHeading
                icon={TriangleAlert}
                tone="warning"
                title="Missing from contractor's email"
                trailing={
                  <span className="ds-caption! shrink-0" style={{ color: C.orange }}>
                    {gaps.length} gap{gaps.length === 1 ? '' : 's'} found
                  </span>
                }
              />
              <div className="mt-4 flex flex-col gap-3">
                {gaps.map((gap) => (
                  <GapRow key={gap.title} title={gap.title} detail={gap.detail} />
                ))}
              </div>
            </SectionCard>
          )}

          {/* Reason — opened by the "Not Accepted" card, which then records the decision. */}
          {decision === 'notAccepted' && (
            <SectionCard
              className="px-6 py-5"
              style={{ background: C.redWash, borderColor: C.redBorder }}
            >
              <SectionHeading
                icon={TriangleAlert}
                tone="danger"
                title={`Reason for not accepting as ${humanizedType}`}
              />
              <div
                className="mt-4 rounded-md border p-4"
                style={{ background: C.redWash, borderColor: C.red }}
              >
                <Input.TextArea
                  autoFocus
                  rows={3}
                  value={notAcceptedReason}
                  disabled={isNotAccepting}
                  onChange={(event) => setNotAcceptedReason(event.target.value)}
                  placeholder={`Add a reason for not accepting as ${humanizedType.toLowerCase()}...`}
                  aria-label={`Reason for not accepting as ${humanizedType}`}
                  className="resize-none border-0! bg-transparent! p-0! shadow-none!"
                  style={{ color: C.textLow }}
                />
              </div>
            </SectionCard>
          )}

          {/* Decision */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {decisionCards.map((card) => (
              <DecisionButton
                key={card.key}
                icon={card.icon}
                tone={card.key === 'accept' ? 'success' : 'dangerOutline'}
                title={card.title}
                selected={decision === card.key}
                disabled={isNotAccepting}
                onClick={() => {
                  void (card.key === 'accept' ? handleAccept() : handleNotAccepted());
                }}
              />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <ReviewRail
          timeBar={
            isTimeBarRunning(timeBar)
              ? {
                  daysLabel: formatDaysRemaining(timeBar.daysRemaining),
                  deadlineLabel: timeBar.deadlineLabel,
                }
              : undefined
          }
          thread={
            alert.projectEmailId
              ? { disabled: !alert.conversationId, onOpen: () => setThreadModalOpen(true) }
              : undefined
          }
          attachmentCount={attachments.length}
          onDownloadAttachments={() => {
            for (const file of attachments) {
              downloadAttachment({ url: file.url, fileName: file.name });
            }
          }}
          confidence={
            confidenceTier
              ? {
                  percentage: alert.confidencePercentage,
                  color: confidenceTier.color,
                  caption: `${confidenceTier.label} — ${confidenceTier.qualifier} ${typeArticle} ${humanizedType}`,
                }
              : undefined
          }
        />
      </div>

      <EmailThreadModal
        open={threadModalOpen}
        projectId={alert.projectId}
        conversationId={alert.conversationId}
        subjectFallback={primaryEmail?.emailSubject ?? undefined}
        onClose={() => setThreadModalOpen(false)}
      />
    </div>
  );
}
