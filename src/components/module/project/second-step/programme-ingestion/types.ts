export interface StatRow {
  label: string;
  value: string;
  note?: string;
  noteAccent?: boolean;
}

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

// A contract data-point extracted from the programme, shown only when it has a value.
export interface ExtractedValueRow {
  label: string;
  value: string;
  page: number | null;
  reference: string | null;
}

// Programme identity/meta shown in the panel header. Blank fields are hidden.
export interface ProgrammeMeta {
  name: string;
  type: string;
  programmeId: string;
  revision: string;
  status: string;
}

// Baseline-comparison summary. Rendered only when the backend enables comparison.
export interface ComparisonSummary {
  enabled: boolean;
  completionDeltaDays: number;
  criticalPathDelta: number;
  activitiesAdded: number;
  activitiesRemoved: number;
  activitiesMoved: number;
}

// The `jsonData` payload returned by the primavera-comparison endpoint for a single programme.
export interface ProgrammeJsonData {
  meta: ProgrammeMeta;
  stats: StatRow[];
  keyDates: KeyDateRow[];
  criticalPath: CriticalPathRow[];
  progress: ProgressRow[];
  healthAlerts: HealthAlert[];
  extractedValues: ExtractedValueRow[];
  comparison: ComparisonSummary | null;
}

export interface ProgrammeData extends ProgrammeJsonData {
  name: string;
}

/* ------------------------------------------------------------------ */
/* Raw API shape — GET /api/project-documents/{id}/primavera-comparison */
/* (acceptedProgramme.jsonData). Mapped to `ProgrammeJsonData` for UI. */
/* ------------------------------------------------------------------ */

export interface ApiSectionalKeyDate {
  name: string;
  date: string;
  reference: string;
  /** The backend's own status for the section — `completed`, `pending`, ... Absent on older extracts. */
  status?: string | null;
}

export interface ApiCriticalPathActivity {
  activityId: string;
  activityName: string;
  finishDate: string;
  totalFloatDays: number;
  isDriving: boolean;
}

export interface ApiProgrammeHealth {
  severity: string;
  title: string;
  description: string;
  references: string[];
}

export interface ApiProjectKeyValue {
  value: string | null;
  page: number | null;
  reference: string | null;
}

export interface ApiProgrammeHeader {
  class: string;
  submissionNumber: number;
  baselineReference: string;
  description: string;
}

export interface ApiProgrammeAiHealthCheck {
  title?: string | null;
  flagCount?: number | null;
  checks?: Record<string, unknown>[] | null;
}

export interface ApiProgrammeObligation {
  description?: string | null;
  clauseNumber?: string | null;
  owner?: string | null;
  dueDate?: string | null;
}

export interface ApiProgrammeObligationSection {
  title?: string | null;
  obligations?: ApiProgrammeObligation[] | null;
}

export interface ApiProgrammeObligations {
  title?: string | null;
  summary?: string | null;
  clauses?: string[] | null;
  sections?: ApiProgrammeObligationSection[] | null;
}

export interface ApiProgrammeVarianceValue {
  days?: number | null;
  display?: string | null;
}

export interface ApiProgrammeVariance {
  title?: string | null;
  clauses?: string[] | null;
  summary?: string | null;
  programmeStatus?: string | null;
  dates?: {
    completionDate?: string | null;
    plannedCompletion?: string | null;
    variance?: ApiProgrammeVarianceValue | null;
  } | null;
  terminalFloat?: {
    days?: number | null;
    display?: string | null;
    owner?: string | null;
    note?: string | null;
  } | null;
  rows?: Record<string, unknown>[] | null;
}

export interface ApiComparison {
  enabled: boolean;
  /** The accepted programme this revision was measured against — blank while none is set. */
  baseline?: {
    programmeId: string;
    revision: string;
    dataDate: string;
    plannedCompletion: string;
  };
  changeSummary: {
    completionDeltaDays: number;
    criticalPathDelta: number;
    activitiesAdded: number;
    activitiesRemoved: number;
    activitiesMoved: number;
  };
  movedActivities?: unknown[];
  addedActivities?: unknown[];
  removedActivities?: unknown[];
  criticalPathChange?: {
    newlyCritical?: unknown[];
    stillCritical?: unknown[];
    noLongerCritical?: unknown[];
  } | null;
  reconciliation?: unknown[] | null;
}

export interface ApiProgrammeJsonData {
  programmeId: string;
  programmeName: string;
  programmeType: string;
  revision: string;
  status: string;
  header?: ApiProgrammeHeader | null;
  overview: {
    dataDate: string;
    plannedCompletion: string;
    criticalActivities: { count: number; description: string };
    activities: { count: number; description: string };
  };
  keyDatesAndMilestones: {
    startingDate: string;
    contractAwardSubmissionDate: string;
    accessDate: string;
    plannedCompletion: string;
    sectionalKeyDates: ApiSectionalKeyDate[];
  };
  criticalPath: ApiCriticalPathActivity[];
  progressAndResources: {
    activitiesComplete: { completed: number; total: number; percentage: number };
    inProgress: number;
    notStarted: number;
    calendars: { name: string; count: number }[];
    dateConstraints: { total: number; constraints: { type: string; count: number }[] };
  };
  programmeHealth: ApiProgrammeHealth[];
  aiProgrammeHealthCheck?: ApiProgrammeAiHealthCheck | null;
  variance?: ApiProgrammeVariance | null;
  obligations?: ApiProgrammeObligations | null;
  comparison?: ApiComparison;
  ProjectKeyValues?: Record<string, ApiProjectKeyValue>;
}

/** Primavera-comparison response as actually returned by the backend. */
export interface ApiPrimaveraComparison {
  projectId: string;
  acceptedProgramme: {
    documentId: string;
    fileName: string;
    version: number;
    uploadedAt: string;
    jsonData: ApiProgrammeJsonData;
  } | null;
  revisedProgramme: unknown | null;
}
