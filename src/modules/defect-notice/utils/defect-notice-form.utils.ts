import dayjs from 'dayjs';
import { DEFECT_NOTICE_CLAUSE_DESCRIPTIONS } from '../constants/defect-notice.constants';
import type {
  CreateDefectNoticeRequest,
  DefectNoticeFormValues,
} from '../types/defect-notice.types';

/** Submit context — project identity + picked files (multipart parts, not fields). */
export interface CreateDefectNoticeContext {
  projectId: string;
  projectName?: string;
  /** The signed-in user's full name — sent as the wire's `RaisedBy`. */
  raisedByName?: string;
  attachments: File[];
}

/** Recipient selects hold lists; the DTO takes one comma-joined string per field. */
export const joinDefectNoticeRecipients = (recipients?: string[]): string | undefined => {
  const cleaned = (recipients ?? []).map((recipient) => recipient.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(', ') : undefined;
};

// The clause select holds "Cl. 17.1"-style values; the wire model wants the bare number,
// with the description the register explains the clause through riding along from the
// same catalogue the header pill's tooltip reads.
const resolveDefectNoticeClause = (values: DefectNoticeFormValues) => {
  const raw = values.clauseReference?.trim() ?? '';
  const number = raw
    .replace(/^Cl\\.?\\s*/i, '')
    .replace(/^Clause\\s*/i, '')
    .trim();
  return {
    clauseNumber: number,
    clauseDescription: DEFECT_NOTICE_CLAUSE_DESCRIPTIONS[number] ?? '',
  };
};

// The wire model of the multipart POST — PascalCase keys bind straight to the DTO.
export const toCreateDefectNoticeRequest = (
  values: DefectNoticeFormValues,
  context: CreateDefectNoticeContext
): CreateDefectNoticeRequest => {
  const title = values.defectTitle?.trim() ?? '';
  const clause = resolveDefectNoticeClause(values);

  return {
    ProjectId: context.projectId,
    // The screen collects no raise date; the backend stamps it on create. The name rides
    // the signed-in user — the same source the PMI register's create uses for its fields.
    // The wire field is a date-only column (Swagger `format: "date"`), so a full ISO
    // timestamp is rejected by the model binder — send the calendar date alone.
    RaisedBy: context.raisedByName ?? '',
    DateRaised: dayjs().format('YYYY-MM-DD'),
    Title: title,
    Description: values.defectDescription?.trim() ?? '',
    Summary: values.defectDescription?.trim() ?? '',
    ClauseNumber: clause.clauseNumber,
    ClauseTitle: '',
    ClauseDescription: clause.clauseDescription,
    // The form's due date is the wire's overdue deadline — one field, same meaning.
    OverdueDateTime: values.dueDate?.toISOString() ?? '',
    Subject: title,
    To: joinDefectNoticeRecipients(values.to) ?? '',
    CC: joinDefectNoticeRecipients(values.cc) ?? '',
    BCC: joinDefectNoticeRecipients(values.bcc) ?? '',
    Attachments: context.attachments,
  };
};

// The axios interceptor picks the content type off `data instanceof FormData`, so the body
// has to be real FormData. Scalars are stringified; files are appended as-is.
export const toCreateDefectNoticeFormData = (input: CreateDefectNoticeRequest): FormData => {
  const formData = new FormData();

  const append = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
  };

  append('ProjectId', input.ProjectId);
  append('RaisedBy', input.RaisedBy);
  append('DateRaised', input.DateRaised);
  append('Title', input.Title);
  append('Description', input.Description);
  append('Summary', input.Summary);
  append('ClauseNumber', input.ClauseNumber);
  append('ClauseTitle', input.ClauseTitle);
  append('ClauseDescription', input.ClauseDescription);
  append('OverdueDateTime', input.OverdueDateTime);
  append('Subject', input.Subject);
  append('To', input.To);
  append('CC', input.CC);
  append('BCC', input.BCC);

  input.Attachments?.forEach((file) => {
    formData.append('Attachments', file);
  });

  return formData;
};

/** The accept endpoint's multipart body — alert id plus optional evidence files. */
export const toAcceptDefectNoticeFormData = (input: {
  projectAlertId: string;
  attachments?: File[];
}): FormData => {
  const formData = new FormData();
  formData.append('ProjectAlertId', input.projectAlertId);
  input.attachments?.forEach((file) => {
    formData.append('Attachments', file);
  });
  return formData;
};
