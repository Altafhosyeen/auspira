import type { ThemeConfig } from 'antd';
import type { CompensationEventTone } from '../types/compensation-event.types';

// Figma palette for the Compensation Event Register screen. Applied through antd's
// ConfigProvider token system rather than CSS, so the module stays antd-only.
export const REGISTER_COLORS = {
  main: '#00355F',
  mainSoft: '#EDF7FF',
  tagBg: '#E6F4FF',
  tagBorder: 'rgba(15, 76, 129, 0.23)',
  directionChipBg: '#CCE8FF',
  cardBorder: '#E0E3E8',
  rowDivider: '#EAECF0',
  controlBorder: 'rgba(107, 122, 144, 0.5)',
  controlText: '#6B7A90',
  text: '#000000',
  textMuted: '#6F6B7D',
  // The register's row titles. The muted grey is for supporting metadata; the title is
  // what identifies the row, so it carries the same ink as the reference beside it.
  subjectText: '#122741',
  subtitle: '#727780',
  link: '#386CB5',
  noteBg: '#F3F4F8',
  avatarBg: '#C1C9D4',
} as const;

// Icon-chip tones for the register summary strip (Total Quotation Value / Total
// Duration Impact) — navy for money, a soft green for the duration/calendar tile.
export const REGISTER_SUMMARY_TONES = {
  quotationValue: { chip: '#E6F0FA', icon: REGISTER_COLORS.main },
  durationImpact: { chip: '#E1FAEF', icon: '#0CBE73' },
} as const;

export const REGISTER_SIZES = {
  cardRadius: 12,
  controlRadius: 8,
  controlHeight: 40,
  badgeRadius: 4,
  refFontSize: 14,
  // Fits a full "CE-0000" on one line — below this the reference wraps mid-token and
  // reads as two broken rows. The direction chip used to sit here too and the column was
  // 190 to hold both; the width it no longer needs went to the State column, whose
  // longest backend status ("QUOTATION IN PROGRESS") had none to spare.
  refColumnWidth: 110,
  subjectFontSize: 13,
  cellFontSize: 12,
  // Width a clamped subject block is bounded to where a register renders the subject
  // inside another column rather than giving it one of its own.
  subjectMaxWidth: 200,
  // 9px, not 10: the State badge never wraps, and at 10px the longest status the backend
  // sends ("REVISED QUOTATION TO BE SUBMITTED") ran past even the widened column.
  badgeFontSize: 9,
  titleFontSize: 20,
  headerIconSize: 24,
  // Matches AUDIT_SIZES (compensation-event-audit-trail-tab) so the register and
  // audit-trail toolbars line up — search+filters grouped left, Clear all pinned right.
  toolbarGap: 12,
  // Matches EW_SIZES.toolbarSearchWidth (early-warning-register.theme) so the two
  // registers' search boxes are the same width side by side.
  toolbarSearchWidth: 320,
  toolbarFiltersWidth: 143,
  summaryIconSize: 44,
  summaryIconFontSize: 20,
  summaryValueFontSize: 28,
  // The duration tile's unit sits beside the figure rather than in it, so it is stepped
  // down from the headline size — the number stays the thing the eye lands on.
  summaryValueUnitFontSize: 16,
} as const;

export const REGISTER_TONE_STYLES: Record<
  CompensationEventTone,
  { background: string; border: string; color: string }
> = {
  neutral: { background: '#EEEFF2', border: '#C7C7C7', color: REGISTER_COLORS.textMuted },
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
    // The Filters dropdown carries its own checkboxes, so antd's default dark selected
    // band is both redundant and far heavier than the rest of the register — a picked row
    // gets the same pale blue as a hovered table row instead.
    Menu: {
      itemSelectedBg: REGISTER_COLORS.mainSoft,
      itemSelectedColor: REGISTER_COLORS.main,
      itemHoverBg: REGISTER_COLORS.mainSoft,
    },
  },
};
