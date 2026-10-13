'use client';

import React from 'react';
import { ApiDocumentReview } from './shared/ApiDocumentReview';
import { JsonMetadataPanel } from './view-scope-document/JsonMetadataPanel';
import { SCOPE_DOCUMENT_META } from './view-scope-document/constants';
import { ScopeDocumentProvider } from './view-scope-document/ViewScopeDocumentContext';

// ==========================================
// SCOPE OF WORKS DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewScopeDocument() {
  return (
    <ScopeDocumentProvider>
      <ApiDocumentReview meta={SCOPE_DOCUMENT_META}>
        <JsonMetadataPanel />
      </ApiDocumentReview>
    </ScopeDocumentProvider>
  );
}
