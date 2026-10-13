import { PmiType, type PmiTypeOption } from '../types/pmi.types';

// The PMI Selection presets — each names the NEC4 clause the instruction is issued under,
// and picking one auto-fills the Clause Reference field. "Other" carries no clause: the
// Clause Reference then loads the project's clause catalogue (entityType = PMI) so the
// Project Manager can pick any clause configured on the project.
export const PMI_TYPE_OPTIONS: PmiTypeOption[] = [
  {
    value: PmiType.ChangeScopeOrKeyDate,
    label: 'Change the Scope or a Key Date (Cl. 14.3)',
    clauseNumber: '14.3',
    clauseTitle: 'Change the Scope or a Key Date',
  },
  {
    value: PmiType.ProposedInstruction,
    label: 'Proposed instruction (Cl. 65.1)',
    clauseNumber: '65.1',
    clauseTitle: 'Proposed instruction',
  },
  {
    value: PmiType.StopWorkNotice,
    label: 'Stop work notice (Cl. 34.1)',
    clauseNumber: '34.1',
    clauseTitle: 'Stop work notice',
  },
  {
    value: PmiType.Other,
    label: 'Other',
  },
];

/** Display prefix for the auto-filled Clause Reference of a preset selection. */
export const CLAUSE_REFERENCE_PREFIX = 'Cl. ';

export const PMI_DATE_FORMAT = 'DD/MM/YYYY';

export const PMI_FORM_COPY = {
  title: "Create Project Manager's Instruction",
  infoTooltip: 'In accordance with NEC4 Engineering and Construction Contract.',
  basicDetailsTitle: 'Basic Details',
  informationTitle: 'Information',
  uploadTitle: 'Upload Documents',
  to: 'To',
  cc: 'CC',
  bcc: 'BCC',
  pmiSelection: 'PMI Selection',
  clauseReference: 'Clause Reference',
  titleLabel: 'Title',
  instructionDetails: 'Instruction Details',
  responseRequiredBy: 'Contractor Response Required By',
  toPlaceholder: 'Add recipients',
  ccPlaceholder: 'Add CC recipients',
  bccPlaceholder: 'Add BCC recipients',
  pmiSelectionPlaceholder: 'Select an Option',
  clauseReferencePlaceholder: 'Select a clause',
  clauseReferenceFreeTextPlaceholder: 'Enter clause reference',
  titlePlaceholder: 'Provide a clear, concise title for the instruction',
  instructionDetailsPlaceholder: 'Provide a clear, detailed description of the instruction',
  clauseEmpty: 'No contract clauses are configured for this project.',
  crossReferenceOrigin: 'From Cross Reference',
  crossReferenceTooltip: 'Raised from cross-reference',
  crossReferenceAgreedValue: 'Agreed value',
  crossReferenceContractRoute: 'Raised from contract route',
  crossReferenceRouteChip: 'Contract route',
  notify: 'Notify',
  notifyCompensationEvent: 'Notify and Compensation Event',
  submitted: "The project manager's instruction has been submitted.",
  submitFailed: "Could not submit the project manager's instruction.",
} as const;
