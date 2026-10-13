import React from 'react';
import { DeltaBanner } from './DeltaBanner';
import { StatsRow } from './StatsRow';
import { MovedActivitiesSection } from './MovedActivitiesSection';
import { AddedActivitiesSection } from './AddedActivitiesSection';
import { CriticalPathChangeSection } from './CriticalPathChangeSection';
import { HealthSection } from './HealthSection';
import type { ProgrammeComparison } from './types';

export const RevisedProgrammeView: React.FC<{ data: ProgrammeComparison }> = ({ data }) => (
  <>
    <DeltaBanner
      fromRevision={data.fromRevision}
      toRevision={data.toRevision}
      metrics={data.deltaMetrics}
    />
    <StatsRow stats={data.stats} />
    <MovedActivitiesSection
      rows={data.movedActivities}
      total={data.movedActivitiesTotal}
      baselineTotal={data.baselineActivitiesTotal}
    />
    <AddedActivitiesSection
      rows={data.addedActivities}
      total={data.addedActivitiesTotal}
      summary={data.addedActivitiesSummary}
    />
    <CriticalPathChangeSection counts={data.criticalPathChange} />
    <HealthSection alerts={data.healthAlerts} badge="auto-raised · for onboarding review" />
  </>
);

RevisedProgrammeView.displayName = 'RevisedProgrammeView';
