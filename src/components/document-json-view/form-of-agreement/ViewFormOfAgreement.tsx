'use client';

import React from 'react';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { FORM_OF_AGREEMENT_META } from './constants';
import FormOfAgreementMetadataPanel from './FormOfAgreementMetadataPanel';

// ==========================================
// FORM OF AGREEMENT DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewFormOfAgreement() {
  return (
    <ApiDocumentReview meta={FORM_OF_AGREEMENT_META}>
      <FormOfAgreementMetadataPanel />
    </ApiDocumentReview>
  );
}
