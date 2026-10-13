import { QuotationStatus } from '@/constants/enum.constant';
import type { QuotationLineCategory } from '../types/compensation-event-quotation.types';

export const CONTRACTOR_QUOTATION_COPY = {
  header: {
    title: 'Contractor Quotation',
  },
  banner:
    "This quotation includes the contractor's proposed cost, time, and programme impact for the identified compensation event. The PM has the option to request a revised quotation or proceed to assessment based on the submitted details.",
  quotation: {
    titlePrefix: 'Quotation -',
    // Used unprefixed when the signal carries no compensation event reference to name.
    title: 'Quotation',
    submittedPrefix: 'Submitted',
    columns: {
      item: 'ITEM',
      description: 'DESCRIPTION',
      // The frame hardcodes "AMOUNT - $"; the symbol comes off the quotation's own
      // currency instead, so a GBP quotation is not labelled in dollars.
      amountPrefix: 'AMOUNT -',
    },
    total: 'Total Quotation',
    // Heads the days card under the quotation. Read-only: the figure is the contractor's
    // claim, so the PM proposes their own on the assessment screen instead of editing it.
    daysHint: 'The time impact the contractor claimed in this quotation.',
    // A quotation that claimed no time impact at all, which is not a claim of zero days.
    noDaysClaimed: 'Not claimed',
    daysSuffix: 'days',
    daySuffix: 'day',
    // A quotation mail often states its programme impact without pricing anything; the
    // table stays so the total (and the link picker above it) still read.
    noItems: 'The email did not break the quoted cost down into items.',
    // The mail's reference is only a claim: the extractor writes whatever the contractor
    // typed, so the screen names the compensation event through this picker instead.
    link: {
      // Heads the rail card the picker sits in, so the control reads as its own step rather
      // than an unlabelled dropdown floating under the documents tiles.
      title: 'Linked Compensation Event',
      placeholder: 'Select compensation event',
      empty: 'No compensation events on this project',
      quotedPrefix: 'Email quoted',
      quotedSuffix: '- no match on this project',
      missing: '',
      confirm: 'Confirm',
    },
  },
  // The quotation's own `totalCost` item, shown on its own row rather than folded into
  // the priced lines, with the fee and the allowance listed under it.
  quotationAmount: {
    title: 'Quotation Amount',
    tooltip: 'The total quoted cost for the compensation event, as the contractor stated it.',
  },
  riskAllowance: {
    title: 'Risk Allowance',
    tooltip:
      'A contingency the contractor priced on top of the quoted cost to cover residual risk.',
    totalWithAllowance: 'Total with Risk Allowance',
  },
  programmeImpact: {
    // The frame reads "Progamme Impact" — a typo, corrected here.
    title: 'Programme Impact',
  },
  submittedBy: {
    title: 'Prepared By',
    columns: {
      name: 'ITEM',
      role: 'ROLE',
    },
    noPreparers: 'The email did not name who prepared the quotation.',
  },
  actions: {
    accept: 'Accepted Quotation',
    // The frame reads "Proceed o assessment" — a typo, corrected here.
    proceedToAssessment: 'Proceed to assessment',
    requestRevision: 'Request revised quotation',
    // Every action names the compensation event it acts on, so none of them can run
    // until the picker above settles which one that is.
    linkRequired: 'Select the compensation event this quotation belongs to first.',
    // The reply window has run out, so the quotation can no longer be actioned either way.
    overdue: 'The time bar for this quotation has expired — it can no longer be actioned.',
  },
  // Popconfirm titles for the one-way quotation actions; each description is the record's
  // own name from the API.
  popconfirm: {
    accept: { title: 'Accept this quotation?', okText: 'Accept' },
    link: { title: 'Link this quotation?', okText: 'Link' },
    requestRevision: { title: 'Send revision request?', okText: 'Send' },
    cancel: 'Cancel',
  },
  // The "Request revised quotation" modal — a comment and a document upload. The comment
  // is sent as the request-revision endpoint's `description` and the files as real
  // multipart `attachments`; `subject` has no field of its own and is filled from
  // `revisionEmail.subject` below, since the endpoint takes no recipient list to reply to.
  requestRevisionModal: {
    title: 'Request Revised Quotation',
    commentLabel: 'Comment',
    commentPlaceholder: 'Enter your comment here...',
    commentRequired: 'Enter a comment for the contractor before sending.',
    uploadTitle: 'Upload Documents',
    uploadButton: 'Upload',
    uploadEmpty: 'No documents uploaded yet.',
    uploadSupported: 'Supported: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), CSV',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  // Seeds the Compose Email modal when the PM asks for a revised quotation: the mail is a
  // reply to the one the quotation arrived on, so the signal fills every part of it.
  // `{reference}`, `{submittedOn}`, `{total}` and `{deadline}` are filled from the signal.
  revisionEmail: {
    // Titles the shared Compose Email modal so it names this errand rather than reading
    // as a generic `Compose Email`.
    modalTitle: 'Request revised quotation',
    subject: 'Request for revised quotation',
    replyPrefix: 'Re: ',
    // Stands in for the reference when the quotation is not linked to an event yet.
    unnamedEvent: 'this compensation event',
    greeting: 'Dear Sir/Madam,',
    intro:
      'We have reviewed the quotation submitted for {reference} and require a revised submission before it can be assessed.',
    quoted: 'Quotation submitted on {submittedOn} for a total of {total}.',
    request:
      'Please review the assumptions, rates and programme impact behind the quoted figures and re-submit the quotation with the supporting build-ups.',
    // Only appended when the signal carries a reply deadline to name.
    deadline: 'A response is required by {deadline}.',
    closing:
      'If you have any questions or require further clarification, please feel free to reach out.',
    signOff: 'Regards,<br />Auspira Team',
  },
  // The register's own quotation, opened by id from a CE row. It is a record rather than
  // a decision — nothing on the screen acts on it, so the copy explains what it shows.
  detail: {
    banner:
      'This is the quotation submitted against this compensation event: the priced items, risk allowance and programme impact exactly as the contractor stated them.',
    notFound: 'This quotation could not be found.',
  },
  notFound: 'No quotation has been submitted for this compensation event yet.',
  messages: {
    confirmed: 'Compensation event linked to this quotation.',
    confirmFailed: 'Could not link the compensation event. Please try again.',
    confirmUnavailable: 'This quotation has no linked project alert, so it cannot be confirmed.',
    accepted: 'Quotation accepted.',
    acceptFailed: 'Could not accept the quotation. Please try again.',
    // Both quotation endpoints are keyed on the alert the quotation arrived on — without
    // one there is nothing to act on, so say so rather than send a request that 400s.
    acceptUnavailable: 'This quotation has no linked project alert, so it cannot be accepted.',
    revisionRequested: 'Revision request sent to the contractor.',
    revisionFailed: 'Could not send the revision request. Please try again.',
    revisionUnavailable:
      'This quotation has no linked project alert, so a revision cannot be requested.',
  },
} as const;

export const QUOTATION_SUBMITTED_DATE_FORMAT = 'DD MMM YYYY';

export const QUOTATION_CATEGORY_LABELS: Record<QuotationLineCategory, string> = {
  people: 'People',
  equipment: 'Equipment',
  fee: 'Fee',
  other: 'Other',
};

// The register sends the quotation's status as a QuotationStatus number, not a word.
export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  [QuotationStatus.PendingReview]: 'Pending Review',
  [QuotationStatus.Accepted]: 'Accepted',
  [QuotationStatus.NotAccepted]: 'Not Accepted',
  [QuotationStatus.RevisionRequested]: 'Revision Requested',
  [QuotationStatus.ProceededWithAssessment]: 'Proceeded With Assessment',
};
