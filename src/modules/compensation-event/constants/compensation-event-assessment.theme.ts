import { QUOTATION_COLORS } from './compensation-event-quotation.theme';

// The 63.7 late-EW banner is the only amber surface in the CE workflow screens.
export const ASSESSMENT_COLORS = {
  ...QUOTATION_COLORS,
  warningBg: '#FEF4EC',
  warningBorder: '#F2994A',
  warningTitle: '#F2703A',
  warningChipBg: '#FBDFC8',
  warningChipText: '#C2571A',
  warningDivider: 'rgba(242, 153, 74, 0.35)',
  noteBg: '#F5F6F8',
} as const;

export const ASSESSMENT_SIZES = {
  cardTitleFontSize: 15,
  editIconFontSize: 11,
  warningIconFontSize: 22,
  warningTitleFontSize: 13,
  warningBodyFontSize: 12,
  fieldLabelFontSize: 10,
  noteFontSize: 11,
  reasoningRows: 4,
  labelColumnSpan: 6,
} as const;
