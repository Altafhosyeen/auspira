'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { EmptyMetadataPanel } from '../shared/EmptyMetadataPanel';
import { buildGenericDocumentMeta } from './constants';
import { getDocumentLabel, getDocumentTypeName } from '@/lib/utils/document.type.code';

// ==========================================
// GENERIC DOCUMENT REVIEW PAGE
// Fallback for document types without a dedicated metadata panel.
// Reads ?type=<ContractDocumentType> to derive the document label.
// ==========================================
export default function ViewGenericDocument() {
  const searchParams = useSearchParams();
  const documentType = Number(searchParams.get('type')) || undefined;

  const label =
    (documentType && getDocumentLabel(documentType)) ||
    (documentType && getDocumentTypeName(documentType)) ||
    'Document';

  const meta = buildGenericDocumentMeta(label, documentType);

  return (
    <ApiDocumentReview meta={meta} hideMetadataPanel>
      <EmptyMetadataPanel label={label} />
    </ApiDocumentReview>
  );
}
