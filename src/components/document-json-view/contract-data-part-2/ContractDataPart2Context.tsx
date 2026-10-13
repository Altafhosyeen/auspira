'use client';

import React, { createContext, use, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import { fixJsonEncoding } from '../shared/fixEncoding';
import type { Cd2Category, Cd2JsonData } from './types';

// ── Context ───────────────────────────────────────────────────────────────────

interface Cd2ContextValue {
  data: Cd2JsonData | null;
  document: ApiDocumentRecord | null;
}

const Cd2Context = createContext<Cd2ContextValue>({ data: null, document: null });

export function useCd2Data() {
  return use(Cd2Context);
}

/** Looks up a single category by id from the parsed JSON (undefined when no real data is present). */
export function useCd2Category(id: string): Cd2Category | undefined {
  const { data } = useCd2Data();
  return data?.categories?.find((category) => category.id === id);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ContractDataPart2Provider({ children }: { children: React.ReactNode }) {
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

  const data = useMemo<Cd2JsonData | null>(() => {
    if (!document?.jsonData) return null;
    try {
      let parsed = JSON.parse(document.jsonData);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return fixJsonEncoding(parsed) as Cd2JsonData;
    } catch {
      return null;
    }
  }, [document]);

  return <Cd2Context value={{ data, document }}>{children}</Cd2Context>;
}
