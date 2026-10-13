import type { ProjectDailyReportTone } from '../types/project-daily-report.types';

// Mirrors the Compensation Event / Defect Notice register palette so every register reads as
// one product. Only `progressOnTrack` / `progressBehind` are this register's own.
//
// The module renders through the shared `ProjectDailyReportThemeProvider` (the early-warning
// register theme + the user's UI preferences), so this file carries no antd ThemeConfig and
// no control tokens — those belonged to the toolbar and page-level providers the shared ones
// replaced.
export const REGISTER_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  tagBorder: 'rgba(15, 76, 129, 0.23)',
  rowDivider: '#EAECF0',
  text: '#000000',
  textMuted: '#6F6B7D',
  link: '#386CB5',
  progressOnTrack: '#0F9D58',
  progressBehind: '#F9480F',
} as const;

export const REGISTER_SIZES = {
  pillRadius: 6,
  refFontSize: 14,
  cellFontSize: 12,
  badgeFontSize: 10,
  titleFontSize: 20,
  headerIconSize: 22,
} as const;

// Same tone palette as the Compensation Event / RFI registers, so a status pill
// reads identically whichever register the user is looking at.
export const REGISTER_TONE_STYLES: Record<
  ProjectDailyReportTone,
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
