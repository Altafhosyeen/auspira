export const BRAND_COLORS = {
  // Radix-style Accent Scale (Base: #224C7D)
  accent1: '#f0f4f8',
  accent2: '#d9e2ec',
  accent3: '#bcccdc',
  accent4: '#9fb3c8',
  accent5: '#829ab1',
  accent6: '#627d98',
  accent7: '#486581',
  accent8: '#334e68',
  accent9: '#224C7D', // Main solid
  accent10: '#1e426d',
  accent11: '#122741', // Text
  accent12: '#070f19', // Text Dark

  // Radix-style Gray Scale (Base: #767676)
  gray1: '#fbfbfc',
  gray2: '#f8f9fa',
  gray3: '#f1f3f5',
  gray4: '#eceef0',
  gray5: '#e6e8eb',
  gray6: '#dfe3e6',
  gray7: '#d7dbdf',
  gray8: '#c1c8cd',
  gray9: '#767676', // Main solid
  gray10: '#6c6c6c',
  gray11: '#505050', // Text
  gray12: '#363636', // Text Dark

  // Semantic
  primary: '#224C7D',
  text: '#363636',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#dfe3e6', // gray6
} as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Design-system "Color styles" (Figma base level)
   Named to match the design panel: main-p, text, icon, success, error.
───────────────────────────────────────────────────────────────────────────── */
export const SEMANTIC_COLORS = {
  'main-p': '#224C7D', // main primary
  text: '#122741', // near-black navy body text
  icon: '#3a3d3c', // neutral icon grey
  success: '#22C55E',
  error: '#EF4444',
  warning: '#EAB308', // extends the Figma set — needed by Ant colorWarning
  onPrimary: '#FFFFFF', // text/icons on top of a primary/dark surface
  // Page/row surface tints — extends the Figma set. Consolidated from the
  // per-file #F8FAFC / #F4F6FA hexes so tints draw from one rooted scale.
  surfaceSubtle: '#F8FAFC', // table row hover, inset panels
  surfaceMuted: '#F4F6FA', // page background behind cards
  surfaceTableHeader: '#EDF7FF', // column-header band on every table
  surfaceMenuActive: '#E5EEFF', // sidebar menu hover / selected row tint
} as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Design-system "Text styles" (Figma base level)
   Each token is [ font-size / line-height / font-weight ] in px.
   Source of truth for the typography utility classes in globals.css.
───────────────────────────────────────────────────────────────────────────── */
export const TYPOGRAPHY = {
  display: { size: 28, line: 36, weight: 700 },
  heading1: { size: 28, line: 36, weight: 700 },
  heading2: { size: 20, line: 28, weight: 700 },
  heading3: { size: 18, line: 24, weight: 600 },
  bodyLarge: { size: 16, line: 24, weight: 400 },
  body: { size: 14, line: 20, weight: 400 },
  bodyStrong: { size: 14, line: 20, weight: 700 },
  caption: { size: 12, line: 16, weight: 400 },
  // Below the Figma floor — for dense tables/badges that need sub-caption text.
  micro: { size: 10, line: 14, weight: 400 },
} as const;

export type TypographyToken = keyof typeof TYPOGRAPHY;

/* ─────────────────────────────────────────────────────────────────────────────
   Status-badge palette (extends the base Color styles).
   Each status is a { bg: soft tint, fg: readable text } pair, used by the
   status pills/chips across the Contract Registry (Time, Notices, Z-clauses,
   Options, Overview). Consolidated from the previously hardcoded per-file hexes
   so every badge draws from one rooted scale.
───────────────────────────────────────────────────────────────────────────── */
export const BADGE_COLORS = {
  neutral: { bg: '#F1F5F9', fg: '#475569' }, // slate
  info: { bg: '#DBEAFE', fg: '#1E40AF' }, // blue
  success: { bg: '#D1FAE5', fg: '#059669' }, // emerald
  warning: { bg: '#FEF3C7', fg: '#B45309' }, // amber
  error: { bg: '#FFE5E6', fg: '#E11D48' }, // rose
  accent: { bg: '#F5F3FF', fg: '#7C3AED' }, // violet
} as const;

export type BadgeStatus = keyof typeof BADGE_COLORS;

/** Near-black navy surface for selected/active tab pills and dark chips. */
export const SURFACE_DARK = '#0F172A';

/**
 * Brand accent gradient (violet → red). Drives the Contract Registry tab ink bar
 * and the onboarding workflow progress bar, which previously carried two slightly
 * different violets — keep both ends here so they stay in step.
 */
export const ACCENT_GRADIENT = { from: '#7C3AED', to: '#EF4444' } as const;

