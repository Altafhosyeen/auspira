'use client';

import React from 'react';
import { NoExtractedDataPanel } from '../shared/NoExtractedDataPanel';
import { ExecutionSection } from './components/ExecutionSection';
import { MetricsRow } from './components/MetricsRow';
import { OptionsSection } from './components/OptionsSection';
import { PartiesSection } from './components/PartiesSection';
import { WorksSection } from './components/WorksSection';
import { FormOfAgreementProvider, useFoaData } from './FormOfAgreementContext';

function FormOfAgreementContent() {
  const { data } = useFoaData();

  if (!data) return <NoExtractedDataPanel label="Form of Agreement" />;

  return (
    <div className="min-h-full p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        <MetricsRow />
        <PartiesSection />
        <OptionsSection />
        <WorksSection />
        <ExecutionSection />
      </div>
    </div>
  );
}

export default function FormOfAgreementMetadataPanel() {
  return (
    <FormOfAgreementProvider>
      <FormOfAgreementContent />
    </FormOfAgreementProvider>
  );
}
