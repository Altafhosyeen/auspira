import { parseBackendDate } from '@/lib/utils';
import type {
  ApiProgrammeJsonData,
  ComparisonSummary,
  CriticalPathRow,
  ExtractedValueRow,
  HealthAlert,
  KeyDateRow,
  ProgrammeJsonData,
  ProgrammeMeta,
  ProgressRow,
  StatRow,
} from './types';

// Acronyms that should stay upper-cased when humanising a snake_case key.
const ACRONYMS: Record<string, string> = { boq: 'BOQ' };

/** "employer_client_entity_name" → "Employer client entity name". */
const humanizeKey = (key: string): string => {
  const words = key.split('_').map((w) => ACRONYMS[w] ?? w);
  const [first, ...rest] = words;
  const lead = ACRONYMS[first] ? first : first.charAt(0).toUpperCase() + first.slice(1);
  return [lead, ...rest].join(' ');
};

/** Format an ISO date (YYYY-MM-DD) as "19 Sep 2025"; blank/invalid values pass through as "—". */
const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = parseBackendDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const toMeta = (json: ApiProgrammeJsonData): ProgrammeMeta => ({
  name: json.programmeName ?? '',
  type: json.programmeType ?? '',
  programmeId: json.programmeId ?? '',
  revision: json.revision ?? '',
  status: json.status ?? '',
});

const toStats = (json: ApiProgrammeJsonData): StatRow[] => {
  // The backend can omit whole sections, so guard every nested access.
  const overview = json.overview;
  const kd = json.keyDatesAndMilestones;
  const stats: StatRow[] = [];

  if (overview?.dataDate) stats.push({ label: 'Data Date', value: formatDate(overview.dataDate) });
  if (kd?.startingDate) stats.push({ label: 'Starting Date', value: formatDate(kd.startingDate) });
  if (overview?.plannedCompletion) {
    stats.push({ label: 'Planned Completion', value: formatDate(overview.plannedCompletion) });
  }
  if (overview?.criticalActivities) {
    stats.push({
      label: 'Critical Activities',
      value: String(overview.criticalActivities.count),
      note: overview.criticalActivities.description,
      noteAccent: overview.criticalActivities.count > 0,
    });
  }
  if (overview?.activities) {
    stats.push({
      label: 'Total Activities',
      value: String(overview.activities.count),
      note: overview.activities.description,
    });
  }
  // Only surface the optional access / contract-award dates when the backend provides them.
  if (kd?.contractAwardSubmissionDate) {
    stats.push({ label: 'Contract Award', value: formatDate(kd.contractAwardSubmissionDate) });
  }
  if (kd?.accessDate) {
    stats.push({ label: 'Access Date', value: formatDate(kd.accessDate) });
  }
  return stats;
};

const toComparison = (json: ApiProgrammeJsonData): ComparisonSummary | null => {
  const c = json.comparison;
  if (!c?.enabled) return null;
  return {
    enabled: c.enabled,
    completionDeltaDays: c.changeSummary.completionDeltaDays,
    criticalPathDelta: c.changeSummary.criticalPathDelta,
    activitiesAdded: c.changeSummary.activitiesAdded,
    activitiesRemoved: c.changeSummary.activitiesRemoved,
    activitiesMoved: c.changeSummary.activitiesMoved,
  };
};

// Strip control characters (stray DEL / C1 bytes) the extractor leaves in some names.
const cleanText = (text: string): string =>
  // eslint-disable-next-line no-control-regex
  text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();

const toKeyDates = (json: ApiProgrammeJsonData): KeyDateRow[] =>
  (json.keyDatesAndMilestones?.sectionalKeyDates ?? []).map((kd) => ({
    label: cleanText(kd.name),
    value: formatDate(kd.date),
    citation: kd.reference,
  }));

const toCriticalPath = (json: ApiProgrammeJsonData): CriticalPathRow[] =>
  (json.criticalPath ?? []).map((cp) => ({
    activityId: cp.activityId,
    name: cp.activityName,
    finish: formatDate(cp.finishDate),
    totalFloat: `${cp.totalFloatDays}d`,
  }));

const toProgress = (json: ApiProgrammeJsonData): ProgressRow[] => {
  const pr = json.progressAndResources;
  if (!pr) return [];

  const rows: ProgressRow[] = [];
  if (pr.activitiesComplete) {
    rows.push({
      label: 'Activities complete',
      value: `${pr.activitiesComplete.completed} / ${pr.activitiesComplete.total}`,
      valueAccent: `${pr.activitiesComplete.percentage}%`,
      citation: '',
    });
  }
  rows.push({ label: 'In progress', value: String(pr.inProgress ?? 0), citation: '' });
  rows.push({ label: 'Not started', value: String(pr.notStarted ?? 0), citation: '' });
  (pr.calendars ?? []).forEach((c) =>
    rows.push({ label: `Calendar · ${c.name}`, value: `${c.count} activities`, citation: '' })
  );
  if (pr.dateConstraints) {
    rows.push({ label: 'Date constraints', value: String(pr.dateConstraints.total), citation: '' });
    (pr.dateConstraints.constraints ?? []).forEach((c) =>
      rows.push({ label: `Constraint · ${c.type}`, value: String(c.count), citation: '' })
    );
  }
  return rows;
};

const toHealthAlerts = (json: ApiProgrammeJsonData): HealthAlert[] =>
  (json.programmeHealth ?? []).map((h) => ({
    severity: (h.severity ?? '').toLowerCase() === 'critical' ? 'critical' : 'warning',
    title: h.title,
    description: h.description,
    citation: (h.references ?? []).join(', '),
  }));

// Only surface contract data points the extractor actually found a value for.
const toExtractedValues = (json: ApiProgrammeJsonData): ExtractedValueRow[] =>
  Object.entries(json.ProjectKeyValues ?? {})
    .filter(([, v]) => v.value != null && v.value !== '')
    .map(([key, v]) => ({
      label: humanizeKey(key),
      value: v.value as string,
      page: v.page,
      reference: v.reference,
    }));

/** Map the raw primavera `jsonData` payload into the UI's `ProgrammeJsonData` panels. */
export const mapProgrammeJson = (
  json: ApiProgrammeJsonData | null | undefined
): ProgrammeJsonData => {
  if (!json) {
    return {
      meta: { name: '', type: '', programmeId: '', revision: '', status: '' },
      stats: [],
      keyDates: [],
      criticalPath: [],
      progress: [],
      healthAlerts: [],
      extractedValues: [],
      comparison: null,
    };
  }
  return {
    meta: toMeta(json),
    stats: toStats(json),
    keyDates: toKeyDates(json),
    criticalPath: toCriticalPath(json),
    progress: toProgress(json),
    healthAlerts: toHealthAlerts(json),
    extractedValues: toExtractedValues(json),
    comparison: toComparison(json),
  };
};
