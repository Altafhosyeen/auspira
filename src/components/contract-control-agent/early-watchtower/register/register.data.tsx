import type React from 'react';
import { MailOutlined, PaperClipOutlined } from '@ant-design/icons';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ImpactTypeOption {
  label: string;
  value: string;
  checked: boolean;
}

export interface EvidenceItem {
  id: string;
  icon?: React.ReactNode;
  label: string;
  isAuto: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ─── FORM DATA ───────────────────────────────────────────────────────────────

export const EW_DETAILS = {
  reference: 'EW-015',
  riskTitle: 'Piling delay — ground conditions N-E quadrant, Section 1',
  riskDescription:
    'Unexpectedly poor ground conditions in the north-east quadrant are causing a 3–4 week slippage on piling works. This will push the structural steel sequence and is expected to affect the Section 1 completion date of 14 August 2026.',
  dateRaised: '27 Jun 2026',
  source: 'Email — J. Whitmore',
};

export const raisedByOptions: SelectOption[] = [
  { value: 'buildco', label: 'Contractor (BuildCo Ltd)' },
];

export const IMPACT = {
  timeImpact: '3–4 weeks (estimated)',
  costImpact: 'TBC — awaiting contractor estimate',
  keyDates: 'Section 1 Completion — 14 August 2026',
};

export const impactTypes: ImpactTypeOption[] = [
  { label: 'Delay To Completion', value: 'delay', checked: true },
  { label: 'Key Date Impact', value: 'key-date', checked: true },
  { label: 'Cost Increase', value: 'cost', checked: false },
  { label: 'Performance Impairment', value: 'performance', checked: false },
];

export const clauseReferences: string[] = ['Cl. 15.1', 'Cl. 63.5', 'Key Date - Z4.2'];

export const evidenceItems: EvidenceItem[] = [
  {
    id: '1',
    icon: <MailOutlined className="text-icon text-xs" />,
    label: 'Email thread (3 msgs)',
    isAuto: true,
  },
  {
    id: '2',
    icon: <PaperClipOutlined className="text-icon text-xs" />,
    label: 'DW-PRG-0041 Rev B.pdf',
    isAuto: true,
  },
];

export const firstActionOptions: SelectOption[] = [
  { value: 'rrm', label: 'Schedule Early Warning Meeting (Cl. 15.4)' },
];
