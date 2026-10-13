import type { ProgrammeStatusTone } from '../types/programme.types';

// Mirrors the Project Daily Report / Defect Notice register palette so every CCA/OCA register
// reads as one product.
//
// The module renders through `ProgrammeThemeProvider` (the early-warning register theme + the
// user's UI preferences), so this file carries no antd ThemeConfig and no control tokens —
// those belong to the shared provider.
export const REGISTER_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  tagBorder: 'rgba(15, 76, 129, 0.23)',
  rowDivider: '#EAECF0',
  text: '#000000',
  textMuted: '#6F6B7D',
  link: '#386CB5',
} as const;

export const REGISTER_SIZES = {
  pillRadius: 6,
  refFontSize: 14,
  cellFontSize: 12,
  badgeFontSize: 10,
  titleFontSize: 20,
  headerIconSize: 22,
  healthDotSize: 10,
} as const;

// Same tone palette as the other registers, so a status pill reads identically whichever
// register the user is looking at.
export const REGISTER_TONE_STYLES: Record<
  ProgrammeStatusTone,
  { background: string; border: string; color: string }
> = {
  neutral: { background: '#EEEFF2', border: '#C7C7C7', color: REGISTER_COLORS.textMuted },
  positive: {
    background: 'rgba(209, 250, 229, 0.5)',
    border: 'rgba(0, 163, 114, 0.2)',
    color: '#065F46',
  },
  warning: { background: '#FFEACF', border: 'rgba(249, 72, 15, 0.5)', color: '#F9480F' },
  negative: { background: '#FEE7EA', border: 'rgba(246, 12, 11, 0.5)', color: '#F60C0B' },
};

// The health dot is the only place a tone becomes a single colour. Grey for an unnamed code,
// matching the neutral pill the status column falls back to.
export const HEALTH_DOT_COLORS: Record<ProgrammeStatusTone, string> = {
  neutral: '#98A2B3',
  positive: '#0CBE73',
  warning: '#F9480F',
  negative: '#F60C0B',
};
