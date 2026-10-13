import { REGISTER_COLORS } from './compensation-event-register.theme';

// Detail-screen additions to the shared register palette (same Figma tokens).
export const DETAIL_COLORS = {
  ...REGISTER_COLORS,
  mainBorder: 'rgba(15, 76, 129, 0.5)',
  tabBarBg: REGISTER_COLORS.mainSoft,
  activeTabGradient: 'linear-gradient(90deg, #6B21A8 0%, #EF4444 100%)',
  approvedValue: '#0CBE73',
  chipViolet: '#F3E8FF',
  chipMint: '#E3FCEF',
  chipAmber: '#FFEACF',
  chipBlue: REGISTER_COLORS.mainSoft,
  chipIcon: REGISTER_COLORS.main,
} as const;

// The chip + title (+ "View all") header shared by every detail-screen panel.
export const PANEL_SIZES = {
  cardRadius: 8,
  headerChip: 32,
  headerChipRadius: 8,
  headerIconFontSize: 16,
  headerGap: 8,
  headerBlockGap: 12,
  titleFontSize: 16,
  actionHeight: 28,
  actionRadius: 6,
  actionFontSize: 13,
  actionPaddingInline: 12,
} as const;

export const DETAIL_SIZES = {
  tabBarHeight: 46,
  tabIndicatorHeight: 3,
  metricChip: 32,
  metricLabelFontSize: 12,
  metricValueFontSize: 15,
  summaryFontSize: 12,
  metaFontSize: 11,
} as const;
