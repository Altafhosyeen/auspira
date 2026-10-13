import React from 'react';
import { StatsRow } from './StatsRow';
import { KeyDatesSection } from './KeyDatesSection';
import { CriticalPathSection } from './CriticalPathSection';
import { ProgressSection } from './ProgressSection';
import { HealthSection } from './HealthSection';
import type { ProgrammeData } from './types';

export const AcceptedProgrammeView: React.FC<{ data: ProgrammeData }> = ({ data }) => (
  <>
    <StatsRow stats={data.stats} />
    <KeyDatesSection rows={data.keyDates} />
    <CriticalPathSection rows={data.criticalPath} />
    <ProgressSection rows={data.progress} />
    <HealthSection alerts={data.healthAlerts} />
  </>
);

AcceptedProgrammeView.displayName = 'AcceptedProgrammeView';
