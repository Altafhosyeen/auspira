'use client';

import { ChevronDown } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import type { ProjectEmailConversationAttachment } from '@/hooks/modules/project';
import type { ProjectAlertEmail } from '@/hooks/modules/project-alerts';
import { REVIEW_COLORS as C } from './signal-review.helpers';
import { MetaRow } from './signal-review.parts';

/**
 * One email inside the "Contractor Email — As Received" card, rendered as a collapsible accordion
 * row. Open/closed state is owned by the parent so the header's expand/collapse-all control can
 * drive every row at once. The body iframe is unmounted while collapsed and re-measures itself on
 * every re-open, which keeps each row sized to its own content.
 */
export const AlertEmailItem: React.FC<{
  email: ProjectAlertEmail;
  /** Shown when the email carries no HTML body — falls back to the alert's own description. */
  fallbackBody?: string | null;
  open: boolean;
  onToggle: () => void;
  /** Thread attachments — passed to the email they are listed against, so the row is not repeated. */
  attachments?: ProjectEmailConversationAttachment[];
  onDownloadAttachment?: (url: string, fileName: string) => void;
}> = ({ email, fallbackBody, open, onToggle, attachments = [], onDownloadAttachment }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(420);

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: C.border }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-6 py-3 text-left transition-colors hover:bg-slate-50/60"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
          style={{ color: C.textMuted }}
        />
        {/* Subject only — the sender is already spelled out in the `From` row below. */}
        <span
          className="ds-caption! min-w-0 flex-1 truncate font-semibold!"
          style={{ color: C.text }}
        >
          {email.emailSubject || 'Email'}
        </span>
      </button>

      {open && (
        <>
          <div className="px-6 pb-1">
            {email.emailSender && (
              <MetaRow label="From">
                <span style={{ color: C.text }}>{email.emailSender}</span>
              </MetaRow>
            )}
            {email.emailTo && (
              <MetaRow label="To">
                <span style={{ color: C.text }}>{email.emailTo}</span>
              </MetaRow>
            )}
            {email.emailCc && (
              <MetaRow label="Cc">
                <span style={{ color: C.text }}>{email.emailCc}</span>
              </MetaRow>
            )}
            {email.emailSubject && (
              <MetaRow label="Subject">
                <span className="font-bold!" style={{ color: C.text }}>
                  {email.emailSubject}
                </span>
              </MetaRow>
            )}
            {attachments.length > 0 && (
              <MetaRow label="Attachment">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {attachments.map((file) => (
                    <button
                      key={file.url}
                      type="button"
                      onClick={() => onDownloadAttachment?.(file.url, file.name)}
                      className="underline underline-offset-2 transition-opacity hover:opacity-70"
                      style={{ color: C.main }}
                    >
                      {file.name}
                    </button>
                  ))}
                </span>
              </MetaRow>
            )}
          </div>
          {email.emailBody ? (
            <iframe
              ref={iframeRef}
              title={email.emailSubject || 'Email body'}
              srcDoc={email.emailBody}
              sandbox="allow-same-origin"
              scrolling="no"
              style={{ height: iframeHeight }}
              className="w-full border-0 px-2"
              onLoad={() => {
                const doc = iframeRef.current?.contentWindow?.document;
                if (doc) setIframeHeight(doc.documentElement.scrollHeight);
              }}
            />
          ) : (
            <div className="px-6 py-4">
              <p className="ds-caption! my-0 leading-relaxed" style={{ color: C.text }}>
                {email.description || fallbackBody}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
