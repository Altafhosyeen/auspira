'use client';

import React from 'react';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { CONTRACT_DATA_PART_2_META } from './constants';
import ContractDataPartTwoMetaPanel from './ContractDataPartTwoMetaPanel';

// ==========================================
// CONTRACT DATA PART TWO DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewContractDataPart2() {
  return (
    <ApiDocumentReview meta={CONTRACT_DATA_PART_2_META}>
      <ContractDataPartTwoMetaPanel />
    </ApiDocumentReview>
  );
}
