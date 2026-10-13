import dayjs from 'dayjs';
import { PMI_TYPE_OPTIONS } from '../constants/pmi-form.constants';
import {
  type CreatePmiContext,
  type CreatePmiFormValues,
  PmiType,
  type RegisterPmiRequest,
} from '../types/pmi.types';

const TITLE_MAX_LENGTH = 120;

// The create screen has no title field — the register subject is the opening of the
// instruction details, cut on a sentence break where there is one (same rule the
// Compensation Event notice uses for its derived title).
export const buildPmiTitle = (details = ''): string => {
  const text = details.trim().replace(/\s+/g, ' ');
  if (text.length <= TITLE_MAX_LENGTH) return text;

  const sentenceEnd = text.slice(0, TITLE_MAX_LENGTH).lastIndexOf('. ');
  return sentenceEnd > 40
    ? text.slice(0, sentenceEnd + 1)
    : `${text.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`;
};

/** Recipient selects hold lists; the DTO takes one comma-joined string per field. */
export const joinRecipients = (recipients?: string[]): string | undefined => {
  const cleaned = (recipients ?? []).map((recipient) => recipient.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(', ') : undefined;
};

// The clause a preset carries rides on the option itself; an "Other" selection takes the
// clause reference the PM typed free-hand — it goes to `OtherClauseReference` whole, no
// catalogue splitting.
const resolvePmiClause = (
  values: CreatePmiFormValues
): { clauseNumber: string; clauseTitle: string; otherClauseReference: string } => {
  const option = PMI_TYPE_OPTIONS.find((candidate) => candidate.value === values.pmiType);

  if (option?.clauseNumber) {
    return {
      clauseNumber: option.clauseNumber,
      clauseTitle: option.clauseTitle ?? '',
      otherClauseReference: '',
    };
  }

  return {
    clauseNumber: '',
    clauseTitle: '',
    otherClauseReference: values.clauseReference?.trim() ?? '',
  };
};

// The wire model of the multipart POST — PascalCase keys bind straight to the DTO.
export const toRegisterPmiRequest = (
  values: CreatePmiFormValues,
  context: CreatePmiContext
): RegisterPmiRequest => {
  // The create screen collects an explicit title; fall back to the details-derived one
  // only if the field is empty.
  const title = values.title?.trim() || buildPmiTitle(values.instructionDetails);
  const clause = resolvePmiClause(values);

  return {
    ProjectId: context.projectId,
    // The screen collects no issue date; the backend stamps it on create.
    DateIssued: dayjs().toISOString(),
    ClauseTitle: clause.clauseTitle,
    ClauseNumber: clause.clauseNumber,
    OtherClauseReference: clause.otherClauseReference,
    Title: title,
    Details: values.instructionDetails?.trim() ?? '',
    ResponseRequiredBy: values.responseRequiredBy?.toISOString() ?? '',
    Type: values.pmiType ?? PmiType.Other,
    To: joinRecipients(values.to) ?? '',
    CC: joinRecipients(values.cc) ?? '',
    BCC: joinRecipients(values.bcc) ?? '',
    Subject: title,
    Attachments: context.attachments,
    // Only present on the cross-reference route; a direct register POST omits both
    // keys entirely rather than sending empty ones.
    ProjectCrossReferenceId: context.crossReference?.projectCrossReferenceId,
    Value: context.crossReference?.value?.trim() || undefined,
  };
};

// The axios interceptor picks the content type off `data instanceof FormData`, so the body
// has to be real FormData. Scalars are stringified; files are appended as-is.
export const toRegisterPmiFormData = (input: RegisterPmiRequest): FormData => {
  const formData = new FormData();

  const append = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
  };

  append('ProjectId', input.ProjectId);
  append('DateIssued', input.DateIssued);
  append('ClauseTitle', input.ClauseTitle);
  append('ClauseNumber', input.ClauseNumber);
  append('OtherClauseReference', input.OtherClauseReference);
  append('Title', input.Title);
  append('Details', input.Details);
  append('ResponseRequiredBy', input.ResponseRequiredBy);
  append('Type', input.Type);
  append('To', input.To);
  append('CC', input.CC);
  append('BCC', input.BCC);
  append('Subject', input.Subject);
  // `append` skips undefined/empty, so these two drop out on a non-cross-reference PMI.
  append('ProjectCrossReferenceId', input.ProjectCrossReferenceId);
  append('Value', input.Value);

  input.Attachments?.forEach((file) => {
    formData.append('Attachments', file);
  });

  return formData;
};
