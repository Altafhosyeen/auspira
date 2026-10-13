import type { ThemeConfig } from 'antd';

// Figma palette for the Create Request For Information screen — same family as the
// register theme, tuned for form controls instead of table surfaces.
export const FORM_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  bannerBorder: 'rgba(56, 108, 181, 0.27)',
  border: '#E0E3E8',
  textMuted: '#6F6B7D',
  required: '#F60C0B',
  fieldIconBg: 'rgba(148, 155, 170, 0.2)',
  fileName: '#1F2937',
  link: '#386CB5',
} as const;

export const FORM_SIZES = {
  cardRadius: 12,
  controlRadius: 4,
  controlHeight: 42,
  sectionIconChip: 32,
  fieldIconChip: 24,
  fieldIcon: 14,
  cardPaddingBlock: 20,
  cardPaddingInline: 32,
  railPaddingBlock: 22,
  railPaddingInline: 18,
} as const;

export const FORM_THEME: ThemeConfig = {
  token: {
    colorPrimary: FORM_COLORS.main,
    colorLink: FORM_COLORS.link,
    colorLinkHover: FORM_COLORS.main,
    colorError: FORM_COLORS.required,
    colorBorder: FORM_COLORS.border,
    colorBorderSecondary: FORM_COLORS.border,
    colorTextDescription: FORM_COLORS.textMuted,
    borderRadius: FORM_SIZES.controlRadius,
    borderRadiusLG: FORM_SIZES.cardRadius,
  },
  components: {
    Card: { borderRadiusLG: FORM_SIZES.cardRadius },
    Input: {
      controlHeight: FORM_SIZES.controlHeight,
      borderRadius: FORM_SIZES.controlRadius,
    },
    Select: {
      controlHeight: FORM_SIZES.controlHeight,
      borderRadius: FORM_SIZES.controlRadius,
    },
    DatePicker: {
      controlHeight: FORM_SIZES.controlHeight,
      borderRadius: FORM_SIZES.controlRadius,
    },
    Button: { controlHeight: 38, borderRadius: 6, borderRadiusLG: 8, primaryShadow: 'none' },
    Upload: { colorBorder: FORM_COLORS.border },
    Form: { itemMarginBottom: 14, labelColonMarginInlineEnd: 0, verticalLabelPadding: '0 0 4px' },
  },
};
