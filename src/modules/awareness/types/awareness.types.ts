export type SourceType = 'email' | 'document' | 'weather' | 'system';

export type RouteType =
  | 'early-warning'
  | 'pmi'
  | 'compensation'
  | 'quotation'
  | 'meeting'
  | 'defect-notice'
  | 'daily-site-report'
  | 'programme'
  | 'watchtower';

export type BadgeTone = 'success' | 'info' | 'sky' | 'warning' | 'error' | 'neutral' | 'urgent';

export type StatusType = 'new' | 'linked' | 'closed';

export type FilterTab =
  | 'all'
  | 'early-warning'
  | 'pmi'
  | 'compensation'
  | 'tq'
  | 'meeting'
  | 'quotation';

export interface RouteMeta {
  type: RouteType;
  label: string;
  tone: BadgeTone;
}

export interface SignalSource {
  type: SourceType;
  name: string;
  sub: string;
}

export interface Signal {
  id: string;
  /** Raw `ProjectAlertType` — drives which detail screen the row opens. */
  alertType: number;
  source: SignalSource;
  signal: string;
  refNumber: string;
  route: RouteMeta;
  status: StatusType;
  dueDate: { day: string; time?: string } | null;
  received: { day: string; time: string };
  /** Raw createdOn ISO — for date filtering. */
  createdOn: string;
}
