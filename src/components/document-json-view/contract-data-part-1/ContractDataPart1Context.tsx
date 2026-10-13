'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import { fixJsonEncoding } from '../shared/fixEncoding';
import type { Cd1JsonData } from './types';

// ── Context ───────────────────────────────────────────────────────────────────

interface Cd1ContextValue {
  data: Cd1JsonData | null;
  document: ApiDocumentRecord | null;
}

const Cd1Context = createContext<Cd1ContextValue>({ data: null, document: null });

export function useCd1Data() {
  return useContext(Cd1Context);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ContractDataPart1Provider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = (params?.id as string) || '';
  const projectId = searchParams?.get('projectId') || '';

  const { data: projectDocs } = useGetDocumentsByProjectId<ApiDocumentRecord[]>({
    id: projectId,
    enabled: !!projectId,
  });

  const document = useMemo<ApiDocumentRecord | null>(() => {
    if (!Array.isArray(projectDocs) || !documentId) return null;
    for (const doc of projectDocs) {
      if (String(doc.id) === documentId) return doc;
      const child = doc.children?.find((c) => String(c.id) === documentId);
      if (child) return child ?? null;
    }
    return null;
  }, [projectDocs, documentId]);

  const data = useMemo<Cd1JsonData | null>(() => {
    if (!document?.jsonData) return null;
    try {
      let parsed = JSON.parse(document.jsonData);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return fixJsonEncoding(parsed) as Cd1JsonData;
    } catch {
      return null;
    }
  }, [document]);

  return <Cd1Context.Provider value={{ data, document }}>{children}</Cd1Context.Provider>;
}
