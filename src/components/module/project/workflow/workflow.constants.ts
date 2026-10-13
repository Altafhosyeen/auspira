export const MAIN_STAGES = [
  { id: 'A', title: 'PROJECT BASIC & CONTRACTS' },
  { id: 'B', title: 'PROGRAMME INGESTION' },
  { id: 'C', title: 'CROSS REFERENCE' },
  { id: 'D', title: 'COMPLETION' },
] as const;

export type MainStageId = (typeof MAIN_STAGES)[number]['id'];

export const STEP_ONE_VIEWS = [
  {
    title: '1. Create Project',
    description: 'Create a project and upload supporting documents to get started.',
  },
  {
    title: '2. Review Documents',
    description: 'Documents are staged. Please review before extraction.',
  },
  {
    title: '3. Execute Contract',
    description:
      "Review and confirm the extracted contract details to establish your project's source of truth.",
  },
] as const;

export const PAGE_HEADINGS: Record<number, string | ((view: number) => string)> = {
  0: (view: number) => {
    if (view === 0) return 'Project Onboarding - Stage A : Project Basic & Contracts';
    if (view === 1) return 'Project Onboarding - Stage A :';
    return 'Project Onboarding - Stage A : Data Verification';
  },
  1: 'Project Onboarding - Stage B : Programme Ingestion',
  2: 'Project Onboarding - Stage C : Cross Reference',
  3: 'Project Onboarding - Stage D : Completion',
};

/**
 * Step-by-step guidance for each stage/view, shown in the info-icon tooltip next to the
 * page heading. Keyed the same way as PAGE_HEADINGS (Stage A depends on the sub-view).
 */
export const PAGE_HEADING_STEPS: Record<number, string[] | ((view: number) => string[])> = {
  0: (view: number) => {
    if (view === 0)
      return [
        'Enter the project name, reference ID and NEC form, then save to create the project.',
        'Upload each required contract document (Form of Agreement, Contract Data, Conditions, etc.).',
        'Pick the Main Option (A–F) and upload its matching pricing document.',
        'Click Extract so Auspira can read the contract and move you to the next step.',
      ];
    if (view === 1)
      return [
        'Review every document you staged for this project.',
        'Check each file name and type against the slot it was uploaded to.',
        'Replace or remove anything incorrect before extraction runs.',
        'Continue once all documents look correct.',
      ];
    return [
      'Review the contract details Auspira extracted from your documents.',
      'Compare each field against the source contract.',
      'Edit any value that does not match.',
      "Confirm to lock this in as your project's source of truth.",
    ];
  },
  1: [
    'Upload your latest project programme / schedule file.',
    'Auspira parses the activities, milestones and key dates.',
    'Wait for parsing to finish.',
    'Continue to review the parsed programme.',
  ],
  2: [
    'Auspira cross-checks the programme against the contract requirements.',
    'Review each flagged mismatch or alignment on the critical path.',
    'Resolve or acknowledge the differences.',
    'Confirm to complete cross-referencing.',
  ],
  3: [
    'Your project onboarding is complete.',
    'The contract and programme are now aligned.',
    'Open the project dashboard to start managing it.',
  ],
};
