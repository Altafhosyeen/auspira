import type { SourceOverviewData } from '@/components/document-json-view/option-source/SourceOverviewDialog';

export type TimeBarWho =
  | 'C'
  | 'PM'
  | 'CL'
  | 'EITHER'
  | 'ADJ'
  | '-'
  | 'Contractor'
  | 'Subcontractor'
  | 'Client';

export interface TimelineItem {
  id: string;
  clause: string;
  period: string;
  who: TimeBarWho;
  clockStarts: string;
  source: string;
  modifies?: string;
  modified?: boolean;
  modifiedTag?: string;
  /** Source document + content the eye action opens, when the API provides a document reference. */
  sourceRef?: SourceOverviewData;
}

/**
 * Rows bucketed by category. The table itself is flat — this grouping only drives the CATEGORY
 * column value and the tick-box category filter.
 */
export interface Section {
  title: string;
  items: TimelineItem[];
}

export interface TimeBarApiItem {
  id: string;
  createdOn: string;
  projectId: string;
  clause: string;
  group: string;
  period: string;
  who: TimeBarWho;
  clockStartsWhen: string;
  source: string;
  modifies?: string;
  page?: number | null;
  projectDocumentId?: string | null;
  projectDocumentUrl?: string | null;
  /** Human-written overview of the clause; null until the backend generates it. */
  documentOverview?: string | null;
}

export interface TimeBarApiResponse {
  meta: { totalCount: number };
  items: TimeBarApiItem[];
}

export type TimeBarFilter = 'all' | 'modified' | 'contractor';
