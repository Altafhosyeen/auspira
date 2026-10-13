// Confirmation copy for every mutating action in the CE flow. Each action states what will
// happen in the user's own terms rather than "Are you sure?", so the dialog carries the
// decision instead of just interrupting it.

// `danger` only changes how the dialog looks (red alert + red button) — every action,
// destructive or not, is gated behind typing its keyword.
export type ConfirmTone = 'danger' | 'primary';

export interface ConfirmActionCopy {
  title: string;
  // The sentence is split either side of the subject (a CE reference, a quotation total) so
  // the record being acted on can be emphasised — a confirmation that could describe any
  // row is not one.
  bodyBefore: string;
  bodyAfter: string;
  confirmLabel: string;
  tone: ConfirmTone;
  // The word the user types to unlock the confirm button. Destructive actions use DELETE;
  // workflow transitions use a word that matches what the button does.
  keyword: string;
}

export const COMPENSATION_EVENT_CONFIRM_COPY = {
  cancel: 'Cancel',
  // Stands in when the event has no reference yet, so a dialog never reads "delete undefined".
  unnamedSubject: 'this compensation event',
  // Split so the keyword can be emphasised in the markup; `keywordPrompt` keeps the flat
  // sentence for the input's aria-label, where markup would not carry.
  keywordPromptBefore: 'Type',
  keywordPromptAfter: 'to confirm',
  keywordPrompt: (keyword: string) => `Type ${keyword} to confirm`,
  irreversible: 'This action cannot be undone.',
  // Shown under the input once what was typed can no longer become the keyword. Names the
  // case rule explicitly, since that is the likeliest reason a user is stuck here.
  keywordMismatch: (keyword: string) => `Enter ${keyword} exactly, in capitals, to continue.`,
  keywordMatched: 'Confirmed — the action is ready to run.',

  deleteEvent: {
    title: 'Delete compensation event?',
    bodyBefore: 'This will permanently delete ',
    bodyAfter: ', including its quotations, assessments and uploaded evidence.',
    confirmLabel: 'Delete event',
    tone: 'danger',
    keyword: 'DELETE',
  },

  acceptQuotation: {
    title: 'Accept quotation?',
    bodyBefore: 'Accepting implements ',
    bodyAfter: ' at the quoted amount. The event is settled and the contractor is notified.',
    confirmLabel: 'Accept quotation',
    tone: 'primary',
    keyword: 'ACCEPT',
  },

  requestRevision: {
    title: 'Request a revised quotation?',
    bodyBefore: 'This sends the revision request to the contractor and returns ',
    bodyAfter: ' to the register awaiting a new quotation.',
    confirmLabel: 'Send request',
    tone: 'primary',
    keyword: 'REQUEST',
  },

  proceedWithAssessment: {
    title: 'Implement your assessment?',
    bodyBefore: 'This implements ',
    bodyAfter:
      " at your assessed amount in place of the contractor's quotation, and notifies them of the decision.",
    confirmLabel: 'Implement assessment',
    tone: 'primary',
    keyword: 'IMPLEMENT',
  },

  confirmReference: {
    title: 'Link this quotation?',
    bodyBefore: "This links the contractor's quotation to ",
    bodyAfter: '. Later steps act on the linked event.',
    confirmLabel: 'Link quotation',
    tone: 'primary',
    keyword: 'LINK',
  },

  acceptPmiQuotation: {
    title: 'Accept quotation?',
    bodyBefore: 'Accepting implements ',
    bodyAfter: ' at the quoted amount. The PMI is settled and the contractor is notified.',
    confirmLabel: 'Accept quotation',
    tone: 'primary',
    keyword: 'ACCEPT',
  },

  confirmPmiReference: {
    title: 'Link this quotation?',
    bodyBefore: "This links the contractor's quotation to ",
    bodyAfter: '. Later steps act on the linked instruction.',
    confirmLabel: 'Link quotation',
    tone: 'primary',
    keyword: 'LINK',
  },

  // The awareness CE-review decision row. Accepting raises the compensation event; the other
  // two close the signal off, and discard soft-deletes it.
  acceptSignal: {
    title: 'Accept as a compensation event?',
    bodyBefore: 'This raises a compensation event from ',
    bodyAfter: ' and opens its notice. The signal is settled as accepted.',
    confirmLabel: 'Accept',
    tone: 'primary',
    keyword: 'ACCEPT',
  },

  notAcceptSignal: {
    title: 'Record as not accepted?',
    bodyBefore: 'This records ',
    bodyAfter: ' as failing the Cl.61.3 test you picked, with your comment, and closes the signal.',
    confirmLabel: 'Not accepted',
    tone: 'primary',
    keyword: 'REJECT',
  },

  discardSignal: {
    title: 'Discard this?',
    bodyBefore: 'This discards ',
    bodyAfter: ', removing it from the awareness list. Your comment is kept as the reason.',
    confirmLabel: 'Discard',
    tone: 'danger',
    keyword: 'DISCARD',
  },

  createNotice: {
    title: 'Issue compensation event notice?',
    bodyBefore: 'This issues ',
    bodyAfter: ' to the contractor and starts the Cl.61.3 response clock.',
    confirmLabel: 'Issue notice',
    tone: 'primary',
    keyword: 'ISSUE',
  },
} as const satisfies Record<string, ConfirmActionCopy | string | ((value: string) => string)>;
