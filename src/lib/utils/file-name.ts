/** Storage GUID that uploads are prefixed with, e.g. "9596c895-1f3a-4b2c-9d8e-0a1b2c3d4f30-Report_v3.xlsx". */
const STORAGE_GUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;

/** Trailing browser de-duplication suffix, e.g. "Scope (1).pdf" or "Scope (2) 1.pdf". */
const DUPLICATE_SUFFIX = /(?:\s*\(\d+\))+(?:\s+\d+)?$/;

/**
 * The upload's file name as it should be shown in the UI: storage GUID prefix removed,
 * extension dropped, browser duplicate suffixes ("(1)", "(2) 1") stripped, and separators
 * turned back into spaces — e.g. "04_Z_clauses_1 (1).pdf" -> "04 Z clauses 1".
 */
export const displayFileName = (fileName?: string | null): string => {
  const withoutGuid = (fileName ?? '').replace(STORAGE_GUID_PREFIX, '').trim();
  if (!withoutGuid) return '';

  // Only treat the last segment as an extension when it looks like one — names such as
  // "C-167-DW-CI31-5" have no extension and must not lose their final segment.
  const withoutExtension = withoutGuid.replace(/\.[a-z0-9]{1,6}$/i, '');
  const base = withoutExtension || withoutGuid;

  return base
    .replace(DUPLICATE_SUFFIX, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};
