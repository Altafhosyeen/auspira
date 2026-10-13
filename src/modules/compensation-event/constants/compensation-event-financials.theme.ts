import { REGISTER_COLORS } from './compensation-event-register.theme';

export type CompensationEventFinancialTone =
  | 'quote'
  | 'approved'
  | 'varianceAdverse'
  | 'varianceFavourable'
  | 'fees'
  | 'riskAllowance'
  | 'time';

// Figma palette for the Compensation Event Details → Financials tab.
export const FINANCIALS_COLORS = {
  positive: '#0CBE73',
  negative: '#F60C0B',
  fees: '#FF5722',
  value: REGISTER_COLORS.text,
  navy: REGISTER_COLORS.main,
  divider: REGISTER_COLORS.rowDivider,
  bannerBorder: 'rgba(15, 76, 129, 0.5)',
} as const;

export const FINANCIALS_CARD_TONES: Record<
  CompensationEventFinancialTone,
  { background: string; border: string; chip: string; icon: string }
> = {
  quote: {
    background: '#F8F7FD',
    border: 'rgba(119, 63, 230, 0.5)',
    chip: '#F3E8FF',
    icon: '#773FE6',
  },
  approved: {
    background: '#F6F9F8',
    border: 'rgba(12, 190, 115, 0.5)',
    chip: '#E1FAEF',
    icon: FINANCIALS_COLORS.positive,
  },
  varianceAdverse: {
    background: '#FDF7F8',
    border: 'rgba(246, 12, 11, 0.5)',
    chip: '#FEE7EA',
    icon: FINANCIALS_COLORS.negative,
  },
  varianceFavourable: {
    background: '#F6F9F8',
    border: 'rgba(12, 190, 115, 0.5)',
    chip: '#E1FAEF',
    icon: FINANCIALS_COLORS.positive,
  },
  fees: {
    background: '#FFF6F0',
    border: 'rgba(255, 87, 34, 0.5)',
    chip: '#FFE8D9',
    icon: FINANCIALS_COLORS.fees,
  },
  riskAllowance: {
    background: '#FDF7F8',
    border: 'rgba(246, 12, 11, 0.5)',
    chip: '#FEE7EA',
    icon: FINANCIALS_COLORS.negative,
  },
  time: {
    background: '#F5F8FE',
    border: FINANCIALS_COLORS.bannerBorder,
    chip: REGISTER_COLORS.mainSoft,
    icon: REGISTER_COLORS.main,
  },
};

export const FINANCIALS_SIZES = {
  cardRadius: 8,
  sectionGap: 24,
  metricGutter: 30,
  metricCardHeight: 128,
  metricCardGap: 8,
  metricChip: 30,
  metricChipRadius: 4,
  metricIconFontSize: 16,
  metricLabelFontSize: 14,
  metricValueFontSize: 22,
  outcomeChip: 22,
  outcomeIconFontSize: 15,
  outcomeTitleFontSize: 12,
  outcomeHeaderGap: 13,
  outcomeRowGap: 14,
  outcomeRowFontSize: 11,
} as const;
