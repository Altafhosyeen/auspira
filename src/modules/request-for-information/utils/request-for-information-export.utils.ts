import { parseBackendDate, type XlsxColumn } from '@/lib/utils';
import { REQUEST_FOR_INFORMATION_STATUS_LABELS } from '../constants/request-for-information.constants';
import type { RequestForInformation } from '../types/request-for-information.types';

const toDateCell = (value?: string | null) => {
  if (!value) return null;
  return parseBackendDate(value) ?? value;
};

export const REQUEST_FOR_INFORMATION_EXPORT_COLUMNS: XlsxColumn<RequestForInformation>[] = [
  { header: 'TQ Ref', width: 14, value: (rfi) => rfi.reference },
  { header: 'Title', width: 48, value: (rfi) => rfi.title },
  { header: 'Raised By', width: 22, value: (rfi) => rfi.raisedByName },
  { header: 'Due Date', width: 14, value: (rfi) => toDateCell(rfi.dueDate) },
  { header: 'Date Issued', width: 14, value: (rfi) => toDateCell(rfi.dateIssued) },
  {
    header: 'Status',
    width: 12,
    value: (rfi) => REQUEST_FOR_INFORMATION_STATUS_LABELS[rfi.status],
  },
];
