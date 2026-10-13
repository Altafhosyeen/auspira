'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import { fixJsonEncoding } from '../shared/fixEncoding';
import type { SiteInfoJsonData } from './types';

// ── Context ───────────────────────────────────────────────────────────────────

interface SiteInformationContextValue {
  data: SiteInfoJsonData | null;
  document: ApiDocumentRecord | null;
}

const SiteInformationContext = createContext<SiteInformationContextValue>({
  data: null,
  document: null,
});

export function useSiteInformationData() {
  return useContext(SiteInformationContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function SiteInformationProvider({ children }: { children: React.ReactNode }) {
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

  const data = useMemo<SiteInfoJsonData | null>(() => {
    if (!document?.jsonData) return null;
    try {
      let parsed = JSON.parse(document.jsonData);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return fixJsonEncoding(parsed) as SiteInfoJsonData;
    } catch {
      return null;
    }
  }, [document]);

  return (
    <SiteInformationContext.Provider value={{ data, document }}>
      {children}
    </SiteInformationContext.Provider>
  );
}
