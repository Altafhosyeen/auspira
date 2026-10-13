'use client';

import React from 'react';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { CONTRACT_DATA_PART_1_META } from './constants';
import ContractDataPartOneMetaPanel from './ContractDataPartOneMetaPanel';

// ==========================================
// CONTRACT DATA PART ONE DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewContractDataPart1() {
  return (
    <ApiDocumentReview meta={CONTRACT_DATA_PART_1_META}>
      <ContractDataPartOneMetaPanel />
    </ApiDocumentReview>
  );
}
