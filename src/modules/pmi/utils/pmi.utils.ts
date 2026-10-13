import type { ProjectManagerInstruction } from '../types/pmi.types';

/** Client-side search across the register's visible columns. */
export const matchesSearchTerm = (pmi: ProjectManagerInstruction, term: string): boolean => {
  const needle = term.toLowerCase();
  return [pmi.reference, pmi.title, pmi.details, pmi.clauseNumber, pmi.referenceClause].some(
    (field) => field?.toLowerCase().includes(needle)
  );
};

/** Status code → filter option value (numeric). */
export const toStatusFilterValue = (status: number | string | undefined): number =>
  Number(status ?? 0);

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
