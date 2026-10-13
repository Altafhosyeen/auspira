import type { Dayjs } from 'dayjs';

/** How DATE RAISED reads in the picker. The API is sent an ISO date, not this. */
export const DATE_RAISED_DISPLAY_FORMAT = 'MM/DD/YYYY';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ImpactTypeOption {
  label: string;
  value: string;
}

export interface EvidenceItem {
  id: string;
  iconType?: 'attachment' | 'email';
  label: string;
  isAuto: boolean;
  /** Present when the item is a real attachment — makes the label open the file. */
  url?: string;
}

// ─── COPY ─────────────────────────────────────────────────────────────────────

export const EW_FORM_COPY = {
  header: {
    title: 'Register Early Warning',
    clauseBadge: 'NEC4 Cl. 15.1',
    subtitle:
      'Complete the details below. This creates a formal record in the EW Register and starts the lifecycle.',
  },
  banner:
    "Auspira has pre-filled fields from the contractor's email and attachments. Review, complete any gaps, then save.",
  sections: {
    projectContext: 'Project Context',
    communicationDetails: 'Communication Details',
    earlyWarningMatter: 'Early Warning Matter',
    earlyWarningMatterHint: '(for Early Warning Register)',
  },
  labels: {
    ewReference: 'EW Reference',
    raisedBy: 'From',
    to: 'To',
    cc: 'CC',
    bcc: 'BCC',
    riskTitle: 'Subject',
    riskDescription: 'Description of Matter',
    riskDescriptionHint: 'This matter will be added to the Early Warning Register',
    dateRaised: 'Date',
    source: 'Source',
    projectName: 'Project Name',
    contractReference: 'Contract Reference',
    potentialImpacts: 'Potential Impacts',
    proposedActions: 'Proposed Mitigation Actions',
    keyDatesAffected: 'Key Dates Affected',
    impactTypes: 'Impact Types',
    clauseReferences: 'Clause References',
    evidenceAutoAttached: 'Evidence Auto-Attached',
    firstAction: 'First Action After Registering',
  },
  addMoreDocuments: 'Add more documents',
  autoTag: 'AUTO',
  actions: {
    saveDraft: 'Save draft',
    register: 'Notify',
  },
} as const;

// ─── OPTIONS ─────────────────────────────────────────────────────────────────

export const FIRST_ACTION_OPTIONS = ['Schedule Early Warning Meeting (Cl. 15.4)'] as const;

export const INITIAL_IMPACT_TYPES: ImpactTypeOption[] = [
  { label: 'Delay To Completion', value: 'delay' },
  { label: 'Key Date Impact', value: 'key-date' },
  { label: 'Cost Increase', value: 'cost' },
  { label: 'Performance Impairment', value: 'performance' },
];

/** Human file size, e.g. 1536 -> "1.5 KB". */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── ANT DESIGN FORM CONFIG ──────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}

export const FIRST_ACTION_SELECT_OPTIONS: SelectOption[] = FIRST_ACTION_OPTIONS.map((o) => ({
  label: o,
  value: o,
}));

export const IMPACT_TYPE_OPTIONS: SelectOption[] = INITIAL_IMPACT_TYPES.map((o) => ({
  label: o.label,
  value: o.value,
}));

export interface RegisterEwFormValues {
  ewReference: string;
  raisedBy: string;
  to?: string;
  cc?: string;
  bcc?: string;
  riskTitle: string;
  riskDescription?: string;
  /** DatePicker value — formatted to an ISO date only when the payload is built. */
  dateRaised?: Dayjs;
  source: string;
  potentialImpacts?: string;
  proposedActions?: string;
  keyDatesAffected?: string;
  impactTypes: string[];
  firstAction: string;
}
