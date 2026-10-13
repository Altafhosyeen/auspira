/**
 * Data-point keys arrive from the API as raw identifiers — `CONTRACTOR_ENTITY_NAME`,
 * `contractor_entity_name` or `contractorEntityName` depending on the key — and were being
 * printed verbatim, underscores and all.
 *
 * This only splits the identifier into words; the casing is deliberately left alone because
 * every display site renders it in an `uppercase` style already.
 *
 * `finding.field` itself stays raw so it keeps matching a pasted key in search.
 */
export const formatFieldKey = (key?: string | null): string =>
  (key ?? '')
    .replace(/[_-]+/g, ' ')
    // camelCase / PascalCase boundary, e.g. "contractorEntity" → "contractor Entity".
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
