import { describe, expect, it } from 'vitest';
import {
  cleanEarlyWarningReference,
  findEarlyWarningByReference,
  hasRecordedMeetingForAlert,
} from '@/components/contract-control-agent/risk-reduction-meeting.map';

/**
 * `hasRecordedMeetingForAlert` is what disables the Accept button on the Early Warning Meeting
 * screen once the alert has already been accepted — the only such check that survives a reload.
 * A false negative here re-opens the duplicate-accept bug, so the payload shapes the endpoint is
 * known to return are pinned below.
 */

const ALERT_ID = 'b2a14a61-37b1-41eb-971b-24fb613e511f';
const OTHER_ALERT_ID = '0f9c1d2e-1111-2222-3333-444455556666';

const meeting = (projectAlertId: string) => ({
  id: 'meeting-1',
  projectAlertId,
  meetingDetails: { meetingDate: '2026-08-09T00:00:00Z', summary: 'Zone A obstruction' },
  agreedActions: [],
});

describe('hasRecordedMeetingForAlert', () => {
  it('detects an existing meeting in a bare array response', () => {
    expect(hasRecordedMeetingForAlert([meeting(ALERT_ID)], ALERT_ID)).toBe(true);
  });

  it('detects an existing meeting in a paginated envelope', () => {
    expect(hasRecordedMeetingForAlert({ items: [meeting(ALERT_ID)] }, ALERT_ID)).toBe(true);
  });

  it('detects a PascalCase ProjectAlertId, as the API has been observed sending', () => {
    const pascal = { Id: 'meeting-1', ProjectAlertId: ALERT_ID, AgreedActions: [] };
    expect(hasRecordedMeetingForAlert([pascal], ALERT_ID)).toBe(true);
  });

  it('matches regardless of GUID casing', () => {
    expect(hasRecordedMeetingForAlert([meeting(ALERT_ID.toUpperCase())], ALERT_ID)).toBe(true);
  });

  it('finds the alert among meetings recorded from other alerts on the same EW', () => {
    const meetings = [meeting(OTHER_ALERT_ID), meeting(ALERT_ID)];
    expect(hasRecordedMeetingForAlert(meetings, ALERT_ID)).toBe(true);
  });

  // The negative cases matter just as much: a false positive here would permanently disable
  // Accept on an alert that was never accepted, blocking the flow entirely.
  it('does not match a meeting recorded from a different alert', () => {
    expect(hasRecordedMeetingForAlert([meeting(OTHER_ALERT_ID)], ALERT_ID)).toBe(false);
  });

  it('returns false when the EW has no meetings yet', () => {
    expect(hasRecordedMeetingForAlert([], ALERT_ID)).toBe(false);
  });

  it('returns false while the response is still undefined (request in flight)', () => {
    expect(hasRecordedMeetingForAlert(undefined, ALERT_ID)).toBe(false);
  });

  it('returns false when the alert id is not yet known', () => {
    expect(hasRecordedMeetingForAlert([meeting(ALERT_ID)], undefined)).toBe(false);
  });

  it('does not treat a meeting with no projectAlertId as a match', () => {
    const orphan = { id: 'meeting-1', meetingDetails: {}, agreedActions: [] };
    expect(hasRecordedMeetingForAlert([orphan], ALERT_ID)).toBe(false);
  });
});

/**
 * The extractor writes its own matching note onto the reference it read out of the mail, so the
 * string on the alert and the string in the register are never `===`. Comparing them raw is what
 * made a registered EW read as "not found in the register" and left Accept unable to link one.
 */
const REGISTER = [
  { id: 'ew-1', reference: 'EWN-1239', title: 'Unrecorded Utility Service at Pier 4' },
  { id: 'ew-2', reference: 'EWN-1240', title: 'Late access to Zone B' },
];

describe('findEarlyWarningByReference', () => {
  it('matches a reference carrying the extractor\u2019s "not linked" note', () => {
    const attached = 'EWN-1239 (not linked with any known Early Warning in Auspira)';
    expect(findEarlyWarningByReference(REGISTER, attached)?.id).toBe('ew-1');
  });

  it('matches on the identifying characters only, ignoring case and separators', () => {
    expect(findEarlyWarningByReference(REGISTER, ' ewn 1239 ')?.id).toBe('ew-1');
  });

  it('returns undefined for a reference the project does not have', () => {
    expect(findEarlyWarningByReference(REGISTER, 'EWN-9999 (not linked …)')).toBeUndefined();
  });

  it('returns undefined when the alert carries no reference at all', () => {
    expect(findEarlyWarningByReference(REGISTER, null)).toBeUndefined();
    expect(findEarlyWarningByReference(REGISTER, '(not linked with anything)')).toBeUndefined();
  });

  it('returns undefined while the lookup is still loading', () => {
    expect(findEarlyWarningByReference(undefined, 'EWN-1239')).toBeUndefined();
  });
});

describe('cleanEarlyWarningReference', () => {
  it('drops the extractor note so only the reference is shown and sent', () => {
    const attached = 'EWN-1239 (not linked with any known Early Warning in Auspira)';
    expect(cleanEarlyWarningReference(attached)).toBe('EWN-1239');
  });

  it('leaves a plain reference untouched', () => {
    expect(cleanEarlyWarningReference('EWN-1239')).toBe('EWN-1239');
  });

  it('returns an empty string when there is no reference', () => {
    expect(cleanEarlyWarningReference(null)).toBe('');
  });
});
