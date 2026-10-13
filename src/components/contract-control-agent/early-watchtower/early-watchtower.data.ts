import { SEMANTIC_COLORS, BADGE_COLORS, BRAND_COLORS } from '@/constants';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface KPICardData {
  title: string;
  lastLabel: string;
  lastValue: string;
  metricLabel: string;
  metricPrefix: string; // leading text, e.g. "14 emails • "
  metricHighlight: string; // emphasized token, e.g. "1 flagged"
  metricHighlightClass: string; // rooted badge-fg utility for the highlight
  howItWorks: string;
}

export type FeedSourceType =
  | 'Contractor email'
  | 'Daily site report'
  | 'Weather forecast'
  | 'Weekly report';

export type FeedStatus = 'UNREVIEWED' | 'DISMISSED' | 'REGISTERED';

export interface FeedItem {
  id: string;
  time: string;
  sourceType: FeedSourceType;
  sourceSub: string;
  title: string;
  details?: string;
  confidence: number;
  confidenceColor: string; // rooted in SEMANTIC/BADGE/BRAND tokens
  status: FeedStatus;
  statusExtra?: string; // e.g. "-> EW-014"
  muted?: boolean;
}

// Progress-bar track color, rooted in the brand gray scale.
export const CONFIDENCE_TRACK = BRAND_COLORS.gray4;

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

export const KPI_CARDS: KPICardData[] = [
  {
    title: 'Contractor Emails',
    lastLabel: 'LAST SCANNED',
    lastValue: 'Today • 09:14',
    metricLabel: 'EMAILS PROCESSED TODAY',
    metricPrefix: '14 emails • ',
    metricHighlight: '1 flagged',
    metricHighlightClass: 'text-badge-warning',
    howItWorks:
      'Reads your connected Microsoft mailbox. NLP detects Cl.15.1 trigger language in project emails.',
  },
  {
    title: 'Daily Site Reports',
    lastLabel: 'LAST PROCESSED',
    lastValue: 'Yesterday • 18:05',
    metricLabel: 'REPORTS THIS WEEK',
    metricPrefix: '5 DSRs • ',
    metricHighlight: '1 flagged',
    metricHighlightClass: 'text-badge-warning',
    howItWorks:
      'Parses uploaded DSRs. Cross-references against programme baseline. Flags delay patterns on critical-path activities.',
  },
  {
    title: 'Weather Forecast',
    lastLabel: 'LAST API PULL',
    lastValue: 'Today • 06:00',
    metricLabel: 'NEXT PULL',
    metricPrefix: 'Tomorrow • 06:00 • ',
    metricHighlight: '1 alert',
    metricHighlightClass: 'text-badge-info',
    howItWorks:
      'Met Office API pulled daily at 06:00. Matched against weather-sensitive programme activities.',
  },
  {
    title: 'Weekly Reports',
    lastLabel: 'LAST PROCESSED',
    lastValue: 'Mon • 09:00',
    metricLabel: 'WPRS THIS MONTH',
    metricPrefix: '4 WPRs • ',
    metricHighlight: '1 flagged',
    metricHighlightClass: 'text-badge-accent',
    howItWorks:
      'Parses WPR uploads. Tracks programme slippage trend across weeks. Flags when cumulative delay exceeds threshold.',
  },
];

export const FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    time: 'Today 09:14',
    sourceType: 'Contractor email',
    sourceSub: 'J. Whitmore → PM',
    title: 'Piling delay — 3-4 week slippage forecast, Section 1 at risk',
    details: 'Triggers detected: delay to completion · key date · possible cost increase',
    confidence: 88,
    confidenceColor: SEMANTIC_COLORS.error, // high severity
    status: 'UNREVIEWED',
  },
  {
    id: '2',
    time: 'Yesterday 18:05',
    sourceType: 'Daily site report',
    sourceSub: 'DSR-0089 · 26 Jun 2026',
    title: 'S2 slab pour — cumulative delay now 5 days, activity on critical path',
    details: 'Triggers detected: delay to completion · cost increase (overtime)',
    confidence: 74,
    confidenceColor: BADGE_COLORS.warning.fg, // amber — elevated
    status: 'UNREVIEWED',
  },
  {
    id: '3',
    time: 'Today 06:00',
    sourceType: 'Weather forecast',
    sourceSub: 'Met Office · 7-day · auto',
    title: '18–22mm rainfall 27 Jun–3 Jul — piling and concrete works in window',
    details: 'Programme match: A-031 (piling) and A-047 (slab) both exposed, no float',
    confidence: 65,
    confidenceColor: SEMANTIC_COLORS.warning, // yellow — watch
    status: 'UNREVIEWED',
  },
  {
    id: '4',
    time: 'Mon 09:00',
    sourceType: 'Weekly report',
    sourceSub: 'WPR-022 · w/c 23 Jun 2026',
    title: 'Cumulative slippage 8 days — M&E procurement 3 weeks behind, accelerating',
    details: '4-week trend: 2d → 3d → 5d → 8d. No EW covers this risk.',
    confidence: 70,
    confidenceColor: BADGE_COLORS.warning.fg, // amber — elevated
    status: 'UNREVIEWED',
  },
  {
    id: '5',
    time: 'Mon 16 Jun',
    sourceType: 'Weekly report',
    sourceSub: 'WPR-021 · w/c 16 Jun 2026',
    title: 'Routine progress — minor delays within programme float',
    details: 'No Cl. 15.1 triggers found',
    confidence: 20,
    confidenceColor: BRAND_COLORS.gray8, // muted — dismissed
    status: 'DISMISSED',
    muted: true,
  },
  {
    id: '6',
    time: 'Mon 9 Jun',
    sourceType: 'Contractor email',
    sourceSub: 'K. Ahmad → PM',
    title: 'Subcontractor delay — M&E rough-in, Section 2',
    confidence: 82,
    confidenceColor: BRAND_COLORS.gray8, // muted — already registered
    status: 'REGISTERED',
    statusExtra: '→ EW-014',
    muted: true,
  },
];

// Source-type label styling — colors draw from the rooted status-badge
// foreground palette so each source keeps a distinct, on-brand identity.
export const getSourceStyles = (type: string, muted?: boolean) => {
  if (muted) return { labelClass: 'text-icon font-medium' };
  switch (type) {
    case 'Contractor email':
      return { labelClass: 'text-badge-warning font-semibold' };
    case 'Daily site report':
      return { labelClass: 'text-badge-error font-semibold' };
    case 'Weather forecast':
      return { labelClass: 'text-badge-info font-semibold' };
    case 'Weekly report':
      return { labelClass: 'text-badge-accent font-semibold' };
    default:
      return { labelClass: 'text-text font-semibold' };
  }
};
