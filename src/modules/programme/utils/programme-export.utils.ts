import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { XlsxColumn } from '@/lib/utils';
import { programmeStatusLabel } from '../constants/programme.constants';
import type { ProgrammeRegisterRow } from '../types/programme.types';

dayjs.extend(customParseFormat);

// Register dates are already display strings ("20 Aug 2026"), not ISO — `new Date()` parses
// that shape inconsistently across engines, so read it with the format it was written in.
// Anything that does not match is exported verbatim rather than silently blanked.
const PROGRAMME_DATE_FORMAT = 'DD MMM YYYY';

const toDateCell = (value?: string | null) => {
  if (!value) return null;

  const parsed = dayjs(value, PROGRAMME_DATE_FORMAT, true);
  return parsed.isValid() ? parsed.toDate() : value;
};

export const PROGRAMME_REGISTER_EXPORT_COLUMNS: XlsxColumn<ProgrammeRegisterRow>[] = [
  { header: 'PRG REF', width: 18, value: (row) => row.reference },
  { header: 'Completion Date', width: 18, value: (row) => toDateCell(row.completionDate) },
  { header: 'Variance', width: 14, value: (row) => row.variance || null },
  {
    header: 'Health',
    width: 12,
    // Left blank rather than defaulted when the API sends no indicator, so the sheet never
    // states a state the row does not have.
    value: (row) => (row.healthCode === undefined ? null : row.healthCode),
  },
  { header: 'Raised By', width: 22, value: (row) => row.raisedBy || null },
  { header: 'Raised At', width: 16, value: (row) => toDateCell(row.raisedAt) },
  {
    header: 'Status',
    width: 12,
    value: (row) => (row.statusCode === undefined ? null : programmeStatusLabel(row.statusCode)),
  },
];
