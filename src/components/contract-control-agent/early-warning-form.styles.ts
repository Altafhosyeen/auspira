// ─── STYLE VARIABLES ─────────────────────────────────────────────────────────
// Single source of truth for the Register Early Warning form's colours + class
// strings. Components read from here instead of repeating Tailwind classes, so a
// colour/spacing change happens in one place. Design-system tokens (bg-surface-*,
// text-success, badge-success, …) are used wherever a token exists.

export const EW_FORM_STYLES = {
  // Layout
  grid: 'grid grid-cols-1 gap-6 lg:grid-cols-3',
  leftColumn: 'space-y-2 lg:col-span-2',
  rightColumn: 'space-y-4 lg:col-span-1',

  // Header
  headerRow: 'flex flex-wrap items-center gap-3',
  title: 'text-2xl font-bold tracking-tight text-text',
  clauseBadge:
    'badge-success rounded border border-success/20 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider',
  subtitle: 'mt-1 text-sm text-slate-500',

  // Pre-fill banner
  bannerWrap: 'badge-success mb-6 flex items-start gap-3 rounded border border-success/20 p-4',
  bannerIcon: 'mt-0.5 flex-shrink-0 text-base text-success',
  bannerText: 'text-[13px] leading-relaxed',

  // Cards
  card: 'rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm',
  cardStack: 'flex flex-col gap-4',
  sectionHeaderRow: 'flex items-center justify-between border-b border-slate-100 pb-2.5',
  sectionTitle: 'text-sm font-bold text-slate-900',
  sectionTitleBordered: 'border-b border-slate-100 pb-2.5 text-sm font-bold text-slate-900',
  sectionAside: 'font-mono text-[11px] font-medium tracking-wide text-slate-400 uppercase',
  infoTitle: 'mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase',
  infoTitleBordered:
    'border-b border-slate-100 pb-2.5 text-xs font-bold tracking-wider text-slate-400 uppercase',

  // Grid rows inside a card
  row2: 'grid grid-cols-1 gap-3 md:grid-cols-2',
  row3: 'grid grid-cols-1 gap-3 md:grid-cols-3',

  // Fields
  label: 'mb-1.5 block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase',
  labelSpaced: 'mb-2.5 block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase',
  required: 'text-error',
  input:
    'w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-slate-300',
  inputMuted:
    'w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 outline-none focus:border-slate-300',
  inputDisabled:
    'w-full rounded border border-slate-200 bg-surface-subtle px-3 py-2 text-sm font-medium text-slate-500 outline-none',
  textarea:
    'w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed font-medium text-slate-700 outline-none focus:border-slate-300',

  // Select
  selectWrap: 'relative',
  select:
    'w-full cursor-pointer appearance-none rounded border border-slate-200 bg-white px-3 py-2 pr-10 text-sm font-medium text-slate-800 outline-none',
  selectCompact:
    'w-full cursor-pointer appearance-none rounded border border-slate-200 bg-surface-subtle px-3.5 py-2 pr-10 text-xs font-semibold text-slate-700 outline-none',
  selectChevron:
    'pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[10px] text-slate-400',

  // Checkboxes
  checkboxGroup: 'flex flex-wrap gap-x-6 gap-y-3',
  checkboxLabel: 'flex cursor-pointer items-center gap-2 select-none',
  checkbox: 'h-4.5 w-4.5 rounded border-slate-300 text-slate-800 focus:ring-slate-500',
  checkboxSm: 'h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500',
  checkboxText: 'text-xs font-semibold text-slate-700',

  // Clause chips
  chipWrap: 'flex flex-wrap gap-2',
  chip: 'rounded border border-slate-200 bg-surface-subtle px-2.5 py-1 text-xs font-bold text-slate-500',

  // Evidence
  evidenceStack: 'space-y-3',
  evidenceRow: 'group flex items-center justify-between gap-2',
  evidenceLeft: 'flex min-w-0 items-center gap-2.5',
  evidenceIcon: 'shrink-0 text-xs text-slate-400',
  evidenceLabel: 'truncate text-xs font-semibold text-slate-700',
  evidenceMeta: 'shrink-0 text-[10px] font-medium text-slate-400',
  autoTag:
    'shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-wider text-slate-400 uppercase',
  removeBtn:
    'flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-300 opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-50 hover:text-red-500',
  addMoreWrap: 'border-t border-slate-100 pt-3',
  addMore:
    'flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-slate-200 py-2 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-300 hover:bg-surface-subtle hover:text-slate-600',

  // Actions
  actionsRow: 'flex items-center justify-end gap-5 pt-4',
  saveDraft: 'text-xs font-bold text-slate-400 transition-colors hover:text-slate-600',
  registerBtn:
    'flex items-center gap-2 rounded bg-surface-dark px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:opacity-90',
  registerIcon: 'text-[10px] font-black',
} as const;
