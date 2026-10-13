import { useMemo, useRef } from 'react';
import { useGetDocumentsByProjectId } from './project';
import { REQUIRED_DOCS, OPTIONAL_DOCS, OPTION_SPECIFIC_DOCS } from '@/constants/project.constants';
import { UploadedDocument } from '@/types/project/create.types';
import { parseBackendDate } from '@/lib/utils';
import type { SupportingDoc } from '@/components/module/project/first-step/SupportingDocumentsDrawer';

export const ALL_DOCS = [
  ...REQUIRED_DOCS,
  ...OPTIONAL_DOCS,
  ...Object.values(OPTION_SPECIFIC_DOCS).flat(),
];

const mapBackendDoc = (doc: any): UploadedDocument => ({
  id: doc.id,
  documentType: doc.documentType,
  title: doc.title || doc.name || '',
  filename: doc.fileName || doc.filename || '',
  uploaded: true,
  jsonData: doc.jsonData ?? null,
  isAIExtractionTriggered: doc.isAIExtractionTriggered ?? false,
});

interface UseProjectDocumentsOptions {
  projectId: string | undefined;
  // The documents query is shared (same query key) by every workflow step, all of which stay
  // mounted at once. If each installed its own `refetchInterval`, five observers would poll the
  // endpoint on staggered timers and React Query could not dedupe them — a rolling burst of
  // identical `/documents` requests. So only ONE always-mounted owner (ProjectWorkflow) sets
  // `poll: true`; every other caller just reads the shared, already-polled cache.
  poll?: boolean;
}

export function useProjectDocuments({ projectId, poll = false }: UseProjectDocumentsOptions) {
  // Wall-clock timestamp of when fast-polling started (first tick where extraction is pending).
  // Reset to null whenever polling isn't warranted, so a later re-entry into "pending extraction"
  // gets its own fresh fast-poll window. Mirrors the pattern in ExecuteStagContract's project poll.
  const pollStartedAtRef = useRef<number | null>(null);
  const POLL_TIMEOUT_MS = 30000;
  const BACKGROUND_POLL_MS = 40000;

  const {
    data: documentsData,
    refetch,
    isLoading,
  } = useGetDocumentsByProjectId(
    {
      id: projectId || '',
      enabled: !!projectId && projectId !== 'new',
      // Callers of this hook render their own local loading state (e.g. a <Spin>), so skip the
      // full-screen GlobalLoader overlay — otherwise both appear at once (double loader).
      skipLoader: true,
    },
    {
      // jsonData is extracted on the backend asynchronously once extraction is triggered. Poll
      // every 5s while any document whose extraction was triggered is still awaiting its jsonData
      // so the progress advances on its own; stop once those documents have it. Documents that
      // were merely uploaded (extraction not yet triggered) are ignored so we don't poll forever.
      // If extraction stalls/fails on the backend and jsonData never lands, fall back to a slow
      // background poll after a window instead of hammering the endpoint every 5s forever.
      refetchInterval: !poll
        ? undefined
        : (query) => {
            const data = query.state.data;
            if (!Array.isArray(data)) {
              pollStartedAtRef.current = null;
              return false;
            }
            const pendingExtraction = (data as any[]).some(
              (doc) => !doc.parentId && doc.isAIExtractionTriggered && !doc.jsonData
            );
            if (!pendingExtraction) {
              pollStartedAtRef.current = null;
              return false;
            }
            if (pollStartedAtRef.current == null) pollStartedAtRef.current = Date.now();
            const elapsed = Date.now() - pollStartedAtRef.current;
            return elapsed >= POLL_TIMEOUT_MS ? BACKGROUND_POLL_MS : 5000;
          },
    }
  );

  const { uploadedMap, uploadedDocuments, rawDocsMap } = useMemo(() => {
    if (!Array.isArray(documentsData)) {
      return {
        uploadedMap: {} as Record<string, boolean>,
        uploadedDocuments: [] as UploadedDocument[],
        rawDocsMap: new Map<string, any>(),
      };
    }
    const map: Record<string, boolean> = {};
    const rawMap = new Map<string, any>();
    const docs: UploadedDocument[] = (documentsData as any[])
      .filter((doc) => !doc.parentId)
      .map((doc) => {
        const key = doc.documentType !== undefined ? String(doc.documentType) : String(doc.id);
        map[key] = true;
        rawMap.set(key, doc);
        return mapBackendDoc(doc);
      });
    return { uploadedMap: map, uploadedDocuments: docs, rawDocsMap: rawMap };
  }, [documentsData]);

  const supportingDocsMap = useMemo((): Record<string, SupportingDoc[]> => {
    if (!Array.isArray(documentsData)) return {};
    const result: Record<string, SupportingDoc[]> = {};
    (documentsData as any[])
      .filter((doc) => !doc.parentId && Array.isArray(doc.children) && doc.children.length > 0)
      .forEach((doc) => {
        result[String(doc.documentType)] = doc.children.map((child: any) => ({
          id: child.id,
          filename: child.fileName || child.filename || '',
          title: child.title || child.name || child.fileName || '',
          size: child.fileSize ? `${(child.fileSize / 1024 / 1024).toFixed(1)} MB` : undefined,
          addedOn: parseBackendDate(child.createdOn)?.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        }));
      });
    return result;
  }, [documentsData]);

  const supportingDocsCountMap = useMemo(
    () => Object.fromEntries(Object.entries(supportingDocsMap).map(([k, v]) => [k, v.length])),
    [supportingDocsMap]
  );

  const allDocLabels = useMemo(() => {
    const map: Record<string, string> = {};
    ALL_DOCS.forEach((d) => {
      map[String(d.id)] = d.label;
    });
    return map;
  }, []);

  return {
    documentsData,
    isLoading,
    refetch,
    uploadedMap,
    uploadedDocuments,
    rawDocsMap,
    supportingDocsMap,
    supportingDocsCountMap,
    allDocLabels,
  };
}
