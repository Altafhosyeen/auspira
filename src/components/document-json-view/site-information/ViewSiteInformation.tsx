'use client';

import React from 'react';
import { ApiDocumentReview } from '../shared/ApiDocumentReview';
import { SITE_INFORMATION_META } from './constants';
import SiteInformationMetadataDashboard from './SiteInformationOfContractMetaPanel';
import { SiteInformationProvider } from './SiteInformationContext';

// ==========================================
// SITE INFORMATION DOCUMENT REVIEW PAGE
// ==========================================
export default function ViewSiteInformation() {
  return (
    <SiteInformationProvider>
      <ApiDocumentReview meta={SITE_INFORMATION_META}>
        <SiteInformationMetadataDashboard />
      </ApiDocumentReview>
    </SiteInformationProvider>
  );
}
