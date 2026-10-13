import { getDocumentTypeDisplayName, getDocumentTypeName } from '@/lib/utils/document.type.code';
import {
  type DataPointTab,
  type Finding,
  type FindingValueSource,
  type ProjectCrossReference,
  type ProjectCrossReferenceGroup,
  ProjectKeyCategory,
  ProjectKeyStatus,
} from './types';

/** Map the API's numeric data-point category to the UI tab (None has no tab). */
const CATEGORY_TO_TAB: Partial<Record<ProjectKeyCategory, DataPointTab>> = {
  [ProjectKeyCategory.Quantitative]: 'quantitative',
  [ProjectKeyCategory.Qualitative]: 'qualitative',
  [ProjectKeyCategory.Date]: 'date',
};

/** Map the API's `projectKeyStatus` to the card's severity tone. */
const STATUS_TO_TYPE: Record<ProjectKeyStatus, Finding['type']> = {
  [ProjectKeyStatus.None]: 'warning',
  [ProjectKeyStatus.Passed]: 'passed',
  [ProjectKeyStatus.Warning]: 'warning',
  [ProjectKeyStatus.Failed]: 'error',
  [ProjectKeyStatus.NeedsReview]: 'warning',
  [ProjectKeyStatus.Resolved]: 'passed',
};

/** Human-readable document name from the numeric `documentType` code. */
const documentName = (documentType: number): string =>
  getDocumentTypeName(documentType) ?? `Document ${documentType}`;

/** Human, spaced document-family label shown as "Source" in the source viewer dialog. */
const documentTypeLabel = (documentType: number): string =>
  getDocumentTypeDisplayName(documentType);

/**
 * The backend emits UTF-8 `£` mis-decoded as `Â£`; strip the stray byte so
 * money values render cleanly in the UI.
 */
const cleanValue = (value: string): string => value.replace(/Â(?=[£€])/g, '');

/**
 * The backend sends `page: 0` when it could not pin a value to a page. Treat that as
 * unknown so the UI never renders a meaningless "Page 0" or opens the viewer at page 0.
 */
const toPageNumber = (page: number): number | undefined => (page > 0 ? page : undefined);

/** Display name for a key-value's document — the file name when the API sends one. */
const sourceDocumentName = (
  kv: ProjectCrossReference['projectCrossReferenceKeyValues'][number]
): string => kv.reference?.trim() || documentName(kv.documentType);

/**
 * Identity used to collapse repeated references to the same document. Keyed on the
 * displayed file name rather than `projectDocumentId`, because the same file can be
 * uploaded under several document-type slots — it carries a different id and type code
 * each time, but renders as an identical row.
 */
const documentIdentity = (name: string): string => name.trim().toLowerCase();

const toSource = (
  kv: ProjectCrossReference['projectCrossReferenceKeyValues'][number]
): FindingValueSource => ({
  docName: documentName(kv.documentType).toUpperCase(),
  value: cleanValue(kv.value),
  page: `PAGE ${kv.page}`,
  clause: kv.reference ?? '',
  // Carried through for the source viewer dialog (eye action).
  documentUrl: kv.projectDocumentUrl,
  projectDocumentId: kv.projectDocumentId,
  pageNumber: toPageNumber(kv.page),
  documentName: sourceDocumentName(kv),
  documentTypeLabel: documentTypeLabel(kv.documentType),
});

/**
 * One source row per document, so the drawer names every document the value was found in
 * and its row count matches the card's "N docs" badge.
 *
 * Only genuinely identical rows are collapsed — same document *and* same value. That happens
 * when one file is uploaded under several document-type slots: it comes back with a different
 * id and type code each time but renders as a duplicate row. Deduplicating by value alone
 * (as this previously did) instead hid every document that agreed with one already listed.
 */
const dedupeSources = (
  keyValues: ProjectCrossReference['projectCrossReferenceKeyValues']
): FindingValueSource[] => {
  const seen = new Set<string>();

  return keyValues.reduce<FindingValueSource[]>((sources, kv) => {
    const key = `${documentIdentity(sourceDocumentName(kv))}|${cleanValue(kv.value).trim()}`;
    if (seen.has(key)) return sources;
    seen.add(key);
    sources.push(toSource(kv));
    return sources;
  }, []);
};

