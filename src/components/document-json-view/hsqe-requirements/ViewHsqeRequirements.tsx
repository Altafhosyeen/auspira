'use client';

import React from 'react';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { HSQE_REQUIREMENTS_META } from './constants';
import HSQEMetaPanel from './HSQEMetaPanel';

// ==========================================
// HSQE REQUIREMENTS DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewHsqeRequirements() {
  return (
    <ApiDocumentReview meta={HSQE_REQUIREMENTS_META}>
      <HSQEMetaPanel />
    </ApiDocumentReview>
  );
}
