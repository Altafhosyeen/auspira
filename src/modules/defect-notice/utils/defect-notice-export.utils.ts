import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { XlsxColumn } from '@/lib/utils';
import { DEFECT_NOTICE_STATUS_LABELS } from '../constants/defect-notice.constants';
import type { DefectNotice } from '../types/defect-notice.types';

dayjs.extend(customParseFormat);

// Register dates are display strings ("20 Jul 2026") mapped off the API's ISO stamps —
// `new Date()` parses that shape inconsistently across engines, so read it with the
// format it was written in. Anything that does not match is exported verbatim rather
// than silently blanked.
const DEFECT_NOTICE_DATE_FORMAT = 'DD MMM YYYY';

const toDateCell = (value?: string | null) => {
  if (!value) return null;

  const parsed = dayjs(value, DEFECT_NOTICE_DATE_FORMAT, true);
  return parsed.isValid() ? parsed.toDate() : value;
};

export const DEFECT_NOTICE_EXPORT_COLUMNS: XlsxColumn<DefectNotice>[] = [
  { header: 'Defect Ref', width: 14, value: (notice) => notice.reference },
  { header: 'Title', width: 48, value: (notice) => notice.title },
  { header: 'Raised By', width: 22, value: (notice) => notice.raisedByName },
  { header: 'Role', width: 20, value: (notice) => notice.raisedByRole },
  { header: 'Date Issued', width: 14, value: (notice) => toDateCell(notice.dateIssued) },
  { header: 'Due Date', width: 14, value: (notice) => toDateCell(notice.dueDate) },
  {
    header: 'Status',
    width: 12,
    value: (notice) => DEFECT_NOTICE_STATUS_LABELS[notice.status] ?? String(notice.status),
  },
  { header: 'Reference Clause', width: 18, value: (notice) => notice.referenceClause ?? null },
  { header: 'Description', width: 60, value: (notice) => notice.description ?? null },
];
