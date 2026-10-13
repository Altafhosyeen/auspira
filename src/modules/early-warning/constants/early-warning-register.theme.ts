import { APP_COLORS, APP_SIZES, APP_THEME } from '@/constants/app.theme';

// Early-warning module tokens — the shared antd ThemeConfig lives in src/constants/app.theme.
// Only module-specific colours/sizes stay here; they extend the shared base.
export const EW_COLORS = {
  ...APP_COLORS,
  overdue: '#D92D20',
  // Detail meta bar "RRM due" text + progress fill (Figma 46:923).
  rrmDue: '#f60c0b',
  // Gradient indicator under the active register tab (matches the CE tab bar).
  activeTabGradient: 'linear-gradient(90deg, #6B21A8 0%, #EF4444 100%)',
  fieldIconBg: 'rgba(148, 155, 170, 0.2)',
  fieldIconBorder: '#E0E3E8',
} as const;

export const EW_SIZES = {
  ...APP_SIZES,
  toolbarGap: 16,
  toolbarSearchWidth: 320,
  toolbarStatusWidth: 160,
  tabBarHeight: 46,
  tabIndicatorHeight: 3,
  fieldIconChip: 24,
  fieldIcon: 14,
} as const;

export const EW_REGISTER_THEME = APP_THEME;
