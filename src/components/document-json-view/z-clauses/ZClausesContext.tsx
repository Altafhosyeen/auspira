'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import { fixJsonEncoding } from '../shared/fixEncoding';

// ── Exact JSON shape from the AI extraction ───────────────────────────────────

export interface ZcDocumentInfo {
  title?: string;
  subtitle?: string;
  contractForm?: string;
  reference?: string;
  agent?: string;
}

export interface ZcSummary {
  description?: string;
  totalClauses?: number;
  amendedClauses?: number;
  newConditions?: number;
  sourcePages?: string;
}

export interface ZcMetric {
  label: string;
  value: string | number;
}

export interface ZcClause {
  number: string;
  title: string;
  description: string;
  category: string;
  amendsClause?: string | null;
  reference?: string | null;
  page?: number | string | null;
  /** e.g. "LOW - defines treatment of early works payments". */
  impact?: string | null;
}

export interface ZcCategory {
  id: string;
  title: string;
  clauses: ZcClause[];
}

export interface ZcClauseDetail {
  page?: number | string | null;
  title: string;
  amendment?: string;
  description: string;
  reference?: string | null;
}

export interface ZcJsonData {
  document?: ZcDocumentInfo;
  summary?: ZcSummary;
  metrics?: ZcMetric[];
  categories?: ZcCategory[];
  clauseDetails?: Record<string, ZcClauseDetail>;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ZcContextValue {
  data: ZcJsonData | null;
  document: ApiDocumentRecord | null;
}

const ZcContext = createContext<ZcContextValue>({ data: null, document: null });

export function useZcData() {
  return useContext(ZcContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ZClausesProvider({ children }: { children: React.ReactNode }) {
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

  const data = useMemo<ZcJsonData | null>(() => {
    if (!document?.jsonData) return null;
    try {
      let parsed = JSON.parse(document.jsonData);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return fixJsonEncoding(parsed) as ZcJsonData;
    } catch {
      return null;
    }
  }, [document]);

  return <ZcContext.Provider value={{ data, document }}>{children}</ZcContext.Provider>;
}
