import React from 'react';
import { StatsSection } from './StatsSection';
import { KeyDatesSection } from './KeyDatesSection';
import { CriticalPathSection } from './CriticalPathSection';
import { ProgressSection } from './ProgressSection';
import { HealthSection } from './HealthSection';
import { ExtractedValuesSection } from './ExtractedValuesSection';
import { ProgrammeMetaHeader } from './ProgrammeMetaHeader';
import { ComparisonSection } from './ComparisonSection';
import { AccordionProvider } from './SectionCard';
import type { ProgrammeData } from './types';

export const ProgrammePostUploadPanels: React.FC<{ data: ProgrammeData }> = ({ data }) => (
  <div className="animate-[fadeIn_0.3s_ease] space-y-1!">
    <ProgrammeMetaHeader meta={data.meta} />
    {/* Accordion: opening one panel closes the others. */}
    <AccordionProvider>
      <StatsSection stats={data.stats} />
      <KeyDatesSection rows={data.keyDates} />
      <CriticalPathSection rows={data.criticalPath} />
      <ProgressSection rows={data.progress} />
      <HealthSection alerts={data.healthAlerts} />
      <ComparisonSection comparison={data.comparison} />
      <ExtractedValuesSection rows={data.extractedValues} />
    </AccordionProvider>
  </div>
);

ProgrammePostUploadPanels.displayName = 'ProgrammePostUploadPanels';
