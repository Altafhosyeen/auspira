'use client';

import React from 'react';
import { NoExtractedDataPanel } from '../shared/NoExtractedDataPanel';
import { DocumentSectionHeader } from '../shared/DocumentSectionHeader';
import { SourcePagesBar } from '../shared/SourcePagesBar';
import { ContractFunctionsSection } from './components/ContractFunctionsSection';
import { DataRowSection } from './components/DataRowSection';
import { EnvironmentNote } from './components/EnvironmentNote';
import { MetricsRow } from './components/MetricsRow';
import { ReferencedPlansSection } from './components/ReferencedPlansSection';
import { HsqeProvider, useHsqeCategory, useHsqeData } from './HsqeContext';

// --- SECTION 01: HEALTH & SAFETY --- own header, own style
function HealthSafetySection() {
  const category = useHsqeCategory('health_safety');
  const rows = category?.details ?? [];
  const title = category?.title ?? 'Health & Safety';

  if (rows.filter((row) => !!row.key).length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="01" title={title} />
      <DataRowSection rows={rows} />
    </section>
  );
}

// --- SECTION 02: PERMITS & CONTROLS --- own header, own style
function PermitsControlsSection() {
  const category = useHsqeCategory('permits_controls');
  const rows = category?.details ?? [];
  const title = category?.title ?? 'Permits & Controls';

  if (rows.filter((row) => !!row.key).length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="02" title={title} />
      <DataRowSection rows={rows} />
    </section>
  );
}

// --- SECTION 03: QUALITY — INSPECTION & TESTING --- own header, own style
function QualitySection() {
  const category = useHsqeCategory('quality');
  const rows = category?.details ?? [];
  const title = category?.title ?? 'Quality — Inspection & Testing';

  if (rows.filter((row) => !!row.key).length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="03" title={title} />
      <DataRowSection rows={rows} />
    </section>
  );
}

// --- SECTION 04: ENVIRONMENT --- own header, own style
function EnvironmentSection() {
  const category = useHsqeCategory('environment');
  const rows = category?.details ?? [];
  const title = category?.title ?? 'Environment';

  if (rows.filter((row) => !!row.key).length === 0) return null;

  return (
    <section>
      <DocumentSectionHeader number="04" title={title} />
      <DataRowSection
        rows={rows}
        footer={
          <EnvironmentNote expandedControls={category?.pollution_prevention_expanded_controls} />
        }
      />
    </section>
  );
}

function HSQEMetaPanelContent() {
  const { data } = useHsqeData();

  if (!data) return <NoExtractedDataPanel label="HSQE Requirements" />;

  return (
    <div className="min-h-full bg-white p-6 font-sans text-slate-800 lg:p-4">
      <div className="space-y-3">
        {/* SOURCE PAGES */}
        <SourcePagesBar sourcePages={data.summary?.sourcePages} />

        {/* TOP SUMMARY METRICS */}
        <MetricsRow />

        {/* SECTION 01: HEALTH & SAFETY */}
        <HealthSafetySection />

        {/* SECTION 02: PERMITS & CONTROLS */}
        <PermitsControlsSection />

        {/* SECTION 03: QUALITY — INSPECTION & TESTING */}
        <QualitySection />

        {/* SECTION 04: ENVIRONMENT */}
        <EnvironmentSection />

        {/* SECTION 05: WHAT THIS DOCUMENT DOES IN THE CONTRACT */}
        <ContractFunctionsSection />

        {/* SECTION 06: REFERENCED PLANS & PROCEDURES */}
        <ReferencedPlansSection />
      </div>
    </div>
  );
}

export default function HSQEMetaPanel() {
  return (
    <HsqeProvider>
      <HSQEMetaPanelContent />
    </HsqeProvider>
  );
}
