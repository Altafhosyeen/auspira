'use client';

/**
 * Signal review — the presentational primitives the screen is built from.
 * Split out of SignalReview.tsx so the screen file holds only data and decisions.
 */

import { Download, Eye, type LucideIcon, MessagesSquare, Paperclip, Timer } from 'lucide-react';
import type React from 'react';
import ButtonX from '@/components/antd/ButtonX';
import { REVIEW_COLORS as C } from './signal-review.helpers';

type ChipTone = 'main' | 'warning' | 'danger' | 'success' | 'dangerOutline';

const CHIP_TONE: Record<ChipTone, { background: string; borderColor: string; color: string }> = {
  main: { background: C.mainSoft, borderColor: C.mainBorder, color: C.main },
  warning: { background: C.orangeSoft, borderColor: C.orangeBorder, color: C.orange },
  danger: { background: C.redSoft, borderColor: C.redBorder, color: C.red },
  success: { background: C.green, borderColor: C.green, color: '#FFFFFF' },
  dangerOutline: { background: '#FFFFFF', borderColor: C.red, color: C.red },
};

/** The 32px squircle every section title wears in front of it. */
export const IconChip: React.FC<{ icon: LucideIcon; tone: ChipTone; className?: string }> = ({
  icon: Icon,
  tone,
  className = '',
}) => (
  <span
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${className}`}
    style={CHIP_TONE[tone]}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
  </span>
);

/** White panel with the design's hairline border — every block on the screen sits in one. */
export const SectionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style }) => (
  <div
    className={`rounded-md border bg-white ${className}`}
    style={{ borderColor: C.border, ...style }}
  >
    {children}
  </div>
);

export const SectionHeading: React.FC<{
  icon: LucideIcon;
  tone: ChipTone;
  title: string;
  trailing?: React.ReactNode;
}> = ({ icon, tone, title, trailing }) => (
  <div className="flex items-center gap-2.5">
    <IconChip icon={icon} tone={tone} />
    <span className="ds-body! min-w-0 flex-1 font-bold!" style={{ color: C.text }}>
      {title}
    </span>
    {trailing}
  </div>
);

/** One inset tile in the "Documents & Communication" rail card. */
export const RailTile: React.FC<{
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, children, action }) => (
  <SectionCard className="px-2 py-3.5">
    <div className="flex items-start gap-2.5">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl"
        style={{ background: C.main }}
      >
        <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="ds-caption! my-0 font-semibold!" style={{ color: C.main }}>
          {title}
        </p>
        {children}
      </div>
    </div>
    {action && <div className="mt-2 flex justify-end">{action}</div>}
  </SectionCard>
);

/** Label/value line in the email header block — the label column is fixed so values line up. */
export const MetaRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="grid grid-cols-[96px_minmax(0,1fr)] items-baseline gap-3 py-1">
    <span className="ds-caption!" style={{ color: C.textMuted }}>
      {label}
    </span>
    <span className="ds-caption! min-w-0">{children}</span>
  </div>
);

/** A gap the extractor could not fill — dot, field name, and why it is missing. */
export const GapRow: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="flex items-start gap-2.5">
    <span
      className="mt-[6px] h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: C.red }}
      aria-hidden="true"
    />
    <div className="min-w-0">
      <p className="ds-caption! my-0 font-semibold!" style={{ color: C.text }}>
        {title}
      </p>
      <p className="ds-caption! mt-1 mb-0 leading-relaxed" style={{ color: C.textMuted }}>
        {detail}
      </p>
    </div>
  </div>
);

/** One detected finding in the assessment card — bulleted, with the finding itself in bold. */
export const AssessmentBullet: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start gap-2">
    <span className="ds-caption!" style={{ color: C.textMuted }} aria-hidden="true">
      •
    </span>
    <p className="ds-caption! my-0 leading-relaxed" style={{ color: C.textMuted }}>
      <span className="font-bold!" style={{ color: C.text }}>
        {label}
      </span>{' '}
      → {value}
    </p>
  </div>
);

export const DecisionButton: React.FC<{
  icon: LucideIcon;
  tone: ChipTone;
  title: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ icon, tone, title, selected, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    aria-pressed={selected}
    onClick={onClick}
    className="flex items-start cursor-pointer gap-2.5 rounded-md border bg-white px-4 py-3 text-left transition-all enabled:hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
    style={{
      borderColor: selected ? CHIP_TONE[tone].color : C.border,
      boxShadow: selected ? `inset 0 0 0 1px ${CHIP_TONE[tone].color}` : undefined,
    }}
  >
    <div className="flex items-center gap-2.5">
      <IconChip icon={icon} tone={tone} className="h-7! w-7!" />
      <span className="min-w-0">
        <span className="ds-caption! block font-semibold!" style={{ color: C.text }}>
          {title}
        </span>
      </span>
    </div>
  </button>
);

/**
 * The right-hand rail — the documents and communication tiles for the signal on screen, and the
 * extractor's confidence in it. Every tile is dropped when the signal has nothing to put in it.
 */
export const ReviewRail: React.FC<{
  timeBar?: { daysLabel: string; deadlineLabel: string };
  thread?: { disabled: boolean; onOpen: () => void };
  attachmentCount: number;
  onDownloadAttachments: () => void;
  confidence?: { percentage: number; color: string; caption: string };
}> = ({ timeBar, thread, attachmentCount, onDownloadAttachments, confidence }) => (
  <div className="flex flex-col gap-4">
    <SectionCard className="flex flex-col gap-4 px-4 py-6">
      <p className="ds-body! my-0 font-bold!" style={{ color: C.main }}>
        Documents &amp; Communication
      </p>

      {timeBar && (
        <RailTile icon={Timer} title="Time Bar">
          <p className="ds-body! mt-1 mb-0 font-bold!" style={{ color: C.timeBar }}>
            {timeBar.daysLabel}
          </p>
          <p className="ds-caption! mt-1 mb-0" style={{ color: C.text }}>
            Deadline - {timeBar.deadlineLabel}
          </p>
        </RailTile>
      )}

      {thread && (
        <RailTile
          icon={MessagesSquare}
          title="Email Thread"
          action={
            <ButtonX
              size="small"
              icon={<Eye className="h-3.5 w-3.5" />}
              iconPosition="end"
              disabled={thread.disabled}
              disabledReason="No linked email conversation to open yet."
              onClick={thread.onOpen}
              style={{ color: C.main }}
            >
              View
            </ButtonX>
          }
        >
          <p className="ds-caption! mt-1 mb-0 leading-relaxed" style={{ color: C.text }}>
            View related email conversations and communications.
          </p>
        </RailTile>
      )}

      {attachmentCount > 0 && (
        <RailTile
          icon={Paperclip}
          title="Attachment"
          action={
            <ButtonX
              size="small"
              icon={<Download className="h-3.5 w-3.5" />}
              iconPosition="end"
              onClick={onDownloadAttachments}
              style={{ color: C.main }}
            >
              Download
            </ButtonX>
          }
        >
          <p className="ds-caption! mt-1 mb-0 leading-relaxed" style={{ color: C.text }}>
            View and download all related attachments.
          </p>
        </RailTile>
      )}
    </SectionCard>

    {confidence && (
      <SectionCard className="px-4 py-4">
        <p className="ds-caption! mt-0 mb-2" style={{ color: C.text }}>
          Confidence Score
        </p>
        <ConfidenceMeter
          percentage={confidence.percentage}
          color={confidence.color}
          caption={confidence.caption}
        />
      </SectionCard>
    )}
  </div>
);

const ConfidenceMeter: React.FC<{
  percentage: number;
  color: string;
  caption: string;
}> = ({ percentage, color, caption }) => (
  <>
    <p className="my-0 text-[2.375rem] leading-none font-bold" style={{ color }}>
      {percentage}%
    </p>
    <p className="ds-caption! mt-2 mb-2" style={{ color: C.textMuted }}>
      {caption}
    </p>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/6">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(Math.max(percentage, 0), 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  </>
);
