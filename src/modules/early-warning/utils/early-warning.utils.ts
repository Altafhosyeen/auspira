import { parseBackendDate } from '@/lib/utils';
import {
  type EarlyWarning,
  type EarlyWarningRegisterStatus,
  type EarlyWarningRegisterTab,
  EarlyWarningStatusFilter,
} from '../types/early-warning.types';

/** The design's status dropdown: All Status (undefined) or one register status. */
export const matchesStatus = (ew: EarlyWarning, status?: EarlyWarningRegisterStatus) =>
  !status || ew.status === status;

/** Filter matching against EarlyWarningStatusFilter enum. */
export const matchesStatusFilter = (
  ew: EarlyWarning,
  filter: EarlyWarningStatusFilter
): boolean => {
  switch (filter) {
    case EarlyWarningStatusFilter.ALL:
      return true;
    case EarlyWarningStatusFilter.OPEN:
      return ew.status === 'OPEN';
    case EarlyWarningStatusFilter.CLOSED:
      return ew.status === 'CLOSED';
    case EarlyWarningStatusFilter.NOT_ACCEPTED:
      return ew.status === 'NOT_ACCEPTED';
    case EarlyWarningStatusFilter.DISCARD:
      return ew.status === 'DISCARD';
    default:
      return true;
  }
};

/** Register tab membership. Archived holds closed rows; Discarded holds withdrawn ones. */
export const matchesRegisterTab = (ew: EarlyWarning, tab: EarlyWarningRegisterTab) => {
  if (tab === 'ARCHIVED') return ew.status === 'CLOSED';
  if (tab === 'DISCARDED') return ew.status === 'DISCARD';
  return ew.status !== 'CLOSED' && ew.status !== 'DISCARD';
};

/** Client-side search across the register's visible columns. */
export const matchesSearchTerm = (ew: EarlyWarning, term: string) => {
  const needle = term.toLowerCase();
  return [ew.reference, ew.title, ew.raisedBy, ew.source, ew.potentialImpacts, ew.description].some(
    (field) => field?.toLowerCase().includes(needle)
  );
};

/** Whole days from now until the deadline — negative once it has passed, null when undated. */
export const daysRemaining = (deadline?: string | null): number | null => {
  const due = parseBackendDate(deadline);
  if (!due) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDue = new Date(due);
  startOfDue.setHours(0, 0, 0, 0);
  return Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86_400_000);
};

/** Trigger a browser save for a blob — used by the attachment download action. */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
