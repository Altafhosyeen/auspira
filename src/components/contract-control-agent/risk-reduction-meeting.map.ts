/**
 * Maps GET /api/risk-reduction-meetings/early-warning/{earlyWarningId} onto the meetings table.
 *
 * The response has not been confirmed field-by-field yet, so `pick` accepts either PascalCase or
 * camelCase and every cell falls back to a dash rather than rendering blank rows — the same
 * approach as `EarlyWarningRegisterTable`. Tighten this to one casing and a real interface once a
 * payload is confirmed.
 */

import { formatLocalDate, formatLocalDateTime } from '@/lib/utils';

const EM_DASH = '—';

const pick = (raw: any, ...keys: string[]): any => {
  for (const key of keys) {
    if (raw?.[key] !== undefined && raw?.[key] !== null) return raw[key];
  }
  return undefined;
};

/**
 * "2026-07-04T00:00:00Z" -> "04 Jul 2026", in the viewer's timezone. Unparseable input is shown
 * as-is rather than hidden.
 */
const formatDate = (value?: string): string =>
  value ? formatLocalDate(value) || EM_DASH : EM_DASH;

/** As `formatDate`, but keeps the time: "2026-07-04T14:30:00Z" -> "04 Jul 2026, 15:30" (BST). */
const formatDateTime = (value?: string): string =>
  value ? formatLocalDateTime(value) || EM_DASH : EM_DASH;

/** Participants may arrive as a joined string or as records — both render as "A (PM), B". */
const formatParticipants = (value: unknown): string => {
  if (typeof value === 'string') return value || EM_DASH;
  if (!Array.isArray(value) || value.length === 0) return EM_DASH;

  const names = value
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      const name = pick(entry, 'Name', 'name', 'FullName', 'fullName');
      const role = pick(entry, 'Role', 'role');
      if (!name) return '';
      return role ? `${name} (${role})` : String(name);
    })
    .filter(Boolean);

  return names.length > 0 ? names.join(', ') : EM_DASH;
};

const isCompleted = (action: any) =>
  Boolean(pick(action, 'IsCompleted', 'isCompleted', 'Completed', 'completed'));

// ─── VIEW MODEL ──────────────────────────────────────────────────────────────

export interface RrmRow {
  id: string;
  /** The early warning (project alert) this meeting was recorded against. */
  projectAlertId: string;
  date: string;
  format: string;
  participants: string;
  summary: string;
  /** Empty when the record carries no clause number. */
  clauseNumber: string;
  clauseDescription: string;
  actionsCompleted: number;
  actionsTotal: number;
}

const toRrmRow = (raw: any, index: number): RrmRow => {
  // The confirmed payload nests the meeting fields under `meetingDetails`; fall back to `raw`
  // itself so a flatter shape still works.
  const details = pick(raw, 'MeetingDetails', 'meetingDetails') ?? raw;
  const actions = pick(raw, 'AgreedActions', 'agreedActions');
  const list: any[] = Array.isArray(actions) ? actions : [];

  return {
    // Index fallback only so React keys stay unique if a record arrives without an id.
    id: String(pick(raw, 'Id', 'id') ?? pick(details, 'Id', 'id') ?? index),
    projectAlertId: String(
      pick(raw, 'ProjectAlertId', 'projectAlertId') ??
        pick(details, 'ProjectAlertId', 'projectAlertId') ??
        ''
    ),
    date: formatDate(
      pick(details, 'MeetingDate', 'meetingDate', 'DateHeld', 'dateHeld', 'Date', 'date')
    ),
    format: String(pick(details, 'Format', 'format', 'Location', 'location') ?? EM_DASH),
    participants: formatParticipants(
      pick(details, 'Participants', 'participants', 'Attendees', 'attendees')
    ),
    summary: String(pick(details, 'Summary', 'summary', 'Notes', 'notes') ?? EM_DASH),
    clauseNumber: String(pick(details, 'ClauseNumber', 'clauseNumber') ?? '').trim(),
    clauseDescription:
      String(pick(details, 'ClauseDescription', 'clauseDescription') ?? '').trim() || EM_DASH,
    actionsCompleted: list.filter(isCompleted).length,
    actionsTotal: list.length,
  };
};

/** The endpoint may return a bare array or a paginated envelope — accept either. */
export const toRrmRows = (data: unknown): RrmRow[] => {
  const items = Array.isArray(data) ? data : (pick(data, 'items', 'Items') ?? []);
  return Array.isArray(items) ? items.map(toRrmRow) : [];
};

