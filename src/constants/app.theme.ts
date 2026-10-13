import type { ThemeConfig } from 'antd';

// Shared design tokens — the antd ConfigProvider theme used by the app modules so
// buttons, tables, tags, alerts etc. look the same everywhere. Module-specific
// tokens (per-module colours/sizes) live in each module's own constants.
export const APP_COLORS = {
  main: '#1B3A5F',
  mainSoft: '#E3F1FB',
  cardBorder: '#DFE5EC',
  rowDivider: '#EAECF0',
  text: '#101828',
  textMuted: '#667085',
} as const;

export const APP_SIZES = {
  cardRadius: 4,
  controlRadius: 4,
  controlHeight: 36,
  cellFontSize: 13,
  titleFontSize: 22,
} as const;

export const APP_THEME: ThemeConfig = {
  token: {
    colorPrimary: APP_COLORS.main,
    colorTextHeading: APP_COLORS.main,
    colorBorder: APP_COLORS.cardBorder,
    colorBorderSecondary: APP_COLORS.cardBorder,
    colorText: APP_COLORS.text,
    colorTextSecondary: APP_COLORS.textMuted,
    borderRadius: APP_SIZES.controlRadius,
    // Baseline control height — componentSize (small/medium/large) picks the
    // SM / base / LG heights from this, so the UI-settings size knob works.
    controlHeight: APP_SIZES.controlHeight,
    // Info alerts (banners) use the shared soft-blue + navy icon.
    colorInfoBg: APP_COLORS.mainSoft,
    colorInfoBorder: '#A7CCF0',
    colorInfo: APP_COLORS.main,
  },
  components: {
    Typography: { titleMarginBottom: 0 },
    // Plain Tags render as the soft-blue pill chips (status/impact tags keep their preset colour).
    Tag: {
      defaultBg: '#E6F4FF',
      defaultColor: APP_COLORS.main,
    },
    // Detail tooltips use the soft-blue instead of the default spotlight grey.
    Tooltip: {
      colorBgSpotlight: APP_COLORS.mainSoft,
      colorTextLightSolid: APP_COLORS.main,
    },
    Table: {
      headerBg: APP_COLORS.mainSoft,
      headerColor: APP_COLORS.main,
      headerSplitColor: 'transparent',
      borderColor: APP_COLORS.rowDivider,
      rowHoverBg: '#F7FAFD',
      cellFontSize: APP_SIZES.cellFontSize,
      cellPaddingBlock: 16,
    },
    Button: {
      primaryShadow: 'none',
    },
    // Antd forms take the label colour from colorTextHeading (navy) — keep labels
    // in the standard body text colour instead.
    Form: { labelColor: APP_COLORS.text },
    // Dropdown options default to antd's stock blue (#E6F4FF) — pin them to the
    // shared soft-blue so a selected option matches the chips and table headers.
    Select: {
      optionSelectedBg: APP_COLORS.mainSoft,
      optionSelectedColor: APP_COLORS.main,
      optionActiveBg: '#F7FAFD',
    },
  },
};
