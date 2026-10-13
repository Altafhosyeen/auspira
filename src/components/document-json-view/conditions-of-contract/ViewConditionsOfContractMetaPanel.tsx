'use client';

import React from 'react';
import { SourcePagesBar } from '../shared/SourcePagesBar';
import { ConditionsOfContractProvider, useCocData } from './ConditionsOfContractContext';
import { ClauseMapSection } from './components/ClauseMapSection';
import { DeparturesSection } from './components/DeparturesSection';
import { EditionSection } from './components/EditionSection';
import { MetricsRow } from './components/MetricsRow';
import { OptionsSection } from './components/OptionsSection';

function CocContent() {
  const { data } = useCocData();
  return (
    <div className="min-h-full p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        {/* SOURCE PAGES */}
        <SourcePagesBar sourcePages={data?.summary?.sourcePages} />

        {/* TOP SUMMARY METRICS */}
        <MetricsRow />

        {/* SECTION 01: EDITION & AMENDMENTS */}
        <EditionSection />

        {/* SECTION 02: OPTION CLAUSES BOUND IN */}
        <OptionsSection />

        {/* SECTION 03: CLAUSE MAP — THE NINE CORE SECTIONS */}
        <ClauseMapSection />

        {/* SECTION 04: DEPARTURES FROM THE PUBLISHED TEXT */}
        <DeparturesSection />
      </div>
    </div>
  );
}

export default function ViewConditionsOfContractMetaPanel() {
  return (
    <ConditionsOfContractProvider>
      <CocContent />
    </ConditionsOfContractProvider>
  );
}
