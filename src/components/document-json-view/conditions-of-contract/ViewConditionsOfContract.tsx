'use client';

import React from 'react';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { CONDITIONS_OF_CONTRACT_META } from './constants';
import ViewConditionsOfContractMetaPanel from './ViewConditionsOfContractMetaPanel';

// ==========================================
// CONDITIONS OF CONTRACT DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewConditionsOfContract() {
  return (
    <ApiDocumentReview meta={CONDITIONS_OF_CONTRACT_META}>
      <ViewConditionsOfContractMetaPanel />
    </ApiDocumentReview>
  );
}
