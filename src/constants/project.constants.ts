/**
 * Project Creation Constants
 * Contract documents, options, and related data
 */

import { ContractDocumentType } from '@/lib/utils/document.type.code';
import type { Document, MainOption } from '@/types/project/create.types';

export interface MainOptionDefinition {
  id: MainOption;
  label: string;
  description?: string;
}

export const REQUIRED_DOCS: Document[] = [
  {
    id: ContractDocumentType.FormOfAgreement,
    label: 'Form of Agreement',
    required: true,
    url: '/projects/form-of-agreement/:id',
    info: 'The signed cover page where the Employer and Contractor agree to the NEC terms and list the documents that make up the contract.',
    matchKeywords: ['form of agreement', 'agreement', 'foa', 'contract'],
  },
  {
    id: ContractDocumentType.ContractDataPart1,
    label: 'Contract Data Part 1 (Employer)',
    required: true,
    url: '/projects/contract-data-part-1/:id',
    info: 'Employer-completed data — key dates, the Main and Secondary Options, and project-specific figures that tailor the NEC conditions.',
    matchKeywords: [
      'contract data part 1',
      'contract data 1',
      'data part 1',
      'part 1',
      'cdp1',
      'cd1',
    ],
  },
  {
    id: ContractDocumentType.ContractDataPart2,
    label: 'Contract Data Part 2 (Contractor)',
    required: true,
    url: '/projects/contract-data-part-2/:id',
    info: "Contractor-completed data — the fee percentages, key people, and pricing information provided in the Contractor's tender.",
    matchKeywords: [
      'contract data part 2',
      'contract data 2',
      'data part 2',
      'part 2',
      'cdp2',
      'cd2',
    ],
  },
  {
    id: ContractDocumentType.Conditions,
    label: 'Conditions of Contract',
    required: true,
    url: '/projects/conditions-of-contract/:id',
    info: "The core NEC clauses governing the parties' obligations, payment, compensation events, and dispute resolution.",
    matchKeywords: ['conditions of contract', 'conditions', 'nec conditions'],
  },
  {
    id: ContractDocumentType.ZClauses,
    label: 'Z-clauses / Amendments',
    required: true,
    url: '/projects/z-clauses/:id',
    info: 'Bespoke amendments (Z-clauses) that add to or modify the standard NEC conditions for this contract.',
    matchKeywords: ['z clause', 'z clauses', 'zclause', 'amendment', 'amendments'],
  },
  {
    id: ContractDocumentType.WorksInfo,
    label: 'Works Information / Scope',
    required: true,
    url: '/projects/view-document-scop/:id',
    info: 'Defines what the Contractor must build and the standards it must meet — the scope of the works.',
    matchKeywords: ['works information', 'works info', 'scope of works', 'scope', 'works'],
  },
  {
    id: ContractDocumentType.SiteInfo,
    label: 'Site Information',
    required: true,
    url: '/projects/site-information/:id',
    info: 'Describes the physical site and the conditions (ground, access, existing structures) the Contractor should assume.',
    matchKeywords: ['site information', 'site info', 'site'],
  },
  {
    id: ContractDocumentType.Hsqe,
    label: 'HSQE Requirements',
    required: true,
    url: '/projects/hsqe-requirements/:id',
    info: 'Health, Safety, Quality and Environmental requirements the Contractor must comply with on site.',
    matchKeywords: ['hsqe', 'health', 'safety', 'quality', 'environment', 'environmental'],
  },
];

/** Document types that support child (supporting) documents */
export const SUPPORTING_DOCS_ALLOWED_TYPES = new Set([
  ContractDocumentType.WorksInfo,
  ContractDocumentType.SiteInfo,
  ContractDocumentType.Hsqe,
]);

export const OPTIONAL_DOCS: Document[] = [
  {
    id: ContractDocumentType.InsuranceCertificate,
    label: 'Insurance certificates',
    url: `/projects/document/:id?type=${ContractDocumentType.InsuranceCertificate}`,
    info: 'Evidence of the insurance policies the contract requires the Contractor (or Employer) to hold.',
  },
  {
    id: ContractDocumentType.CERegister,
    label: 'Existing CE register',
    url: `/projects/document/:id?type=${ContractDocumentType.CERegister}`,
    info: 'A register of Compensation Events already raised — useful when onboarding a contract that is already in delivery.',
  },
];

