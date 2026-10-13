export const PM_ASSESSMENT_COPY = {
  header: {
    title: 'PM Assessment',
    export: 'Export',
  },
  banner:
    "This quotation includes the contractor's proposed cost, time, and programme impact for the identified compensation event. The PM has the option to request a revised quotation or proceed to assessment based on the submitted details.",
  // The screen assesses the quotation the signal carried, so a signal without one has
  // nothing to price.
  notFound: 'This signal carries no quotation to assess.',
  lines: {
    title: 'PM Assessment',
    // One pencil per assessed row, on the amount only — the description stays the
    // contractor's own account of what they claimed.
    editRow: 'Edit amount',
  },
  // Toggles the PM Assessment card between the editable line-item form and a single
  // document upload — the PM picks whichever way they want to record the assessment.
  method: {
    form: 'Contractor Quotation',
    document: 'Quotation Upload',
    tooltip:
      "Contractor Quotation: price the assessment line by line, editing the contractor's quoted amounts and adding the proposed days yourself. Quotation Upload: attach a single file with your assessment already prepared, instead of filling in the form.",
  },
  upload: {
    title: 'Drag & drop your assessment document',
    subtitle: 'or click to browse from your computer',
    hint: 'Supported: PDF, Word (DOC/DOCX), Excel (XLS/XLSX) · Up to 50MB',
    replace: 'Replace file',
    remove: 'Remove',
  },
  days: {
    title: 'Number of Days',
    // The frame reads "calender days" — a typo, corrected here.
    subtitle: 'Enter the proposed time impact in calendar days',
    placeholder: 'Enter number of days',
    // Pencil beside the figure, matching the assessed amount rows above it.
    edit: 'Edit number of days',
    // Stated like the amounts once set — a bare number reads as loose text next to them.
    unit: 'days',
    // Before the PM states a figure. A dash rather than the long placeholder, which
    // would stretch the fixed-width chip out of line with the amounts above it.
    empty: '—',
  },
  comment: {
    title: 'Comment',
    placeholder: 'Record why the determination was reached...',
  },
  summary: {
    title: 'PM Assessment',
    edit: 'Edit assessment',
    contractorClaim: "Contractor's claim",
    pmAssessment: "PM's assessment",
    basis: 'Basis',
  },
  lateCheck: {
    title: 'CLAUSE 63.7 - LATE EW CHECK',
    // Verbatim from the frame, which reads as a typo for "Late Payment Check".
    riskLabel: 'Last Payment Check',
    // NEC4 Cl.63.7 itself — the rule holds for every event, so it is copy rather than
    // data; only the finding underneath it is read off the signal.
    rule: 'If an Early Warning that an experienced contractor should have given was **not given in time**, the PM assesses the CE as if the EW had been given on time. This can reduce the Contractor’s entitlement.',
  },
  actions: {
    implementPrefix: 'Implement',
    confirmTitle: 'Implement your assessment?',
    // The endpoint names the event by reference, so it is held closed until there is one.
    linkRequired: 'Link the quotation to a compensation event before implementing it.',
  },
  messages: {
    implemented: 'Compensation event implemented.',
    implementFailed: 'The assessment could not be implemented.',
    implementUnavailable: 'This assessment is not linked to a signal that can be implemented.',
    exportFailed: 'The assessment could not be exported.',
    // Quotation Upload posts `IsFile: true`, so the backend expects a `QuotationFile`.
    documentRequired: 'Attach an assessment document before implementing it.',
  },
} as const;
