// ─── SHARED STYLES ───────────────────────────────────────────────────────────

/** Card shell used by every panel on the RRM screen, including the meetings table. */
export const RRM_CARD = 'space-y-4 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm';

/** White pill chip used for date / location / participants in the detail-modal header banner. */
export const RRM_HEADER_CHIP =
  'inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-xs';

// ─── STATIC COPY ─────────────────────────────────────────────────────────────

export const RRM_COPY = {
  /** Shown when neither the parsed meeting record nor the alert carries a clause description. */
  clauseBadgeFallback: '',
  meetingDetailsTitle: 'Meeting Details',
  meetingsTableTitle: 'Meetings Held',
  meetingsTableEmpty: 'No Early Warning Meeting has been recorded for this early warning yet.',
  agreedActionsTitle: 'Agreed Actions',
  agreedActionsProgressSuffix: 'COMPLETE',
  outcomeSoFarTitle: 'Outcome so far',
  labels: {
    meetingDate: 'MEETING DATE',
    format: 'Location',
    participants: 'PARTICIPANTS',
    summary: 'SUMMARY',
  },
  stats: {
    clause: { label: 'Clause', note: 'Early Warning Meeting' },
    meetingHeld: { label: 'Meeting held' },
    participants: { label: 'Participants' },
    actions: { label: 'Actions', note: 'Completed' },
  },
  summaryEmptyState:
    'No summary has been written yet — this section will appear blank in the saved record.',
} as const;
