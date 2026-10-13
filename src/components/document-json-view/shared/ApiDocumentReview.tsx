'use client';

import { Spin } from 'antd';
import { useParams, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useMemo } from 'react';
import { useGetDocumentJson, useGetDocumentsByProjectId } from '@/hooks/modules/project';
import { displayFileName, parseBackendDate } from '@/lib/utils';
import { DocumentReviewLayout } from './DocumentReviewLayout';
import type { DocumentMeta } from './types';

// ==========================================
// API DOCUMENT RECORD — shape returned by
// GET /api/project-documents/{projectId}/documents (and children entries)
// ==========================================
export interface ApiDocumentRecord {
  id: string;
  projectId: string;
  parentId: string | null;
  documentType: number;
  fileName: string | null;
  fileExtension: string | null;
  filePath: string | null;
  uploadedAt: string | null;
  jsonData: string | null;
  version: number | null;
  comments: string | null;
  status: number | null;
  createdOn: string | null;
  children?: ApiDocumentRecord[] | null;
}

const formatDate = (iso?: string | null) =>
  parseBackendDate(iso)?.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) ?? '';

/** Find a document (main or supporting/child) by id in the project documents list. */
const findDocument = (
  docs: ApiDocumentRecord[] | undefined,
  documentId: string
): ApiDocumentRecord | undefined => {
  if (!Array.isArray(docs) || !documentId) return undefined;
  for (const doc of docs) {
    if (String(doc.id) === documentId) return doc;
    const child = doc.children?.find((c) => String(c.id) === documentId);
    if (child) return child;
  }
  return undefined;
};

/** Overlay the real document fields from the API onto the static page meta. */
const mergeMeta = (base: DocumentMeta, doc?: ApiDocumentRecord | null): DocumentMeta => {
  if (!doc) return base;
  const revision = doc.version ? `Version ${doc.version}` : base.revision;
  const fileName = displayFileName(doc.fileName);
  return {
    ...base,
    title: fileName || base.title,
    subtitle: `${base.documentType.toUpperCase()} | ${revision.toUpperCase()}`,
    revision,
    date: formatDate(doc.uploadedAt) || base.date,
    documentTitle: fileName || base.documentTitle,
    fileUrl: doc.filePath || base.fileUrl,
  };
};

export interface ApiDocumentReviewProps {
  /** Static per-document-type meta used as a fallback for fields the API does not provide */
  meta: DocumentMeta;
  /** The document-type-specific metadata panel rendered in the left pane */
  children: React.ReactNode;
  /** Force-hide the metadata panel regardless of document type */
  hideMetadataPanel?: boolean;
}

// ==========================================
// API-DRIVEN DOCUMENT REVIEW
// Resolves the real document for the [id] route param — primarily from the
// project documents list (?projectId=... query param, cached from the upload
// step), falling back to the document json endpoint — and renders the shared
// review layout with the actual file (blob SAS URL) + metadata.
// ==========================================
export function ApiDocumentReview({
  meta,
  children,
  hideMetadataPanel: forceHide,
}: ApiDocumentReviewProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = (params?.id as string) || '';
  const projectId = searchParams?.get('projectId') || '';

  const { data: projectDocs, isLoading: isListLoading } = useGetDocumentsByProjectId<
    ApiDocumentRecord[]
  >({ id: projectId, enabled: !!projectId, skipLoader: true });

  // Fallback when navigated without ?projectId — the empty documentId disables the query
  const { data: jsonDoc, isLoading: isJsonLoading } = useGetDocumentJson<ApiDocumentRecord>({
    documentId: projectId ? '' : documentId,
  });

  const document = useMemo(
    () =>
      findDocument(projectDocs, documentId) ?? (jsonDoc && jsonDoc.filePath ? jsonDoc : undefined),
    [projectDocs, jsonDoc, documentId]
  );

  const mergedMeta = useMemo(() => mergeMeta(meta, document), [meta, document]);

  const isLoading = projectId ? isListLoading : isJsonLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <Spin size="large" />
      </div>
    );
  }

  // Supporting (child) documents have no document-type-specific metadata panel —
  // show the file full-width instead of the generic parent-type panel.
  const isSupportingDocument = !!document?.parentId;

  return (
    <DocumentReviewLayout meta={mergedMeta} hideMetadataPanel={forceHide ?? isSupportingDocument}>
      {children}
    </DocumentReviewLayout>
  );
}
