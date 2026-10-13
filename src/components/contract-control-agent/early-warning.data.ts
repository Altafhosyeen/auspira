// ─── TYPES ───────────────────────────────────────────────────────────────────

/** Register status of an Early Warning (NEC4 Cl. 15). */
export type EwStatus = 'OPEN' | 'IN_RRM' | 'MITIGATING' | 'CONVERTED' | 'CLOSED';

/** Impact flags surfaced against an EW. */
export type EwImpact = 'DELAY' | 'KEY_DATE' | 'COST' | 'PERFORMANCE';

export interface EarlyWarning {
  id: string;
  /** e.g. "EW-015" */
  ref: string;
  /** Flags the most recently registered, unread EW. */
  isNew?: boolean;
  /** Short risk description. */
  risk: string;
  /** Provenance line, e.g. "From email · J. Whitmore" or "Manual raise · S. Collins (PM)". */
  source?: string;
  /** Date the EW was raised, e.g. "27 Jun 26". */
  raised: string;
  /** Raw ISO value behind `raised`, kept so exports can write a real date cell rather than text. */
  raisedAt?: string | null;
  /** Party that raised it, e.g. "Contractor" or "PM". */
  by: string;
  impacts: EwImpact[];
  /** Free-text impact description — shown in the Impact column when no flag chip applies. */
  potentialImpacts?: string;
  status: EwStatus;
  /**
   * Status pill label. For a converted EW this is the CE reference,
   * e.g. "→ CE-003"; otherwise derived from `status`.
   */
  statusLabel: string;
  /** Response / risk-reduction meeting due date, e.g. "4 Jul 26". Null = no date. */
  due: string | null;
  /** Render the due date as overdue (red). */
  dueOverdue?: boolean;
  /** Greys the whole row — the EW is fully closed out. */
  closed?: boolean;
  /** Close-out detail. Only populated once the EW has been closed; surfaced in the Archived export. */
  closedAt?: string | null;
  closingReason?: string | null;
  closedBy?: string | null;
  /** Long-form detail shown on the lifecycle screen. */
  description?: string;
}

// ─── LABELS & STYLE MAPS ─────────────────────────────────────────────────────

export const STATUS_LABEL: Record<EwStatus, string> = {
  OPEN: 'OPEN',
  IN_RRM: 'IN RRM',
  MITIGATING: 'MITIGATING',
  CONVERTED: 'CONVERTED',
  CLOSED: 'CLOSED',
};

/** Outlined status pills (except CLOSED, which is filled). */
export const STATUS_STYLE: Record<EwStatus, React.CSSProperties> = {
  OPEN: { color: '#b45309', borderColor: '#fcd34d', backgroundColor: '#fffdf5' },
  IN_RRM: { color: '#c2410c', borderColor: '#fdba74', backgroundColor: '#fff8f3' },
  MITIGATING: { color: '#1d4ed8', borderColor: '#93c5fd', backgroundColor: '#f5f9ff' },
  CONVERTED: { color: '#7c3aed', borderColor: '#c4b5fd', backgroundColor: '#faf7ff' },
  CLOSED: { color: '#15803d', borderColor: 'transparent', backgroundColor: '#dcfce7' },
};

export const IMPACT_LABEL: Record<EwImpact, string> = {
  DELAY: 'Delay',
  KEY_DATE: 'Key date',
  COST: 'Cost',
  PERFORMANCE: 'Performance',
};

/** Impact chip colours. `muted` is applied when the parent EW is closed. */
export const IMPACT_STYLE: Record<
  EwImpact,
  { active: React.CSSProperties; muted: React.CSSProperties }
> = {
  DELAY: {
    active: { color: '#dc2626', backgroundColor: '#fef2f2' },
    muted: { color: '#94a3b8', backgroundColor: '#f1f5f9' },
  },
  KEY_DATE: {
    active: { color: '#4f46e5', backgroundColor: '#eef2ff' },
    muted: { color: '#94a3b8', backgroundColor: '#f1f5f9' },
  },
  COST: {
    active: { color: '#b45309', backgroundColor: '#fffbeb' },
    muted: { color: '#94a3b8', backgroundColor: '#f1f5f9' },
  },
  PERFORMANCE: {
    active: { color: '#7c3aed', backgroundColor: '#f5f3ff' },
    muted: { color: '#94a3b8', backgroundColor: '#f1f5f9' },
  },
};

// ─── FILTER OPTIONS ──────────────────────────────────────────────────────────

export const STATUS_FILTER_OPTIONS: { label: string; value: EwStatus | 'ALL' }[] = [
  { label: 'All statuses', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In RRM', value: 'IN_RRM' },
  { label: 'Mitigating', value: 'MITIGATING' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Closed', value: 'CLOSED' },
];

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

export const EARLY_WARNINGS: EarlyWarning[] = [
  {
    id: '1',
    ref: 'EW-015',
    isNew: true,
    risk: 'Piling delay — ground conditions N-E quadrant',
    source: 'From email · J. Whitmore',
    raised: '27 Jun 26',
    by: 'Contractor',
    impacts: ['DELAY', 'KEY_DATE'],
    status: 'OPEN',
    statusLabel: 'OPEN',
    due: '4 Jul 26',
    dueOverdue: true,
    description:
      'Unexpected ground conditions in the north-east quadrant have slowed piling progress. A response is required confirming the proposed mitigation and any impact on the programme and key dates.',
  },
  {
    id: '2',
    ref: 'EW-014',
    risk: 'Scaffold supply constraint — Levels 3–5',
    source: 'Manual raise · S. Collins (PM)',
    raised: '19 Jun 26',
    by: 'PM',
    impacts: ['DELAY'],
    status: 'IN_RRM',
    statusLabel: 'IN RRM',
    due: '29 Jun 26',
    dueOverdue: true,
    description:
      'A scaffold supply constraint affecting Levels 3–5 has been raised and is currently being worked through in a risk-reduction meeting.',
  },
  {
    id: '3',
    ref: 'EW-013',
    risk: 'Planning condition discharge — Section 1',
    raised: '11 Jun 26',
    by: 'Contractor',
    impacts: ['KEY_DATE', 'COST'],
    status: 'MITIGATING',
    statusLabel: 'MITIGATING',
    due: '10 Jul 26',
    description:
      'Outstanding planning conditions for Section 1 must be discharged before works can proceed. Mitigation measures are being progressed to protect the key date.',
  },
  {
    id: '4',
    ref: 'EW-009',
    risk: 'Weather delay — exposed works',
    source: 'Linked to CE-003',
    raised: '12 May 26',
    by: 'Contractor',
    impacts: ['DELAY'],
    status: 'CONVERTED',
    statusLabel: '→ CE-003',
    due: null,
    description:
      'Adverse weather affecting exposed works has been assessed and converted into compensation event CE-003.',
  },
  {
    id: '5',
    ref: 'EW-008',
    risk: 'Groundwater ingress — basement',
    raised: '28 Apr 26',
    by: 'Contractor',
    impacts: ['COST'],
    status: 'CLOSED',
    statusLabel: 'CLOSED',
    due: null,
    closed: true,
    description:
      'Groundwater ingress in the basement was managed with additional pumping and sealing. The early warning has been closed out with cost captured separately.',
  },
];

export const getEarlyWarning = (id: string): EarlyWarning | undefined =>
  EARLY_WARNINGS.find((ew) => ew.id === id);
