'use client';

import React, { createContext, use, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import { fixJsonEncoding } from '../shared/fixEncoding';
import type { HsqeCategory, HsqeJsonData } from './types';

// ── Context ───────────────────────────────────────────────────────────────────

interface HsqeContextValue {
  data: HsqeJsonData | null;
  document: ApiDocumentRecord | null;
}

const HsqeContext = createContext<HsqeContextValue>({ data: null, document: null });

export function useHsqeData() {
  return use(HsqeContext);
}

/** Looks up a single category by id from the parsed JSON (undefined when no real data is present). */
export function useHsqeCategory(id: string): HsqeCategory | undefined {
  const { data } = useHsqeData();
  return data?.categories?.find((category) => category.id === id);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function HsqeProvider({ children }: { children: React.ReactNode }) {
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

  const data = useMemo<HsqeJsonData | null>(() => {
    if (!document?.jsonData) return null;
    try {
      let parsed = JSON.parse(document.jsonData);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return fixJsonEncoding(parsed) as HsqeJsonData;
    } catch {
      return null;
    }
  }, [document]);

  return <HsqeContext value={{ data, document }}>{children}</HsqeContext>;
}