export const MAIN_OPTIONS: MainOptionDefinition[] = [
  {
    id: 'A',
    label: 'Priced contract with Activity Schedule',
    description: 'Fixed price contract with activity schedule for progress tracking.',
  },
  {
    id: 'B',
    label: 'Priced contract with Bill of Quantities',
    description: 'Measured contract with quantities and rates for payment.',
  },
  {
    id: 'C',
    label: 'Target Cost with Activity Schedule',
    description: 'Target cost with pain/gain share against activity schedule.',
  },
  {
    id: 'D',
    label: 'Target Cost with Bill of Quantities',
    description: 'Target cost contract using BOQ for compensation structure.',
  },
  {
    id: 'E',
    label: 'Cost Reimbursable',
    description: 'Defined cost reimbursed plus fee and compared to target.',
  },
  {
    id: 'F',
    label: 'Management Contract',
    description: 'Management-based delivery contract structure.',
  },
];

export const OPTION_SPECIFIC_DOCS: Record<MainOption, Document[]> = {
  A: [
    {
      id: ContractDocumentType.A1,
      label: 'Activity Schedule',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.A1}`,
      info: 'The priced list of activities used as the basis for payment under Main Option A.',
    },
  ],

  B: [
    {
      id: ContractDocumentType.B1,
      label: 'Bill of Quantities',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.B1}`,
      info: 'The measured quantities and rates used as the basis for payment under Main Option B.',
    },
  ],

  C: [
    {
      id: ContractDocumentType.C1,
      label: 'Activity Schedule',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.C1}`,
      info: 'The activity schedule used to build up the target price under Main Option C.',
    },
    {
      id: ContractDocumentType.C2,
      label: 'Target Price + Pain/Gain',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.C2}`,
      info: 'The target price and the pain/gain share arrangement that applies under Main Option C.',
    },
    {
      id: ContractDocumentType.C3,
      label: 'Pricing Document',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.C3}`,
      info: 'Supporting pricing detail underpinning the target cost for Main Option C.',
    },
  ],

  D: [
    {
      id: ContractDocumentType.D1,
      label: 'Bill of Quantities',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.D1}`,
      info: 'The measured quantities and rates used to build up the target price under Main Option D.',
    },
    {
      id: ContractDocumentType.D2,
      label: 'Target Price Document',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.D2}`,
      info: 'The agreed target price against which pain/gain is measured under Main Option D.',
    },
    {
      id: ContractDocumentType.D3,
      label: 'Pricing Breakdown',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.D3}`,
      info: 'Detailed pricing breakdown supporting the target under Main Option D.',
    },
  ],

  E: [
    {
      id: ContractDocumentType.E1,
      label: 'Defined Cost Schedule',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.E1}`,
      info: 'Schedule of Defined Cost reimbursed to the Contractor, plus fee, under Main Option E.',
    },
  ],

  F: [
    {
      id: ContractDocumentType.F1,
      label: 'Management Works Schedule',
      required: true,
      url: `/projects/document/:id?type=${ContractDocumentType.F1}`,
      info: 'The schedule of works the Contractor manages and subcontracts under Main Option F.',
    },
  ],
};

/**
 * Display names for the option-specific pricing documents (A1, B1, C1-C3, ...),
 * derived from `OPTION_SPECIFIC_DOCS` so the label is defined once. The option
 * letter is kept in the name because the same label is reused across options —
 * "Bill of Quantities" is both B1 and D1.
 */
export const OPTION_SPECIFIC_DOC_DISPLAY_NAMES: Record<number, string> = Object.fromEntries(
  Object.entries(OPTION_SPECIFIC_DOCS).flatMap(([option, docs]) =>
    docs.map((doc) => [doc.id, `${doc.label} (Option ${option})`] as const)
  )
);
