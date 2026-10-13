'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import { fixJsonEncoding } from '../shared/fixEncoding';

// ── Exact JSON shape from the AI extraction ───────────────────────────────────

export interface CocDocumentInfo {
  title?: string;
  subtitle?: string;
  project?: string;
  reference?: string;
  form?: string;
  edition?: string;
}

export interface CocMetric {
  label: string;
  value: string;
}

export interface CocEditionAmendment {
  page?: number | string | null;
  label: string;
  value: string;
  status?: string;
  note?: string;
}

export interface CocMainOption {
  page?: number | string | null;
  value: string;
  description?: string;
  status?: string;
}

export interface CocDisputesOption {
  page?: number | string | null;
  value: string;
  status?: string;
}

export interface CocSecondaryOptions {
  page?: number | string | null;
  values: string[];
}

export interface CocOptionClauses {
  main_option?: CocMainOption;
  disputes_option?: CocDisputesOption;
  secondary_options?: CocSecondaryOptions;
}

export interface CocClauseMapRow {
  section: number;
  page?: number | string | null;
  name: string;
  clauses: string;
  summary?: string;
  status?: string;
}

export interface CocZClauses {
  page?: number | string | null;
  range?: string;
  status?: string;
  description?: string;
}

export interface CocDepartures {
  page?: number | string | null;
  inline_amendments?: string;
  note?: string;
  z_clauses?: CocZClauses;
}

export interface CocUiBehaviour {
  cite_click?: string;
  more_button?: string;
  toast?: string;
  scroll?: string;
}

export interface CocSummary {
  description?: string;
  sourcePages?: string;
}

export interface CocJsonData {
  document?: CocDocumentInfo;
  summary?: CocSummary;
  metrics?: CocMetric[];
  edition_and_amendments?: CocEditionAmendment[];
  option_clauses?: CocOptionClauses;
  clause_map?: CocClauseMapRow[];
  departures?: CocDepartures;
  ui_behaviour?: CocUiBehaviour;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CocContextValue {
  data: CocJsonData | null;
  document: ApiDocumentRecord | null;
}

const CocContext = createContext<CocContextValue>({ data: null, document: null });

export function useCocData() {
  return useContext(CocContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ConditionsOfContractProvider({ children }: { children: React.ReactNode }) {
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

  const data = useMemo<CocJsonData | null>(() => {
    if (!document?.jsonData) return null;
    try {
      let parsed = JSON.parse(document.jsonData);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return fixJsonEncoding(parsed) as CocJsonData;
    } catch {
      return null;
    }
  }, [document]);

  return <CocContext.Provider value={{ data, document }}>{children}</CocContext.Provider>;
}
