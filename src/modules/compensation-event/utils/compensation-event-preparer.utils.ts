import type { QuotationSubmission } from '../types/compensation-event-quotation.types';
import type { AlertQuotationPreparerDto } from '../types/compensation-event-quotation-api.types';

// Keys are lower-camelled before they are read: the extractor has been seen sending both
// casings on sibling alert fields (see `parseAlertCompensationEvent`).
export const toCamelKeys = (value: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key.replace(/^./, (character) => character.toLowerCase()),
      entry,
    ])
  );

export const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

// A person needs a letter or a digit to be a person. The extractor leaves the field as
// its own scaffolding when the mail never named anyone ("[]", "{}", "-"), and that is a
// row the table should not draw at all.
export const isNamed = (name: string | null | undefined): name is string =>
  !!name && /[\p{L}\p{N}]/u.test(name);

// `preparedBy` is a free-form column, so the rows the extractor wrote can reach the UI
// still JSON-encoded ("[{\"name\": \"Altaf Hussain\", \"role\": \"Project Team\"}]") —
// read them back rather than rendering the encoding. Null when the field is the plain
// name the register writes. An encoding that decodes to nothing ("[]", "[{}]") still
// counts as decoded and returns no rows: falling back to the plain-string branch there
// would render the encoding itself as a person named "[]".
const parsePreparerRows = (value: string): AlertQuotationPreparerDto[] | null => {
  if (!value.startsWith('[') && !value.startsWith('{')) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  return (Array.isArray(parsed) ? parsed : [parsed])
    .map((row) => (typeof row === 'string' ? { name: row } : asRecord(row)))
    .filter((row): row is Record<string, unknown> => !!row)
    .map((row) => toCamelKeys(row) as AlertQuotationPreparerDto);
};

// The contractor's name as a person reads it, off the same free-form `preparedBy` the
// Quotation screen decodes: the JSON rows the extractor writes are parsed back to their
// names, and the register's "Name, Role" form keeps only the name.
export const resolvePreparedByName = (
  preparedBy: string | AlertQuotationPreparerDto[] | null | undefined
): string | undefined => {
  const value = Array.isArray(preparedBy) ? '' : preparedBy?.trim();
  const rows = Array.isArray(preparedBy) ? preparedBy : parsePreparerRows(value ?? '');

  if (rows) {
    const names = rows.map((preparer) => preparer?.name?.trim()).filter(isNamed);
    return names.length ? names.join(', ') : undefined;
  }

  const name = value?.split(',')[0].trim();
  return isNamed(name) ? name : undefined;
};

// The register folds the role into the same field ("J. Whitfield, Contracts Manager") —
// split on the first comma so the name and the role land in their own columns. The
// extractor also sends a row per person, which already keeps them apart. Neither payload
// carries a submission time, so rows are stamped with when the quotation reached Auspira.
export const buildQuotationSubmittedBy = (
  id: string,
  preparedBy: string | AlertQuotationPreparerDto[] | null | undefined,
  submittedAt: string
): QuotationSubmission[] => {
  const value = Array.isArray(preparedBy) ? '' : preparedBy?.trim();
  const rows = Array.isArray(preparedBy) ? preparedBy : parsePreparerRows(value ?? '');

  if (rows) {
    return rows
      .map((preparer, index) => ({
        id: `${id}-${index}`,
        name: preparer?.name?.trim() ?? '',
        role: preparer?.role?.trim() ?? '',
        submittedAt,
      }))
      .filter((submission) => isNamed(submission.name));
  }

  const [name, ...role] = (value ?? '').split(',');
  const trimmed = name.trim();
  if (!isNamed(trimmed)) return [];

  return [{ id, name: trimmed, role: role.join(',').trim(), submittedAt }];
};
