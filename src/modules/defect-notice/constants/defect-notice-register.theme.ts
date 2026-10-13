import type { DefectNoticeTone } from '../types/defect-notice.types';

// Mirrors the Compensation Event register palette so every CCA register reads as one product.
export const REGISTER_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  cardBorder: '#E0E3E8',
  tagBorder: 'rgba(15, 76, 129, 0.23)',
  rowDivider: '#EAECF0',
  controlBorder: 'rgba(107, 122, 144, 0.5)',
  controlText: '#6B7A90',
  text: '#000000',
  textMuted: '#6F6B7D',
  link: '#386CB5',
} as const;

export const REGISTER_SIZES = {
  cardRadius: 6,
  controlRadius: 8,
  controlHeight: 40,
  badgeRadius: 4,
  pillRadius: 6,
  refFontSize: 14,
  cellFontSize: 12,
  badgeFontSize: 10,
  titleFontSize: 20,
  headerIconSize: 22,
  toolbarGap: 12,
  toolbarSearchWidth: 340,
  toolbarFiltersWidth: 110,
} as const;

// Same tone palette as the Compensation Event / RFI registers, so an OPEN pill
// reads identically whichever register the user is looking at.
export const REGISTER_TONE_STYLES: Record<
  DefectNoticeTone,
  { background: string; border: string; color: string }
> = {
  neutral: { background: '#EEEFF2', border: '#C7C7C7', color: REGISTER_COLORS.textMuted },
  info: {
    background: REGISTER_COLORS.mainSoft,
    border: REGISTER_COLORS.tagBorder,
    color: REGISTER_COLORS.main,
  },
  success: {
    background: 'rgba(209, 250, 229, 0.5)',
    border: 'rgba(0, 163, 114, 0.2)',
    color: '#065F46',
  },
  warning: { background: '#FFEACF', border: 'rgba(249, 72, 15, 0.5)', color: '#F9480F' },
  danger: { background: '#FEE7EA', border: 'rgba(246, 12, 11, 0.5)', color: '#F60C0B' },
};

// The antd ThemeConfig root lives in `defect-notice-theme-provider.tsx` — the same
// EW_REGISTER_THEME + useUISettings wiring the Early Warning and PMI screens render
// through, so all CCA registers react to the user's live font/radius/size preferences.
