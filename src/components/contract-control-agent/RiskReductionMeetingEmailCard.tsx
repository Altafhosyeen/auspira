'use client';

import React from 'react';
import type { ProjectAlert, ProjectAlertEmail } from '@/hooks/modules/project-alerts';
import { EmailThreadModal } from '../contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import type { ProjectEmail } from './action-queue.data';
import {
  DirectionIcon,
  emailDirection,
  formatSentAt,
  initialsOf,
  personaColor,
  toSnippet,
} from './email-thread-list.utils';
import { RRM_CARD as CARD } from './risk-reduction-meeting.data';

/**
 * The alert's emails carry no timestamp of their own, so every row is stamped with the alert's
 * `createdOn` — the moment the mail was ingested, which is the closest thing the payload has.
 * Shaped as `ProjectEmail` so the thread viewer can render them directly when the alert has no
 * `conversationId` to fetch a real thread with (see `fallbackMessages` on `EmailThreadModal`).
 */
const toFallbackMessage = (alert: ProjectAlert, email: ProjectAlertEmail): ProjectEmail => ({
  id: email.id,
  provider: 0,
  type: '',
  userEmail: '',
  userId: '',
  timestampUtc: alert.createdOn,
  subject: email.emailSubject ?? '',
  body: email.emailBody ?? email.description ?? '',
  conversationId: alert.conversationId ?? '',
  messageId: '',
  // The signal is always raised off mail that arrived, never off mail Auspira sent.
  boxType: 1,
  senderEmail: email.emailSender ?? '',
  ccEmails: email.emailCc,
  toEmails: email.emailTo,
  source: '',
});

/**
 * The source mail behind the meeting signal, shown alongside the Early Warning Reference card so
 * the reviewer can read what the minutes were extracted from before accepting. Each row opens the
 * full Outlook-style thread viewer — on `conversationId` where the alert has one, and on the
 * alert's own emails where it does not.
 */
export default function RiskReductionMeetingEmailCard({ alert }: { alert: ProjectAlert }) {
  const [threadModalOpen, setThreadModalOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<string | undefined>(undefined);

  const emails = alert.projectAlertEmails ?? [];
  const fallbackMessages = React.useMemo(
    () => emails.map((email) => toFallbackMessage(alert, email)),
    [alert, emails]
  );

  // Nothing to open and nothing to preview — a signal raised from a daily site report rather than
  // from mail, so the card would be an empty shell on the page.
  if (emails.length === 0 && !alert.conversationId) return null;

  const openThread = (subject?: string | null) => {
    setSelectedSubject(subject ?? undefined);
    setThreadModalOpen(true);
  };

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
        <h3 className="heading-card">Email Thread</h3>
        {emails.length > 1 && (
          <span className="bg-main-p/10 text-main-p ds-micro rounded-full px-2 py-0.5 font-bold">
            {emails.length}
          </span>
        )}
      </div>

      {emails.length === 0 ? (
        <button
          type="button"
          onClick={() => openThread(null)}
          className="w-full rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
        >
          <p className="ds-caption! my-0 font-semibold! text-slate-800">Open the linked thread</p>
          <p className="ds-micro! mt-0.5 mb-0 text-slate-400">{formatSentAt(alert.createdOn)}</p>
        </button>
      ) : (
        <div className="flex max-h-84 flex-col gap-2 overflow-y-auto pr-1">
          {emails.map((email) => {
            const sender = email.emailSender || 'Unknown sender';
            const direction = emailDirection({ boxType: 1, body: email.emailBody });
            return (
              <button
                key={email.id}
                type="button"
                onClick={() => openThread(email.emailSubject)}
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
                      {email.emailSubject || '(no subject)'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {toSnippet(email.emailBody || email.description || '') || '(no content)'}
                    </p>
                    <p className="mt-1 text-[10px] whitespace-nowrap text-slate-400">
                      {formatSentAt(alert.createdOn)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <EmailThreadModal
        open={threadModalOpen}
        projectId={alert.projectId}
        conversationId={alert.conversationId}
        subjectFallback={selectedSubject}
        fallbackMessages={fallbackMessages}
        onClose={() => setThreadModalOpen(false)}
      />
    </div>
  );
}