/**
 * True when a meeting has already been recorded against this project alert — i.e. the alert has
 * already been accepted. `data` is the meetings-by-early-warning response.
 *
 * This is the one "already accepted" signal that survives a page reload, so it is what stops the
 * Accept button being used twice. Compared case-insensitively because GUID casing is not
 * guaranteed to be consistent across endpoints.
 */
export const hasRecordedMeetingForAlert = (data: unknown, projectAlertId?: string): boolean => {
  if (!projectAlertId) return false;
  const alertId = projectAlertId.toLowerCase();
  return toRrmRows(data).some((row) => row.projectAlertId.toLowerCase() === alertId);
};

/**
 * Maps `GET /api/risk-reduction-meetings/{riskReductionMeetingId}` onto the read-only meeting
 * detail modal opened from a `RiskReductionMeetingTable` row. Confirmed payload shape nests the
 * meeting fields under `meetingDetails` (alongside an unrelated `projectEmailInformation` block
 * and a top-level `agreedActions`) — `pick` still tolerates either casing, and falls back to `raw`
 * itself in case a flatter shape is returned instead.
 */
export const toRrmDetailFromApi = (raw: any): RrmDetail => {
  const details = pick(raw, 'MeetingDetails', 'meetingDetails') ?? raw;
  const meetingDate = String(
    pick(details, 'MeetingDate', 'meetingDate', 'DateHeld', 'dateHeld', 'Date', 'date') ?? ''
  ).trim();
  const participantsRaw = pick(details, 'Participants', 'participants', 'Attendees', 'attendees');
  const participantsText = formatParticipants(participantsRaw);
  const actions = pick(raw, 'AgreedActions', 'agreedActions');
  const actionList: any[] = Array.isArray(actions) ? actions : [];

  return {
    meetingDate: formatDateTime(meetingDate),
    meetingDateShort: formatDate(meetingDate),
    meetingDateRaw: meetingDate,
    format:
      String(pick(details, 'Format', 'format', 'Location', 'location') ?? '').trim() || EM_DASH,
    participantsText,
    participantCount:
      participantsText !== EM_DASH ? participantsText.split(',').filter((p) => p.trim()).length : 0,
    clauseNumber: String(pick(details, 'ClauseNumber', 'clauseNumber') ?? '').trim(),
    clauseTitle: String(pick(details, 'ClauseTitle', 'clauseTitle') ?? '').trim(),
    clauseDescription:
      String(pick(details, 'ClauseDescription', 'clauseDescription') ?? '').trim() || EM_DASH,
    summary: String(pick(details, 'Summary', 'summary', 'Notes', 'notes') ?? ''),
    agreedActions: actionList.map((action, index) => ({
      id: String(pick(action, 'Id', 'id') ?? index),
      label: String(pick(action, 'Action', 'action', 'Description', 'description') ?? ''),
      assignee:
        String(pick(action, 'Owner', 'owner', 'ResponsibleParty', 'responsibleParty') ?? '') ||
        EM_DASH,
      dueDate: formatDate(pick(action, 'DueDate', 'dueDate')),
      dueDateRaw: String(pick(action, 'DueDate', 'dueDate') ?? ''),
      checked: isCompleted(action),
    })),
  };
};

/**
 * Maps `ProjectAlert.riskReductionMeeting` — a JSON-encoded string, not a joined endpoint — onto
 * the single-meeting detail screen (`RiskReductionMeeting.tsx`). Unlike `toRrmRows` above, this
 * has one confirmed shape: `{ meetingDate, location, participants, clauseDescription, summary,
 * agreedActions: [{ action, owner, isCompleted, dueDate }] }`, so it parses directly rather than
 * guessing at casing.
 */

export interface RrmDetailAction {
  id: string;
  label: string;
  assignee: string;
  /** Display string — "21 Aug 2026". Date-only: a deadline carries no time. Never send this back. */
  dueDate: string;
  /** The untouched backend timestamp, for round-tripping the value on submit. */
  dueDateRaw: string;
  checked: boolean;
}

