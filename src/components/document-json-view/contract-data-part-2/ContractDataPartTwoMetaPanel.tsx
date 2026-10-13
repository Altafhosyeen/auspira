'use client';

import React from 'react';
import { NoExtractedDataPanel } from '../shared/NoExtractedDataPanel';
import { ContractDataPart2Provider, useCd2Data } from './ContractDataPart2Context';
import { ContractorIdentitySection } from './components/ContractorIdentitySection';
import { KeyPeopleSection } from './components/KeyPeopleSection';
import { MetricsRow } from './components/MetricsRow';
import { PriceSection } from './components/PriceSection';
import { ReferencedDocumentsSection } from './components/ReferencedDocumentsSection';
import { TimeAndResourcesSection } from './components/TimeAndResourcesSection';

function ContractDataPartTwoContent() {
  const { data } = useCd2Data();

  if (!data) return <NoExtractedDataPanel label="Contract Data Part 2" />;

  return (
    <div className="min-h-full p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        {/* TOP SUMMARY METRICS */}
        <MetricsRow />

        {/* SECTION 01: CONTRACTOR IDENTITY */}
        <ContractorIdentitySection />

        {/* SECTION 02: KEY PEOPLE */}
        <KeyPeopleSection />

        {/* SECTION 03: PRICE */}
        <PriceSection />

        {/* SECTION 04: REFERENCED DOCUMENTS */}
        <ReferencedDocumentsSection />

        {/* SECTION 05: TIME & RESOURCES (JSON-only) */}
        <TimeAndResourcesSection />

        {/* SECTION 06: CROSS-DOCUMENT DISAGREEMENT DEMO (JSON-only) */}
        {/* <DisagreementDemoSection /> */}
      </div>
    </div>
  );
}

export default function ContractDataPartTwoMetaPanel() {
  return (
    <ContractDataPart2Provider>
      <ContractDataPartTwoContent />
    </ContractDataPart2Provider>
  );
}
