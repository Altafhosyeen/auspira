import type React from 'react';
import {
  ClockCircleOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  MailOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { SEMANTIC_COLORS, BRAND_COLORS } from '@/constants';

// ─── PROGRESS-BAR COLORS (rooted, for Ant props that take JS values) ─────────
export const CONFIDENCE_STROKE = SEMANTIC_COLORS.error; // high-severity red
export const CONFIDENCE_TRACK = BRAND_COLORS.gray4; // neutral track

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface MissingFieldItem {
  id: string;
  title: string;
  dotClass: string; // rooted severity dot color (bg-error / bg-badge-warning / bg-warning)
  description: string;
}

export interface TriggerTag {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  chipClass: string; // rooted badge bg+fg+border utilities
}

export interface AssessmentPhrase {
  id: string;
  phrase: string;
  meaning: string;
}

export interface ThreadItem {
  id: string;
  label: string;
  active?: boolean;
}

export type DecisionTone = 'primary' | 'success' | 'neutral';

export interface DecisionCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: DecisionTone;
  /** Relative segment appended to the current watchtower item route, if this card navigates. */
  route?: string;
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

export const EMAIL_META = {
  fromName: 'James Whitmore',
  fromAddress: 'j.whitmore@buildco.co.uk',
  toName: 'Sarah Collins (PM)',
  toAddress: 's.collins@pm.co.uk',
  subject: 'Re: Programme Update — Piling works delay risk',
  attachment: 'DW-PRG-0041 Rev B.pdf',
  receivedAt: 'Today • 09:14',
};

export const CONFIDENCE = {
  score: 88,
  label: 'High — very likely an Early Warning',
};

export const missingFields: MissingFieldItem[] = [
  {
    id: '1',
    title: 'Formal risk title',
    dotClass: 'bg-error',
    description:
      "Required for EW Register. Auspira suggests: 'Piling delay — ground conditions N-E quadrant, Section 1'",
  },
  {
    id: '2',
    title: 'Quantified cost impact',
    dotClass: 'bg-badge-warning',
    description: "Email states impact is 'expected to be material' — no figure or estimate",
  },
  {
    id: '3',
    title: 'Proposed mitigation actions',
    dotClass: 'bg-warning',
    description: 'No options proposed by contractor prior to Early Warning Meeting',
  },
];

export const assessmentPhrases: AssessmentPhrase[] = [
  {
    id: '1',
    phrase: '"3-4 week slippage on piling"',
    meaning: 'delay to completion and key date',
  },
  {
    id: '2',
    phrase: '"affect the Section 1 completion date of 14 August"',
    meaning: 'key date impact',
  },
  {
    id: '3',
    phrase: '"expect this to be material"',
    meaning: 'possible increase to total prices',
  },
];

export const triggers: TriggerTag[] = [
  {
    label: 'Delay to completion',
    icon: ClockCircleOutlined,
    chipClass: 'badge-error border-badge-error-soft',
  },
  {
    label: 'Key date — Section 1',
    icon: InfoCircleOutlined,
    chipClass: 'badge-accent border-badge-accent-soft',
  },
  {
    label: 'Price increase',
    icon: DollarOutlined,
    chipClass: 'badge-warning border-badge-warning-soft',
  },
];

export const threadItems: ThreadItem[] = [
  { id: '1', label: 'Today 09:14 — J. Whitmore (this email)', active: true },
  { id: '2', label: 'Fri 17:02 — S. Collins (PM)' },
  { id: '3', label: 'Thu 15:48 — J. Whitmore' },
];

export const decisionCards: DecisionCard[] = [
  {
    id: 'ask',
    title: 'Ask contractor for missing info',
    description: 'Auspira drafts a reply requesting the 3 missing fields. EW not registered yet.',
    icon: MailOutlined,
    tone: 'primary',
    route: 'request-missing-info',
  },
  {
    id: 'accept',
    title: 'Accept & register despite gaps',
    description: 'Register EW-015 now. Missing fields can be completed later.',
    icon: CheckOutlined,
    tone: 'success',
    route: 'register',
  },
  {
    id: 'dismiss',
    title: 'Dismiss',
    description: 'Not an Early Warning. Recorded in audit trail with reason.',
    icon: CloseOutlined,
    tone: 'neutral',
  },
  {
    id: 'monitor',
    title: 'Monitor — Contractor Email',
    description: 'Keep watching. Auspira will alert again if there is any issue.',
    icon: EyeOutlined,
    tone: 'neutral',
  },
];
