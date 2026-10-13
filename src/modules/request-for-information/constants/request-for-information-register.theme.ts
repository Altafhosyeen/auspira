import type { ThemeConfig } from 'antd';
import type { RequestForInformationTone } from '../types/request-for-information.types';

// Same palette as the Compensation Event / Early Warning registers, so every register
// in the app reads as one product rather than a per-module restyle.
export const REGISTER_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  tagBg: '#E6F4FF',
  tagBorder: 'rgba(15, 76, 129, 0.23)',
  cardBorder: '#E0E3E8',
  rowDivider: '#EAECF0',
  controlBorder: 'rgba(107, 122, 144, 0.5)',
  controlText: '#6B7A90',
  text: '#000000',
  textMuted: '#6F6B7D',
  subtitle: '#727780',
  link: '#386CB5',
  noteBg: '#F3F4F8',
} as const;

export const REGISTER_SIZES = {
  cardRadius: 6,
  controlRadius: 8,
  controlHeight: 40,
  badgeRadius: 4,
  pillRadius: 6,
  refFontSize: 14,
  subjectFontSize: 12,
  cellFontSize: 12,
  subjectMaxWidth: 260,
  badgeFontSize: 10,
  titleFontSize: 20,
  headerIconSize: 24,
  toolbarGap: 12,
  toolbarSearchWidth: 512,
  toolbarFiltersWidth: 143,
} as const;

export const REGISTER_TONE_STYLES: Record<
  RequestForInformationTone,
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

export const REGISTER_THEME: ThemeConfig = {
  token: {
    colorPrimary: REGISTER_COLORS.main,
    colorLink: REGISTER_COLORS.link,
    colorLinkHover: REGISTER_COLORS.link,
    colorBorder: REGISTER_COLORS.cardBorder,
    colorBorderSecondary: REGISTER_COLORS.cardBorder,
    colorTextDescription: REGISTER_COLORS.textMuted,
    borderRadius: REGISTER_SIZES.controlRadius,
    borderRadiusLG: REGISTER_SIZES.cardRadius,
  },
  components: {
    Card: { borderRadiusLG: REGISTER_SIZES.cardRadius },
    Table: {
      headerBg: REGISTER_COLORS.mainSoft,
      headerColor: REGISTER_COLORS.main,
      headerSplitColor: 'transparent',
      headerBorderRadius: REGISTER_SIZES.badgeRadius,
      borderColor: REGISTER_COLORS.rowDivider,
      rowHoverBg: REGISTER_COLORS.mainSoft,
      cellFontSize: REGISTER_SIZES.cellFontSize,
      cellPaddingBlock: 14,
    },
    Button: {
      controlHeight: REGISTER_SIZES.controlHeight,
      borderRadius: REGISTER_SIZES.controlRadius,
      primaryShadow: 'none',
      defaultBorderColor: REGISTER_COLORS.cardBorder,
    },
    Input: {
      controlHeight: REGISTER_SIZES.controlHeight,
      borderRadius: REGISTER_SIZES.controlRadius,
    },
    Select: {
      controlHeight: REGISTER_SIZES.controlHeight,
      borderRadius: REGISTER_SIZES.controlRadius,
    },
    Tag: { borderRadiusSM: REGISTER_SIZES.badgeRadius },
    Menu: {
      itemSelectedBg: REGISTER_COLORS.mainSoft,
      itemSelectedColor: REGISTER_COLORS.main,
      itemHoverBg: REGISTER_COLORS.mainSoft,
    },
  },
};
