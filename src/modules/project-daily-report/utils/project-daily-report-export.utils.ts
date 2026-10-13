import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { XlsxColumn } from '@/lib/utils';
import { projectDailyReportStatusLabel } from '../constants/project-daily-report.constants';
import type { ProjectDailyReport } from '../types/project-daily-report.types';

dayjs.extend(customParseFormat);

// Register dates are already display strings ("20 Aug 2026"), not ISO — `new Date()` parses
// that shape inconsistently across engines, so read it with the format it was written in.
// Anything that does not match is exported verbatim rather than silently blanked.
const PROJECT_DAILY_REPORT_DATE_FORMAT = 'DD MMM YYYY';

const toDateCell = (value?: string | null) => {
  if (!value) return null;

  const parsed = dayjs(value, PROJECT_DAILY_REPORT_DATE_FORMAT, true);
  return parsed.isValid() ? parsed.toDate() : value;
};

export const PROJECT_DAILY_REPORT_EXPORT_COLUMNS: XlsxColumn<ProjectDailyReport>[] = [
  // Named after the register column it exports, not the "TQ Ref" this sheet was copied from.
  { header: 'DSR Ref', width: 14, value: (report) => report.reference },
  { header: 'Title', width: 48, value: (report) => report.title },
  { header: 'Submitted By', width: 22, value: (report) => report.submittedByName },
  { header: 'Raised At', width: 14, value: (report) => toDateCell(report.raisedAt) },
  // Exported as the whole number, not the "63%" string the table prints, so the cell stays
  // sortable and chartable. The unit lives in the header because the workbook's style table
  // carries no percent format — a 0.63 fraction would land in the sheet as a bare "0.63".
  { header: 'Progress (%)', width: 14, value: (report) => report.progress },
  {
    header: 'Status',
    width: 12,
    // Left blank rather than defaulted when the API sends no status, so the sheet never
    // states a state the row does not have.
    value: (report) =>
      report.statusCode === undefined ? null : projectDailyReportStatusLabel(report.statusCode),
  },
  { header: 'Description', width: 60, value: (report) => report.description ?? null },
];