/** Distinct document names across the finding, keyed exactly as the drawer's rows are. */
const collectDocuments = (sources: FindingValueSource[]): string[] =>
  Array.from(
    new Map(
      sources.map((source) => {
        const name = source.documentName || source.docName;
        return [documentIdentity(name), name];
      })
    ).values()
  );

/**
 * Parse description into bullet points if it contains multiple sentences or items.
 * Splits on common delimiters: newlines, semicolons, or periods followed by space.
 */
const parseDescription = (description: string): string | string[] => {
  if (!description) return '';

  // Check for newlines — explicit bullet format from API or backend
  if (description.includes('\n')) {
    return description
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Check for semicolon-separated items
  if (description.includes(';')) {
    return description
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Single sentence — keep as string
  return description;
};

const toFinding = (ref: ProjectCrossReference): Finding => {
  const hasValues = ref.projectCrossReferenceKeyValues.length > 0;
  // The backend is inconsistent about casing here ("Error" / "error" / "ERROR"),
  // so normalise before comparing rather than matching an exact literal.
  const isError = ref.errorType?.toLowerCase() === 'error';
  // Severity comes from the API status; an "Error" errorType forces an error tone
  // as a fallback when the status is ambiguous.
  const type: Finding['type'] = isError
    ? 'error'
    : (STATUS_TO_TYPE[ref.projectKeyStatus] ?? 'warning');

  // Document-type labels stay the toolbar's filter options — stable across projects,
  // unlike file names.
  const associatedDocs = Array.from(
    new Set(ref.projectCrossReferenceKeyValues.map((kv) => documentName(kv.documentType)))
  );

  const sources = hasValues ? dedupeSources(ref.projectCrossReferenceKeyValues) : undefined;

  return {
    id: ref.id,
    title: ref.label,
    type,
    keyStatus: ref.projectKeyStatus,
    category: isError ? 'CONSISTENCY' : 'EXISTENCE',
    field: ref.key,
    tab: CATEGORY_TO_TAB[ref.projectKeyCategory] ?? 'quantitative',
    presentation: hasValues ? 'comparison' : 'missing',
    associatedDocs,
    documents: sources ? collectDocuments(sources) : [],
    sources,
    description: parseDescription(ref.description),
    statusLabel: hasValues ? undefined : 'Not Found',
    // Findings can carry 5–6 conflicting values, so label each resolve button
    // with its actual value ("A/B" letters only make sense for two sources).
    resolveLabelStyle: 'value',
    // Carry the API's resolution state so the dashboard can seed its UI from it.
    resolvedValue: ref.value ? cleanValue(ref.value) : undefined,
    isContractRoute: ref.isContractRoute,
    conversationId: ref.conversationId,
    errorMessage: ref.errorMessage,
    // Who resolved the conflict and when — rendered in the drawer once resolved.
    resolvedBy: ref.resolvedBy,
    resolvedAt: ref.resolvedAt,
    projectManagerInstructionId: ref.projectManagerInstructionId,
  };
};

/**
 * The API can return the same data-point `key` more than once (e.g. two
 * `starting_date` checks, one of which also includes the Primavera programme).
 * Collapse them to one entry per key, keeping the most complete run (the one
 * with the most extracted values), so the UI shows a single card per key.
 * First-seen order is preserved.
 */
const dedupeByKey = (refs: ProjectCrossReference[]): ProjectCrossReference[] => {
  const byKey = new Map<string, ProjectCrossReference>();
  for (const ref of refs) {
    const existing = byKey.get(ref.key);
    if (
      !existing ||
      ref.projectCrossReferenceKeyValues.length > existing.projectCrossReferenceKeyValues.length
    ) {
      byKey.set(ref.key, ref);
    }
  }
  return Array.from(byKey.values());
};

/**
 * Flatten the grouped API response into the flat `Finding[]` the review UI
 * already renders. Duplicate keys are collapsed first. Tab assignment comes
 * from each finding's category, so the existing per-tab filtering/metrics keep
 * working unchanged.
 */
export const mapCrossReferenceGroupsToFindings = (
  groups: ProjectCrossReferenceGroup[] | undefined
): Finding[] =>
  dedupeByKey((groups ?? []).flatMap((group) => group.projectCrossReferences)).map(toFinding);
