import type { ComposeEmailValues } from '../types/compensation-event-email.types';

export const COMPOSE_EMAIL_COPY = {
  title: 'Compose Email',
  labels: {
    from: 'From',
    to: 'To',
    cc: 'Cc',
    bcc: 'Bcc',
    subject: 'Subject',
    body: 'Email Body',
  },
  placeholders: {
    to: 'Select or type email recipients',
    cc: 'Add Cc recipients or type emails',
    bcc: 'Add Bcc recipients or type emails',
    subject: 'Subject',
  },
  actions: {
    saveDraft: 'Save Draft',
    cancel: 'Cancel',
    send: 'Send',
  },
  editor: {
    paragraph: 'Paragraph',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    clearFormatting: 'Clear formatting',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    alignLeft: 'Align left',
    alignCenter: 'Align center',
    alignRight: 'Align right',
    orderedList: 'Numbered list',
    bulletList: 'Bullet list',
    image: 'Insert image',
    link: 'Insert link',
    imagePrompt: 'Image URL',
    linkPrompt: 'Link URL',
  },
  messages: {
    recipientRequired: 'Add at least one recipient.',
    recipientInvalid: 'Remove the invalid email addresses before sending.',
    subjectRequired: 'Add a subject.',
    draftSaved: 'Draft saved.',
    sent: 'Email sent.',
  },
} as const;

export const COMPOSE_EMAIL_LIMITS = {
  subjectMaxLength: 200,
  recipientsMaxLength: 200,
} as const;

// The form is taller than a laptop viewport once the editor is in it, so the body scrolls
// inside the modal — the title and the Send button stay in view instead of being pushed
// off the bottom of the screen. The subtraction leaves room for both plus the modal's own
// vertical margins.
export const COMPOSE_EMAIL_SIZES = {
  bodyMaxHeight: 'calc(100dvh - 220px)',
} as const;

export const COMPOSE_EMAIL_SENDER = 'Auspira System <noreply@auspira.com>';

// Recipients and subject start empty — the sender addresses them. Only the body is
// seeded, with a generic message the sender edits before sending.
export const COMPOSE_EMAIL_DEFAULTS: ComposeEmailValues = {
  from: COMPOSE_EMAIL_SENDER,
  to: [],
  cc: [],
  bcc: [],
  subject: '',
  body: [
    '<p>Dear Sir/Madam,</p>',
    '<p><br /></p>',
    '<p>This message relates to a compensation event on the project above. Please review the details and provide your response at the earliest.</p>',
    '<p><br /></p>',
    '<p>If you have any questions or require further clarification, please feel free to reach out.</p>',
    '<p><br /></p>',
    '<p>Regards,<br />Auspira Team</p>',
  ].join(''),
};
