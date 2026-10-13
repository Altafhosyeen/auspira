'use client';

import { Badge } from 'antd';
import { Loader2, Mail, Paperclip } from 'lucide-react';
import type React from 'react';
import {
  isInboundEmail,
  type ProjectEmail,
} from '@/components/contract-control-agent/action-queue.data';
import { EMAIL_DIRECTION_COLORS } from '@/components/contract-control-agent/email-thread-list.utils';
import { ChevronRightIcon } from '@/components/module/project/third-step/cross-reference/icons';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { useDownloadAttachment } from '@/hooks/modules/attachments';
import { formatSentAt, getAttachments, initialsOf, personaColor, toSnippet } from '../utils';
import { EmailBodyFrame } from './EmailBodyFrame';

/** One message in the conversation — collapsed to a snippet until clicked, like Outlook. */
export const ThreadMessage: React.FC<{
  email: ProjectEmail;
  expanded: boolean;
  onToggle: () => void;
}> = ({ email, expanded, onToggle }) => {
  const sender = email.senderEmail || email.userEmail || 'Unknown sender';
  const inbound = isInboundEmail(email.boxType, email.source);
  const attachments = getAttachments(email);
  // Attachment URLs point at private storage — downloads go through the backend proxy.
  const { mutate: downloadAttachment, isPending, variables } = useDownloadAttachment();

  return (
    <div className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.11),0_0.3px_0.9px_rgba(0,0,0,0.07)]">
      {/* Message header — always visible, toggles the body. */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f9f9f9]"
      >
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
          style={{ backgroundColor: personaColor(sender) }}
        >
          {initialsOf(sender)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[#242424]">{sender}</p>
          <p className="truncate text-[13px] font-semibold text-[#0078d4]">
            {email.subject || '(no subject)'}
          </p>

          {expanded ? (
            <div className="mt-1 space-y-0.5">
              {email.toEmails && (
                <p className="truncate text-[12px] font-medium text-[#3b3a39]">
                  To: {email.toEmails}
                </p>
              )}
              {email.ccEmails && (
                <p className="truncate text-[12px] font-medium text-[#3b3a39]">
                  Cc: {email.ccEmails}
                </p>
              )}
            </div>
          ) : (
            <p className="truncate text-[12px] font-medium text-[#3b3a39]">
              {toSnippet(email.body || '') || '(no content)'}
            </p>
          )}
          <div className="flex space-x-3">
            {email.source && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#3b3a39]">
                <Mail className="h-3 w-3 shrink-0" />
                Source: {email.source}
              </p>
            )}
            {attachments?.length > 0 && (
              <span className="-mt-3 flex items-center gap-1 text-[12px] font-medium whitespace-nowrap text-[#616161]">
                <Paperclip className="h-3.5 w-3.5" />
                <Badge count={attachments.length} color="var(--color-main-p)" />
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 pl-2">
          <span className="text-[12px] whitespace-nowrap text-[#616161]">
            {formatSentAt(email.timestampUtc)}
          </span>
          <span
            className="ds-micro! rounded-full px-2 py-0.5 font-bold! whitespace-nowrap"
            style={{
              backgroundColor: EMAIL_DIRECTION_COLORS[inbound ? 'in' : 'out'].background,
              color: EMAIL_DIRECTION_COLORS[inbound ? 'in' : 'out'].text,
            }}
          >
            {inbound ? 'Inbound' : 'Outbound'}
          </span>

          <ChevronRightIcon
            className={`mt-1 h-4 w-4 text-[#616161] transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {(expanded || attachments?.length > 0) && (
        <div className="border-t border-[#f0f0f0] px-4 py-4">
          {expanded && <EmailBodyFrame html={email.body || '<p>(no content)</p>'} />}

          {attachments.length > 0 && (
            <div className={expanded ? 'mt-3 border-t border-[#f0f0f0] pt-3' : ''}>
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-[#616161] uppercase">
                {attachments.length} attachment{attachments.length === 1 ? '' : 's'}
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, i) => {
                  const downloading = isPending && variables?.url === att.url;
                  return (
                    <DisabledTooltip
                      key={att.url || i}
                      disabled={downloading}
                      reason="Download in progress."
                    >
                      <button
                        type="button"
                        disabled={downloading}
                        onClick={() => downloadAttachment({ url: att.url, fileName: att.name })}
                        className="flex max-w-60 cursor-pointer items-center gap-1.5 rounded-md border border-[#e0e0e0] bg-[#faf9f8] px-2.5 py-1.5 text-[12px] font-medium text-[#0078d4] transition-colors hover:bg-[#f3f2f1] disabled:cursor-wait disabled:opacity-60"
                      >
                        {downloading ? (
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#616161]" />
                        ) : (
                          <Paperclip className="h-3.5 w-3.5 shrink-0 text-[#616161]" />
                        )}
                        <span className="truncate">{att.name}</span>
                      </button>
                    </DisabledTooltip>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