export interface RrmDetail {
  /** Display string in the viewer's timezone, with the time — "21 Aug 2026, 01:00". */
  meetingDate: string;
  /** Just the date portion, for the compact stat card. */
  meetingDateShort: string;
  /** The untouched backend timestamp, for round-tripping the value on submit. */
  meetingDateRaw: string;
  format: string;
  participantsText: string;
  participantCount: number;
  /** Empty when the record carries no clause number — e.g. the JSON-blob source in
   *  `parseRiskReductionMeeting`, which only ever has a description. */
  clauseNumber: string;
  /** Empty for the same reason as `clauseNumber`. */
  clauseTitle: string;
  clauseDescription: string;
  summary: string;
  agreedActions: RrmDetailAction[];
}

/** Returns `null` when the alert has no meeting recorded yet, or the field fails to parse. */
export const parseRiskReductionMeeting = (raw: string | null | undefined): RrmDetail | null => {
  if (!raw) return null;

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  // The backend has been observed sending this field's JSON in both PascalCase and camelCase —
  // `pick` tolerates either, same as `toRrmRow`/`toRrmDetailFromApi` above.
  const meetingDateRaw = String(pick(parsed, 'meetingDate', 'MeetingDate') ?? '').trim();
  // `meetingDate` may arrive as an ISO timestamp ("2026-07-29T19:00:00Z") or an already
  // human-formatted string ("30 July 2026") — the formatters normalise the former into the
  // viewer's timezone and pass the latter through unchanged.
  const meetingDate = formatDateTime(meetingDateRaw);
  const participants = String(pick(parsed, 'participants', 'Participants') ?? '').trim();
  const rawActions = pick(parsed, 'agreedActions', 'AgreedActions');
  const actions: any[] = Array.isArray(rawActions) ? rawActions : [];

  return {
    meetingDate,
    meetingDateShort: formatDate(meetingDateRaw),
    meetingDateRaw,
    format: String(pick(parsed, 'location', 'Location') ?? '').trim() || EM_DASH,
    participantsText: participants || EM_DASH,
    participantCount: participants ? participants.split(',').filter((p) => p.trim()).length : 0,
    // This blob only ever carries a description — the number/title live on the alert's
    // separate compensation-event read (see `parseAlertCompensationEvent`).
    clauseNumber: '',
    clauseTitle: '',
    clauseDescription:
      String(pick(parsed, 'clauseDescription', 'ClauseDescription') ?? '').trim() || EM_DASH,
    summary: String(pick(parsed, 'summary', 'Summary') ?? ''),
    agreedActions: actions.map((action, index) => ({
      id: String(index),
      label: String(pick(action, 'action', 'Action', 'description', 'Description') ?? ''),
      assignee:
        String(pick(action, 'owner', 'Owner', 'responsibleParty', 'ResponsibleParty') ?? '') ||
        EM_DASH,
      dueDate: formatDate(String(pick(action, 'dueDate', 'DueDate') ?? '')),
      dueDateRaw: String(pick(action, 'dueDate', 'DueDate') ?? ''),
      checked: isCompleted(action),
    })),
  };
};

/* ─── Early Warning references ─────────────────────────────────────────────── */

/**
 * The extractor writes the reference it read out of the mail together with a note about its own
 * matching — "EWN-1239 (not linked with any known Early Warning in Auspira)". The note is the AI
 * talking about itself, not part of the reference, so references are compared on the characters
 * that identify them only (mirrors `matchCompensationEventReference` on the CE side). Without this
 * a perfectly registered EW reads as "not found in the register" and never links up.
 */
export const toEarlyWarningReferenceKey = (value?: string | null): string =>
  (value ?? '')
    .split('(')[0]
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .replace(/^EWN/i, 'EW');

/** "EWN-1239 (not linked with …)" -> "EWN-1239" — what to show, never the note. */
export const cleanEarlyWarningReference = (value?: string | null): string =>
  (value ?? '').split('(')[0].trim();

/**
 * The registered Early Warning a reference names, or `undefined` when the project has no such EW —
 * the case the screen asks the user to resolve with the reference picker. Always resolve through
 * this rather than comparing strings: what the register holds ("EWN-1239") and what the alert
 * carries ("EWN-1239 (not linked …)") are the same reference written two ways.
 */
export const findEarlyWarningByReference = <T extends { reference: string }>(
  items: T[] | undefined,
  reference?: string | null
): T | undefined => {
  const key = toEarlyWarningReferenceKey(reference);
  if (!key) return undefined;
  return (items ?? []).find((item) => toEarlyWarningReferenceKey(item.reference) === key);
};
