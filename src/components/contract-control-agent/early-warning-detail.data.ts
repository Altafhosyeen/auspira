// ─── TYPES ───────────────────────────────────────────────────────────────────

export type TabType = 'Overview' | 'Email Threads' | 'Early Warning Meeting' | 'Audit Trail';

/**
 * Icon key resolved to a component in the view layer (keeps this file JSX-free).
 * One per impact boolean on the API record.
 */
export type ImpactIcon = 'delay' | 'key-date' | 'cost' | 'performance';

export interface ImpactChip {
  label: string;
  icon: ImpactIcon;
  /** Tailwind classes for the chip wrapper (colour set per impact). */
  wrapperClass: string;
}

export interface SummaryRow {
  label: string;
  /** Plain-text value. Omit when the row renders `impacts` instead. */
  value?: string;
  /** `description` renders muted/relaxed; `value` renders bold. Default `value`. */
  variant?: 'description' | 'value';
  /** Present → render impact chips instead of a text value. */
  impacts?: ImpactChip[];
}

export interface LifecycleStep {
  title: string;
  status: 'completed' | 'active' | 'upcoming';
  subtext: string;
  subtextHighlight?: boolean;
  /** Who performed the stage, from the audit trail. Absent for stages nobody has acted on yet. */
  actor?: string;
}

export type DecisionVariant = 'primary' | 'outline' | 'warning';

export interface DecisionButton {
  label: string;
  variant: DecisionVariant;
}

// ─── TABS ────────────────────────────────────────────────────────────────────

export const DETAIL_TABS: TabType[] = [
  'Overview',
  'Email Threads',
  'Early Warning Meeting',
  'Audit Trail',
];

// ─── CE GATE ─────────────────────────────────────────────────────────────────

export const CE_GATE_COPY = {
  title: 'CE Gate',
  body: 'An EW is not automatically a CE. A separate CE is created only if a PM instruction or other CE trigger arises from this risk.',
  action: 'Create linked CE',
} as const;

// ─── AFTER-MEETING DECISIONS ─────────────────────────────────────────────────

export const AFTER_MEETING_COPY = {
  title: '',
  subtitle: '',
} as const;

export const AFTER_MEETING_ACTIONS: DecisionButton[] = [
  { label: 'Risk resolved close EW', variant: 'primary' },
  { label: 'CE trigger identified link  CE', variant: 'warning' },
];

// ─── EVIDENCE & THREAD TAB ───────────────────────────────────────────────────

export interface ThreadMessage {
  id: string;
  from: string;
  to: string;
  /** Avatar initials, e.g. "JW". */
  initials: string;
  /** Avatar tint — resolved to a rooted surface colour in the view layer. */
  avatarTone: 'dark' | 'blue';
  time: string;
  body: string;
  /** Optional corner tag, e.g. "EW TRIGGER". */
  tag?: string;
}

export interface Attachment {
  id: string;
  label: string;
}

export type EvidenceState = 'done' | 'pending';

export interface EvidencePackItem {
  id: string;
  label: string;
  state: EvidenceState;
}

export const EVIDENCE_THREAD_COPY = {
  threadHeading: 'Email thread',
  attachmentsTitle: 'Attachments',
  addDocument: '+ Add document',
  evidencePackTitle: 'Evidence Pack Status',
} as const;

export const ATTACHMENTS: Attachment[] = [{ id: '1', label: 'DW-PRG-0041 Rev B.pdf' }];

export const EVIDENCE_PACK: EvidencePackItem[] = [
  { id: '1', label: 'Email thread (3 msgs)', state: 'done' },
  { id: '2', label: 'Attachment (1 file)', state: 'done' },
  { id: '3', label: 'RRM minutes', state: 'pending' },
  { id: '4', label: 'Mitigation actions', state: 'pending' },
];

// ─── AUDIT TRAIL TAB ─────────────────────────────────────────────────────────
// Entries are fetched live via `useGetEarlyWarningAuditTrail` (see EarlyWarningAuditTrailTab) —
// only the static tab title lives here now.

export const AUDIT_TRAIL_TITLE = 'Audit Trail';
