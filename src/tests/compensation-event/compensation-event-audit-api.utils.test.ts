import { describe, expect, it } from 'vitest';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  resolveAuditAction,
  toAuditEntry,
} from '@/modules/compensation-event/utils/compensation-event-api.utils';

describe('resolveAuditAction', () => {
  it('passes known action names through', () => {
    expect(resolveAuditAction('LOCKED')).toBe('LOCKED');
  });

  it('maps backend wording onto the tab vocabulary', () => {
    expect(resolveAuditAction('Locked')).toBe('LOCKED');
    expect(resolveAuditAction('StatusChanged')).toBe('STATUS_CHANGED');
    expect(resolveAuditAction('Implemented')).toBe('IMPLEMENTED');
    expect(resolveAuditAction('FileUploaded')).toBe('DOCUMENT_UPLOADED');
    expect(resolveAuditAction('EvidenceAttached')).toBe('EVIDENCE_ADDED');
  });

  // 'UNLOCK' contains 'LOCK', so the two must not collapse onto one action.
  it('separates unlocked from locked', () => {
    expect(resolveAuditAction('Unlocked')).toBe('UNLOCKED');
    expect(resolveAuditAction(9)).toBe('UNLOCKED');
  });

  it('falls back to created for unknown actions', () => {
    expect(resolveAuditAction(null)).toBe('CREATED');
    expect(resolveAuditAction('SomethingUnmapped')).toBe('CREATED');
  });

  // The PMI trail logs accept/confirm/revision outcomes as ordinals 20-23.
  it('maps the tail of the AuditActionType enum', () => {
    expect(resolveAuditAction(20)).toBe('ACCEPTED');
    expect(resolveAuditAction(21)).toBe('CONFIRMED');
    expect(resolveAuditAction(22)).toBe('NOT_ACCEPTED');
    expect(resolveAuditAction(23)).toBe('DISCARDED');
  });

  // 'NOT ACCEPTED' contains 'ACCEPT', so the specific form must win.
  it('separates not-accepted from accepted', () => {
    expect(resolveAuditAction('NotAccepted')).toBe('NOT_ACCEPTED');
    expect(resolveAuditAction('Not accepted')).toBe('NOT_ACCEPTED');
  });

  it('matches confirm and accept off the details wording', () => {
    expect(resolveAuditAction(99, 'Quotation confirmed by PM')).toBe('CONFIRMED');
    expect(resolveAuditAction(99, 'Quotation accepted')).toBe('ACCEPTED');
    expect(resolveAuditAction(99, 'Instruction discarded')).toBe('DISCARDED');
  });

  // The map is total over AuditActionType, so every ordinal 1-19 resolves without
  // needing the details wording at all.
  it('maps every AuditActionType ordinal off the ordinal alone', () => {
    expect(resolveAuditAction(1)).toBe('CREATED');
    expect(resolveAuditAction(2)).toBe('DETECTED');
    expect(resolveAuditAction(3)).toBe('LIFECYCLE_COMPLETED');
    expect(resolveAuditAction(4)).toBe('MITIGATION_AGREED');
    expect(resolveAuditAction(5)).toBe('RISK_REDUCTION_MEETING_INVITE_SENT');
    expect(resolveAuditAction(6)).toBe('UPDATED');
    expect(resolveAuditAction(7)).toBe('STATUS_CHANGED');
    expect(resolveAuditAction(8)).toBe('LOCKED');
    expect(resolveAuditAction(10)).toBe('DOCUMENT_UPLOADED');
    expect(resolveAuditAction(11)).toBe('EVIDENCE_ADDED');
    expect(resolveAuditAction(12)).toBe('DECISION_RECORDED');
    expect(resolveAuditAction(13)).toBe('REVIEWED');
    expect(resolveAuditAction(14)).toBe('APPROVED');
    expect(resolveAuditAction(15)).toBe('REVISION_REQUESTED');
    expect(resolveAuditAction(16)).toBe('REJECTED');
    expect(resolveAuditAction(17)).toBe('IMPLEMENTED');
    expect(resolveAuditAction(18)).toBe('CLOSED');
    expect(resolveAuditAction(19)).toBe('COMMENT_ADDED');
  });

  // The ordinal now wins over the wording — a row logged as ordinal 3 is a lifecycle
  // completion even when its details happen to mention locking.
  it('prefers the ordinal over the logged details', () => {
    expect(resolveAuditAction(3, 'Compensation event locked')).toBe('LIFECYCLE_COMPLETED');
    expect(resolveAuditAction(1, 'Compensation event raised from Email')).toBe('CREATED');
  });

  it('reads an out-of-range ordinal off the logged details instead', () => {
    expect(resolveAuditAction(99, 'Uploaded: Crane Breakdown Report.pdf')).toBe(
      'DOCUMENT_UPLOADED'
    );
    expect(resolveAuditAction(0, 'Compensation event locked')).toBe('LOCKED');
  });

  it('does not crash on an ordinal with no details to fall back on', () => {
    expect(resolveAuditAction(0)).toBe('CREATED');
    expect(resolveAuditAction(99)).toBe('CREATED');
  });
});

describe('toAuditEntry', () => {
  // The live backend sends `actionType` as the enum's raw ordinal, with no published
  // name mapping (see `resolveAuditAction`) — a numeric fixture matches that reality.
  const log = {
    id: 'log-1',
    actionType: 3,
    stage: 'Project Manager',
    performedBy: 'user-9',
    performedByUserFullName: 'David Moore',
    createdOn: '2024-07-16T16:30:00.000Z',
    details: 'Compensation event locked',
    sender: null,
  };

  it('prefers the full name over the raw identifier', () => {
    expect(toAuditEntry(log).actorName).toBe('David Moore');
  });

  it('falls back to the identifier when no name is recorded', () => {
    expect(toAuditEntry({ ...log, performedByUserFullName: null }).actorName).toBe('user-9');
  });

  it('prefers sender over the full name when sender is set', () => {
    expect(toAuditEntry({ ...log, sender: 'jane@example.com' }).actorName).toBe('jane@example.com');
  });

  it('marks system actors so the row shows the action glyph', () => {
    const entry = toAuditEntry({ ...log, performedByUserFullName: 'System' });
    expect(entry.actorParty).toBe('SYSTEM');
  });

  it('treats a named actor as a person', () => {
    expect(toAuditEntry(log).actorParty).toBe('COMMERCIAL');
  });

  it('maps the action, stage and details', () => {
    const entry = toAuditEntry(log);
    // Ordinal 3 maps straight onto the backend enum's LifecycleCompleted.
    expect(entry.action).toBe('LIFECYCLE_COMPLETED');
    expect(entry.actorRole).toBe('Project Manager');
    expect(entry.details).toBe('Compensation event locked');
    expect(entry.occurredAt).toBe('2024-07-16T16:30:00.000Z');
  });

  it('nulls a blank stage and empties blank details', () => {
    const entry = toAuditEntry({ ...log, stage: '  ', details: null });
    expect(entry.actorRole).toBeNull();
    expect(entry.details).toBe('');
  });
});
