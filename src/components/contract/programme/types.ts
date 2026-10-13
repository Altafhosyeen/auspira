export type ProgrammeVariant = 'accepted' | 'revised';

export interface KeyDateRow {
  label: string;
  value: string;
  citation: string;
}

export interface CriticalPathRow {
  activityId: string;
  name: string;
  finish: string;
  totalFloat: string;
}

export interface ProgressRow {
  label: string;
  value: string;
  valueAccent?: string;
  citation: string;
}

export type HealthSeverity = 'critical' | 'warning';

export interface HealthAlert {
  severity: HealthSeverity;
  title: string;
  description: string;
  citation: string;
}

export interface StatCard {
  label: string;
  value: string;
  note?: string;
  noteAccent?: boolean;
}

export interface ProgrammeData {
  stats: StatCard[];
  keyDates: KeyDateRow[];
  criticalPath: CriticalPathRow[];
  progress: ProgressRow[];
  healthAlerts: HealthAlert[];
}

export interface DeltaMetric {
  label: string;
  value: string;
  note: string;
  accent?: 'rose' | 'amber';
}

export interface MovedActivityRow {
  activityId: string;
  name: string;
  accepted: string;
  revised: string;
  shift: string;
}

export interface AddedActivityRow {
  activityId: string;
  name: string;
  type: string;
  typeAccent?: 'amber' | 'slate';
}

export interface CriticalPathChangeCount {
  count: number;
  note: string;
  citation: string;
}

export interface CriticalPathChangeCounts {
  newlyCritical: CriticalPathChangeCount;
  stillCritical: CriticalPathChangeCount;
  noLongerCritical: CriticalPathChangeCount;
}

export interface ProgrammeComparison {
  fromRevision: string;
  toRevision: string;
  deltaMetrics: DeltaMetric[];
  stats: StatCard[];
  movedActivities: MovedActivityRow[];
  movedActivitiesTotal: number;
  baselineActivitiesTotal: number;
  addedActivities: AddedActivityRow[];
  addedActivitiesTotal: number;
  addedActivitiesSummary: string;
  criticalPathChange: CriticalPathChangeCounts;
  healthAlerts: HealthAlert[];
}
