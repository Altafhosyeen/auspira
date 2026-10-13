import type { ThemeConfig } from 'antd';

// Figma palette for the Compensation Event Notice screen. Applied through antd's
// ConfigProvider token system rather than CSS, so the module stays antd-only.
export const NOTICE_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  mainBorder: 'rgba(15, 76, 129, 0.5)',
  bannerBorder: 'rgba(56, 108, 181, 0.27)',
  tagBg: '#E6F4FF',
  tagBorder: 'rgba(15, 76, 129, 0.23)',
  border: '#E0E3E8',
  textMuted: '#6F6B7D',
  required: '#F60C0B',
  fieldIconBg: 'rgba(148, 155, 170, 0.2)',
  fileName: '#1F2937',
  link: '#386CB5',
  timeBar: '#FF8D28',
  stepPending: '#6F6B7D',
} as const;

export const NOTICE_SIZES = {
  cardRadius: 12,
  controlRadius: 4,
  controlHeight: 42,
  sectionIconChip: 32,
  fieldIconChip: 24,
  fieldIcon: 14,
  tileIconChip: 24,
  cardPaddingBlock: 24,
  cardPaddingInline: 32,
  railPaddingBlock: 22,
  railPaddingInline: 18,
} as const;

export const NOTICE_THEME: ThemeConfig = {
  token: {
    colorPrimary: NOTICE_COLORS.main,
    colorLink: NOTICE_COLORS.link,
    colorLinkHover: NOTICE_COLORS.main,
    colorError: NOTICE_COLORS.required,
    colorBorder: NOTICE_COLORS.border,
    colorBorderSecondary: NOTICE_COLORS.border,
    colorTextDescription: NOTICE_COLORS.textMuted,
    borderRadius: NOTICE_SIZES.controlRadius,
    borderRadiusLG: NOTICE_SIZES.cardRadius,
  },
  components: {
    Card: { borderRadiusLG: NOTICE_SIZES.cardRadius },
    Input: {
      controlHeight: NOTICE_SIZES.controlHeight,
      borderRadius: NOTICE_SIZES.controlRadius,
    },
    Select: {
      controlHeight: NOTICE_SIZES.controlHeight,
      borderRadius: NOTICE_SIZES.controlRadius,
    },
    DatePicker: {
      controlHeight: NOTICE_SIZES.controlHeight,
      borderRadius: NOTICE_SIZES.controlRadius,
    },
    // The header buttons round at 6 and the full-width Notify button at 8 (size large).
    Button: { controlHeight: 38, borderRadius: 6, borderRadiusLG: 8, primaryShadow: 'none' },
    Progress: { defaultColor: NOTICE_COLORS.main },
    Timeline: { dotBorderWidth: 2, itemPaddingBottom: 20 },
    Upload: { colorBorder: NOTICE_COLORS.border },
  },
};
