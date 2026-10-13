'use client';

import React, { createContext, use, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetDocumentsByProjectId } from '@/hooks/modules/project';
import type { ApiDocumentRecord } from '../shared/ApiDocumentReview';
import { fixJsonEncoding } from '../shared/fixEncoding';

// ── Exact JSON shape from the AI extraction ───────────────────────────────────

export interface FoaDetail {
  label: string;
  value: string | string[];
  description?: string;
  status?: string;
  page?: number | string | null;
  reference?: string;
}

export interface FoaComponentDocument {
  title: string;
  description?: string;
  section?: string;
  page?: number | string | null;
  reference?: string;
}

export interface FoaCategory {
  id: string;
  title: string;
  details: FoaDetail[];
  componentDocuments?: FoaComponentDocument[];
}

export interface FoaMetric {
  label: string;
  value: string;
}

export interface FoaJsonData {
  document?: {
    title?: string;
    subtitle?: string;
    contractForm?: string;
    reference?: string;
    status?: string;
  };
  summary?: {
    description?: string;
    sourcePages?: string;
  };
  metrics?: FoaMetric[];
  categories?: FoaCategory[];
}

// ── Convenience accessors ─────────────────────────────────────────────────────

export function getCategory(data: FoaJsonData | null, id: string): FoaCategory | undefined {
  return data?.categories?.find((c) => c.id === id);
}

export function getDetail(cat: FoaCategory | undefined, label: string): FoaDetail | undefined {
  return cat?.details.find((d) => d.label.toLowerCase() === label.toLowerCase());
}

export function detailValue(cat: FoaCategory | undefined, label: string): string {
  const v = getDetail(cat, label)?.value;
  if (!v) return '';
  return Array.isArray(v) ? v.join(', ') : v;
}

export function detailArray(cat: FoaCategory | undefined, label: string): string[] {
  const v = getDetail(cat, label)?.value;
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/** Builds a "Clause 3 · p3" style ref-tag from a detail's reference/page, falling back when neither is present. */
export function detailRefTag(
  detail: { reference?: string; page?: number | string | null } | undefined,
  fallback: string
): { text: string; page: number | undefined } {
  const pageNum = detail?.page != null ? Number(detail.page) : undefined;
  const validPage = pageNum != null && Number.isFinite(pageNum) ? pageNum : undefined;
  if (!detail?.reference && validPage == null) return { text: fallback, page: undefined };
  const text = [detail?.reference, validPage != null ? `p${validPage}` : null]
    .filter(Boolean)
    .join(' · ');
  return { text: text || fallback, page: validPage };
}

// ── Context ───────────────────────────────────────────────────────────────────

interface FoaContextValue {
  data: FoaJsonData | null;
  document: ApiDocumentRecord | null;
}

const FoaContext = createContext<FoaContextValue>({ data: null, document: null });

export function useFoaData() {
  return use(FoaContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function FormOfAgreementProvider({ children }: { children: React.ReactNode }) {
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

  const data = useMemo<FoaJsonData | null>(() => {
    if (!document?.jsonData) return null;
    try {
      let parsed = JSON.parse(document.jsonData);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return fixJsonEncoding(parsed) as FoaJsonData;
    } catch {
      return null;
    }
  }, [document]);

  return <FoaContext value={{ data, document }}>{children}</FoaContext>;
}