export const APP_THEME = {
  colors: BRAND_COLORS,
  fontFamily: 'var(--font-inter), "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
  shadow: {
    panel: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    sider: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  gradients: {
    sider: 'linear-gradient(180deg, #363636 0%, #122741 100%)',
  },
  // Dark sider menu (BaseSider) — rooted here so components don't hardcode them
  sider: {
    itemColor: 'rgba(255,255,255,0.88)',
    itemSelectedBg: 'rgba(127, 166, 230, 0.34)',
    itemSelectedColor: '#FFFFFF',
    itemHoverColor: '#FFFFFF',
  },
  cssVariables: {
    '--theme-primary': BRAND_COLORS.primary,
    '--theme-text': BRAND_COLORS.text,
    '--theme-background': BRAND_COLORS.background,
    '--theme-surface': BRAND_COLORS.surface,
    '--theme-border': BRAND_COLORS.border,
    '--theme-accent': BRAND_COLORS.accent9,

    // Grays
    '--theme-gray-1': BRAND_COLORS.gray1,
    '--theme-gray-2': BRAND_COLORS.gray2,
    '--theme-gray-3': BRAND_COLORS.gray3,
    '--theme-gray-4': BRAND_COLORS.gray4,
    '--theme-gray-5': BRAND_COLORS.gray5,
    '--theme-gray-6': BRAND_COLORS.gray6,
    '--theme-gray-7': BRAND_COLORS.gray7,
    '--theme-gray-8': BRAND_COLORS.gray8,
    '--theme-gray-9': BRAND_COLORS.gray9,
    '--theme-gray-10': BRAND_COLORS.gray10,
    '--theme-gray-11': BRAND_COLORS.gray11,
    '--theme-gray-12': BRAND_COLORS.gray12,

    // Accents
    '--theme-accent-1': BRAND_COLORS.accent1,
    '--theme-accent-2': BRAND_COLORS.accent2,
    '--theme-accent-3': BRAND_COLORS.accent3,
    '--theme-accent-4': BRAND_COLORS.accent4,
    '--theme-accent-5': BRAND_COLORS.accent5,
    '--theme-accent-6': BRAND_COLORS.accent6,
    '--theme-accent-7': BRAND_COLORS.accent7,
    '--theme-accent-8': BRAND_COLORS.accent8,
    '--theme-accent-9': BRAND_COLORS.accent9,
    '--theme-accent-10': BRAND_COLORS.accent10,
    '--theme-accent-11': BRAND_COLORS.accent11,
    '--theme-accent-12': BRAND_COLORS.accent12,

    // Design-system Color styles
    '--ds-main-p': SEMANTIC_COLORS['main-p'],
    '--ds-text': SEMANTIC_COLORS.text,
    '--ds-icon': SEMANTIC_COLORS.icon,
    '--ds-success': SEMANTIC_COLORS.success,
    '--ds-error': SEMANTIC_COLORS.error,
    '--ds-warning': SEMANTIC_COLORS.warning,
    '--ds-surface-dark': SURFACE_DARK,
    '--ds-surface-subtle': SEMANTIC_COLORS.surfaceSubtle,
    '--ds-surface-muted': SEMANTIC_COLORS.surfaceMuted,
    '--ds-surface-table-header': SEMANTIC_COLORS.surfaceTableHeader,
    '--ds-accent-gradient-from': ACCENT_GRADIENT.from,
    '--ds-accent-gradient-to': ACCENT_GRADIENT.to,
    '--ds-accent-gradient': `linear-gradient(90deg, ${ACCENT_GRADIENT.from} 0%, ${ACCENT_GRADIENT.to} 100%)`,

    // Status-badge palette (soft bg + fg per status)
    '--badge-neutral-bg': BADGE_COLORS.neutral.bg,
    '--badge-neutral-fg': BADGE_COLORS.neutral.fg,
    '--badge-info-bg': BADGE_COLORS.info.bg,
    '--badge-info-fg': BADGE_COLORS.info.fg,
    '--badge-success-bg': BADGE_COLORS.success.bg,
    '--badge-success-fg': BADGE_COLORS.success.fg,
    '--badge-warning-bg': BADGE_COLORS.warning.bg,
    '--badge-warning-fg': BADGE_COLORS.warning.fg,
    '--badge-error-bg': BADGE_COLORS.error.bg,
    '--badge-error-fg': BADGE_COLORS.error.fg,
    '--badge-accent-bg': BADGE_COLORS.accent.bg,
    '--badge-accent-fg': BADGE_COLORS.accent.fg,

    '--theme-font-family': 'var(--font-inter), "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    '--theme-shadow-panel': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '--theme-shadow-sider':
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '--theme-gradient-sider': 'linear-gradient(180deg, #363636 0%, #122741 100%)',
  },
} as const;
