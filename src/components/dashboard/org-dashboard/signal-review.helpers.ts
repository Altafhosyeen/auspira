import dayjs from 'dayjs';
import { Check, type LucideIcon, X } from 'lucide-react';
import { INITIAL_IMPACT_TYPES } from '@/components/contract-control-agent/early-warning-form.data';
import { ProjectAlertType } from '@/constants';
import { toLocalDayjs } from '@/lib/utils';

export const IMPACT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  INITIAL_IMPACT_TYPES.map((o) => [o.value, o.label])
);

export const formatAlertTimestamp = (createdOn: string) => {
  const created = toLocalDayjs(createdOn);
  const day = created.isSame(dayjs(), 'day') ? 'Today' : created.format('DD MMM YYYY');
  return `${day} · ${created.format('h:mm A')}`;
};

/**
 * Figma palette for the review screen — the single place its colours are written down, so the
 * JSX carries token names rather than hexes. Mirrors NOTICE_COLORS, which roots the same design
 * language for the Compensation Event notice screen.
 */
export const REVIEW_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  mainBorder: 'rgba(0, 53, 95, 0.5)',
  bannerBorder: 'rgba(56, 108, 181, 0.27)',
  tagBg: '#E6F4FF',
  tagBorder: 'rgba(15, 76, 129, 0.23)',
  border: '#E0E3E8',
  text: '#000000',
  textMuted: '#6F6B7D',
  textLow: '#4B465C',
  orange: '#F9480F',
  orangeSoft: '#FFEACF',
  orangeBorder: 'rgba(249, 72, 15, 0.5)',
  timeBar: '#FF8D28',
  red: '#F60C0B',
  redSoft: '#FEE7EA',
  redWash: 'rgba(254, 231, 234, 0.5)',
  redBorder: 'rgba(246, 12, 11, 0.5)',
  green: '#0CBE73',
} as const;

export const getConfidenceTier = (confidence: number) => {
  if (confidence >= 80)
    return { label: 'High', qualifier: 'very likely', color: REVIEW_COLORS.red };
  if (confidence >= 50)
    return { label: 'Medium', qualifier: 'possibly', color: REVIEW_COLORS.timeBar };
  return { label: 'Low', qualifier: 'unlikely', color: REVIEW_COLORS.textMuted };
};

/** Where "Accept & register" lands, per signal type. */
export const getAcceptDestination = (alertType: number, alertId: string) => {
  switch (alertType) {
    case ProjectAlertType.CompensationEvent:
      // The alert id rides the URL so the notice form still prefills after a refresh —
      // the bridge store only survives the one client-side navigation.
      return `/contract-control-agent/compensation-event/new?alertId=${alertId}`;
    // case ProjectAlertType.Quotation:
    //   return `/contract-control-agent/compensation-event/quotation/${alertId}`;
    case ProjectAlertType.EarlyWarning:
      return '/contract-control-agent/early-warning/register';
    default:
      return '';
  }
};

export type DecisionKey = 'accept' | 'notAccepted';

export interface DecisionCard {
  key: DecisionKey;
  icon: LucideIcon;
  title: string;
  desc?: string;
}

/** The two decision cards offered on every signal review. */
export const getDecisionCards = (): DecisionCard[] => [
  {
    key: 'accept',
    icon: Check,
    title: 'Accept',
  },
  {
    key: 'notAccepted',
    icon: X,
    title: 'Not Accepted',
  },
];
