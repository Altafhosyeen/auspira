// ─── STATIC COPY ─────────────────────────────────────────────────────────────

/** Every sentence that names the early warning is a function of its reference: the reference is
 * read off the fetched record, so it is not known until the query resolves. Falls back to a
 * generic phrase in the meantime rather than rendering an empty gap mid-sentence. */
const referenceOr = (reference?: string): string => reference?.trim() || 'this early warning';

export const CLOSE_EW_COPY = {
  header: {
    title: 'Close Early Warning',
  },
  banner: (reference?: string) =>
    `Early Warning Meeting recorded. Mitigation options agreed. Now decide how ${referenceOr(
      reference
    )} is resolved.`,

  close: {
    title: 'Close Early Warning',
    reasonLabel: 'CLOSURE REASON',
    notesLabel: 'CLOSURE NOTES',
    notesPlaceholder: 'Summarise how this risk was resolved…',
    submit: 'Close EW',
  },

  link: {
    title: 'Link / Create Compensation Event',
    body: (reference?: string) =>
      `A PM instruction or CE trigger has been identified. Create a linked CE. ${referenceOr(
        reference
      )} and the CE remain separate records. The EW stays as evidence context.`,
    rule: (reference?: string) =>
      `Rule: EW and CE are always separate. The CE links back to ${referenceOr(
        reference
      )} for evidence context. Do not merge them.`,
    triggerLabel: 'CE TRIGGER TYPE',
    triggerPlaceholder: 'Select the clause the CE is raised under',
    // The list is the project's PM instruction clauses only — an empty one is a gap in that
    // catalogue, not in the project's clauses as a whole.
    triggerEmpty: 'No PM instruction clauses configured for this project.',
    submit: (reference?: string) => `Create CE linked to ${referenceOr(reference)}`,
  },
} as const;

// ─── FORM CONFIG ─────────────────────────────────────────────────────────────

export interface CloseEwFormValues {
  closureReason: number | undefined;
  closureNotes: string;
  /** Composite clause label from the project's PM instruction clauses — see
   * `useGetEventClauseOptions`. Handed to the CE notice form, which raises the CE itself. */
  ceTriggerType: string | undefined;
}

export const CLOSE_EW_INITIAL_VALUES: CloseEwFormValues = {
  closureReason: undefined,
  closureNotes: '',
  ceTriggerType: undefined,
};
