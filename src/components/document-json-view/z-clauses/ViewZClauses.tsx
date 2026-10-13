'use client';

import React from 'react';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { Z_CLAUSES_META } from './constants';
import ViewZClauseOfContractMetaPanel from './ViewZClauseOfContractMetaPanel';

// ==========================================
// Z-CLAUSES / AMENDMENTS DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewZClauses() {
  return (
    <ApiDocumentReview meta={Z_CLAUSES_META}>
      <ViewZClauseOfContractMetaPanel />
    </ApiDocumentReview>
  );
}
