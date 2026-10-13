'use client';

import { AuditTimelineRow } from '@/components/shared/audit-trail';
import { COMPENSATION_EVENT_AUDIT_LABELS } from '../constants/compensation-event-audit.constants';
import { AUDIT_ACTION_TAG_TONES } from '../constants/compensation-event-audit.theme';
import type { CompensationEventAuditEntry } from '../types/compensation-event.types';
import { formatThreadTimestamp } from '../utils/compensation-event.utils';

interface CompensationEventAuditEntryRowProps {
  entry: CompensationEventAuditEntry;
}

// Maps a logged CE activity onto the shared audit timeline row. `isSender` marks the
// entry as email-sourced, so `actorName` is the sending address rather than a user.
const CompensationEventAuditEntryRow = ({ entry }: CompensationEventAuditEntryRowProps) => {
  const label = COMPENSATION_EVENT_AUDIT_LABELS[entry.action];

  return (
    <AuditTimelineRow
      headline={entry.details || label}
      timestamp={formatThreadTimestamp(entry.occurredAt)}
      tag={{ label, tone: AUDIT_ACTION_TAG_TONES[entry.action] }}
      sender={entry.isSender ? entry.actorName : null}
      actorName={entry.isSender ? null : entry.actorName}
      actorMeta={entry.actorRole}
    />
  );
};

export default CompensationEventAuditEntryRow;
