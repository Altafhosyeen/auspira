'use client';

import { Empty, Timeline } from 'antd';
import { parseBackendDate } from '@/lib/utils';
import {
  AUDIT_ACTION_LABELS,
  resolveSharedAuditAction,
  type SharedAuditAction,
} from './audit-actions';
import { AUDIT_TAG_FALLBACK_TONE, AUDIT_TIMELINE, type AuditTagTone } from './audit-timeline.theme';
import AuditTimelineRow from './audit-timeline-row';

/** One logged activity, in the shape the shared audit-log endpoint returns. */
export interface AuditTrailListEntry {
  id: string;
  /** Raw `AuditActionType` enum name or ordinal. */
  actionType: string | number;
  /** Null unless the action ties to a lifecycle stage. */
  stage: string | null;
  performedBy: string;
  performedByUserFullName: string | null;
  createdOn: string;
  details: string | null;
  /** Set only for email-originated actions. */
  sender?: string | null;
}

interface AuditTrailListProps {
  entries: AuditTrailListEntry[];
  /** Empty-state copy. */
  emptyDescription?: string;
}

const TIMELINE_DOT_COLOR = '#0F4C81';

interface StageTag {
  label: string;
  tone: AuditTagTone;
}

// `stage` arrives as an enum name whose casing and separators aren't guaranteed, so it is
// normalised before lookup and falls back to a formatted version of the raw value. Covers
// the stage names Early Warning and Project Manager's Instruction trails emit today.
const formatStageTag = (rawStage?: string | null): StageTag | null => {
  const stage = rawStage?.trim();
  if (!stage) return null;

  const normalized = stage.toLowerCase().replace(/[\s_-]+/g, '');

  if (
    normalized === 'earlywarningmeeting' ||
    normalized === 'ewmeeting' ||
    normalized === 'meeting'
  ) {
    return {
      label: 'EW Meeting',
      tone: { color: '#1B3A5F', bgColor: '#E8F0FB', borderColor: '#BAE0FF' },
    };
  }
  if (normalized === 'linktoce' || normalized === 'linkce' || normalized === 'compensationevent') {
    return {
      label: 'Link to CE',
      tone: { color: '#531DAB', bgColor: '#F9F0FF', borderColor: '#D3ADF7' },
    };
  }
  if (normalized === 'detected' || normalized === 'awareness') {
    return {
      label: 'Detected',
      tone: { color: '#0958D9', bgColor: '#E6F4FF', borderColor: '#91CAFF' },
    };
  }
  if (normalized === 'notified' || normalized === 'issued' || normalized === 'pmiissued') {
    return {
      label: 'Notified',
      tone: { color: '#0958D9', bgColor: '#E6F4FF', borderColor: '#91CAFF' },
    };
  }
  if (
    normalized === 'quotation' ||
    normalized === 'quotationsubmitted' ||
    normalized === 'submitted'
  ) {
    return {
      label: 'Quotation',
      tone: { color: '#531DAB', bgColor: '#F9F0FF', borderColor: '#D3ADF7' },
    };
  }
  if (normalized === 'assessment' || normalized === 'assessmentcomplete') {
    return {
      label: 'Assessment',
      tone: { color: '#1D39C4', bgColor: '#F0F5FF', borderColor: '#ADC6FF' },
    };
  }
  if (
    normalized === 'implemented' ||
    normalized === 'mitigationagreed' ||
    normalized === 'mitigation'
  ) {
    return {
      label: 'Implemented',
      tone: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
    };
  }
  if (normalized === 'close' || normalized === 'closed') {
    return {
      label: 'Closed',
      tone: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
    };
  }
  if (normalized === 'registered' || normalized === 'earlywarning' || normalized === 'ew') {
    return {
      label: 'EW Registered',
      tone: { color: '#0F4C81', bgColor: '#F0F7FD', borderColor: '#BAE0FF' },
    };
  }

  // Fallback: keep the module prefixes, format camelCase words and separators.
  const label = stage
    .replace(/earlywarning/gi, 'EW ')
    .replace(/early\s*warning/gi, 'EW')
    .replace(/pmi/gi, 'PMI ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return { label, tone: AUDIT_TAG_FALLBACK_TONE };
};

// Tag tone per resolved action, so the pill colour reads the verb at a glance.
const AUDIT_ACTION_TAG_TONES: Partial<Record<SharedAuditAction, AuditTagTone>> = {
  CREATED: { color: '#0F4C81', bgColor: '#F0F7FD', borderColor: '#BAE0FF' },
  DETECTED: { color: '#0958D9', bgColor: '#E6F4FF', borderColor: '#91CAFF' },
  UPDATED: { color: '#0F4C81', bgColor: '#F0F7FD', borderColor: '#BAE0FF' },
  STATUS_CHANGED: { color: '#0958D9', bgColor: '#E6F4FF', borderColor: '#91CAFF' },
  DOCUMENT_UPLOADED: { color: '#531DAB', bgColor: '#F9F0FF', borderColor: '#D3ADF7' },
  EVIDENCE_ADDED: { color: '#531DAB', bgColor: '#F9F0FF', borderColor: '#D3ADF7' },
  COMMENT_ADDED: { color: '#531DAB', bgColor: '#F9F0FF', borderColor: '#D3ADF7' },
  REVIEWED: { color: '#1D39C4', bgColor: '#F0F5FF', borderColor: '#ADC6FF' },
  DECISION_RECORDED: { color: '#1D39C4', bgColor: '#F0F5FF', borderColor: '#ADC6FF' },
  APPROVED: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  ACCEPTED: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  CONFIRMED: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  IMPLEMENTED: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  LIFECYCLE_COMPLETED: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  REJECTED: { color: '#A8071A', bgColor: '#FFF1F0', borderColor: '#FFA39E' },
  NOT_ACCEPTED: { color: '#A8071A', bgColor: '#FFF1F0', borderColor: '#FFA39E' },
  DISCARDED: { color: '#A8071A', bgColor: '#FFF1F0', borderColor: '#FFA39E' },
  REVISION_REQUESTED: { color: '#D46B08', bgColor: '#FFF7E6', borderColor: '#FFD591' },
  MITIGATION_AGREED: { color: '#D46B08', bgColor: '#FFF7E6', borderColor: '#FFD591' },
  MEETING_INVITE_SENT: { color: '#1B3A5F', bgColor: '#E8F0FB', borderColor: '#BAE0FF' },
};

const formatWhen = (iso?: string | null): string => {
  const date = parseBackendDate(iso);
  if (!date) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Presentational — the Audit Trial tab: one timeline row per logged action, rendered
// through the shared `AuditTimelineRow`. Used by the Early Warning and Project Manager's
// Instruction detail screens so both trails read identically.
export const AuditTrailList = ({
  entries,
  emptyDescription = 'No audit activity yet',
}: AuditTrailListProps) => {
  if (entries.length === 0) {
    return <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const items = entries.map((entry, index) => {
    // Resolve the raw `AuditActionType` (enum name or ordinal) once per row — the
    // headline falls back to the action's label instead of a raw "Action 22", and the
    // tag shows the action when the row carries no lifecycle stage.
    const action = resolveSharedAuditAction(entry.actionType, entry.details);
    const label = AUDIT_ACTION_LABELS[action];
    const stageTag = formatStageTag(entry.stage);
    const tag = stageTag ?? {
      label,
      tone: AUDIT_ACTION_TAG_TONES[action] ?? AUDIT_TAG_FALLBACK_TONE,
    };

    return {
      key: entry.id ?? index,
      color: TIMELINE_DOT_COLOR,
      // antd v6: Timeline items take `content` — `children` is deprecated.
      content: (
        <AuditTimelineRow
          headline={entry.details || label}
          timestamp={formatWhen(entry.createdOn)}
          tag={tag}
          sender={entry.sender}
          actorName={entry.performedByUserFullName || entry.performedBy || 'System'}
        />
      ),
    };
  });

  return (
    <div style={{ paddingTop: AUDIT_TIMELINE.paddingTop, paddingLeft: AUDIT_TIMELINE.paddingLeft }}>
      <Timeline items={items} />
    </div>
  );
};
