// Same family as the register theme, tuned for form controls instead of table surfaces.
export const FORM_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  border: '#E0E3E8',
  textMuted: '#6F6B7D',
  link: '#386CB5',
} as const;

export const FORM_SIZES = {
  cardRadius: 6,
  controlRadius: 4,
  controlHeight: 42,
  cardPaddingBlock: 20,
  cardPaddingInline: 32,
} as const;

// The antd ThemeConfig root lives in `defect-notice-theme-provider.tsx` — the same
// EW_REGISTER_THEME + useUISettings wiring the Early Warning and PMI screens render
// through, so the form reacts to the user's live font/radius/size preferences too.
