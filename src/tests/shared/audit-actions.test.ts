import { describe, expect, it } from 'vitest';
import {
  AUDIT_ACTION_BY_ORDINAL,
  AUDIT_ACTION_LABELS,
  resolveSharedAuditAction,
  type SharedAuditAction,
} from '@/components/shared/audit-trail/audit-actions';
import { AuditActionType } from '@/constants/enum.constant';

// Every `AuditActionType` member the backend can log, as the wire sends it — a bare integer.
const ORDINALS = Object.values(AuditActionType).filter(
  (value): value is number => typeof value === 'number'
);

// The map is typed over the enum members, not over `number`, so it is read through the same
// partial numeric view the resolver itself uses — the wire sends a bare integer that may sit
// outside the enum, which is the whole reason that view exists.
const BY_ORDINAL: Partial<Record<number, SharedAuditAction>> = AUDIT_ACTION_BY_ORDINAL;

describe('AUDIT_ACTION_BY_ORDINAL', () => {
  // A member missing from the map would leave its rows resolving through the free-text
  // fallback, which guesses from the row's own wording rather than naming the action.
  it('covers every AuditActionType member', () => {
    const unmapped = ORDINALS.filter((ordinal) => BY_ORDINAL[ordinal] === undefined);

    expect(unmapped).toEqual([]);
  });

  // A mapped action with no label would render a blank tag and an empty headline fallback.
  it('gives every mapped action a label', () => {
    for (const action of Object.values(AUDIT_ACTION_BY_ORDINAL)) {
      expect(AUDIT_ACTION_LABELS[action]).toBeTruthy();
    }
  });
});

describe('resolveSharedAuditAction', () => {
  // The three actions the alert-accept flows log. `Confirm` in particular must not be
  // swallowed by the looser 'ACCEPT' / 'CREATED' substring traps.
  it('names the accept-flow actions off their ordinal alone', () => {
    expect(resolveSharedAuditAction(AuditActionType.Confirm)).toBe('CONFIRMED');
    expect(resolveSharedAuditAction(AuditActionType.NotAccepted)).toBe('NOT_ACCEPTED');
    expect(resolveSharedAuditAction(AuditActionType.Discarded)).toBe('DISCARDED');
    expect(resolveSharedAuditAction(AuditActionType.Accepted)).toBe('ACCEPTED');
  });

  it('resolves every member off its ordinal, without falling back to wording', () => {
    for (const ordinal of ORDINALS) {
      expect(resolveSharedAuditAction(ordinal)).toBe(BY_ORDINAL[ordinal]);
    }
  });

  // The ordinal on the wire is a bare integer that may sit outside this enum — then the
  // row's own wording is the only signal left, and 'CREATED' is the last resort.
  it('falls back to the row wording for an ordinal the enum does not cover', () => {
    expect(resolveSharedAuditAction(999, 'Document uploaded')).toBe('DOCUMENT_UPLOADED');
    expect(resolveSharedAuditAction(999, 'nothing recognisable')).toBe('CREATED');
  });

  it('reads an enum name when no ordinal is sent', () => {
    expect(resolveSharedAuditAction('NotAccepted')).toBe('NOT_ACCEPTED');
    // A non-numeric string must not be coerced into ordinal 0.
    expect(resolveSharedAuditAction('EVENT_LOCKED')).toBe('LOCKED');
  });
});
