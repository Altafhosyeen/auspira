import { DETAIL_COLORS } from './compensation-event-detail.theme';

export type CompensationEventOverviewTone =
  | 'estimate'
  | 'time'
  | 'implemented'
  | 'schedule'
  | 'cost'
  | 'days'
  | 'decision';

// Overview tiles are outlined rather than filled — the Financials tab already owns the
// tinted KPI strip, so the two tabs do not read as the same panel twice.
export const OVERVIEW_TILE_TONES: Record<
  CompensationEventOverviewTone,
  { chip: string; icon: string }
> = {
  estimate: { chip: DETAIL_COLORS.chipViolet, icon: '#773FE6' },
  time: { chip: DETAIL_COLORS.chipAmber, icon: '#F9480F' },
  implemented: { chip: DETAIL_COLORS.chipMint, icon: DETAIL_COLORS.approvedValue },
  schedule: { chip: DETAIL_COLORS.chipBlue, icon: DETAIL_COLORS.main },
  cost: { chip: DETAIL_COLORS.chipViolet, icon: '#773FE6' },
  days: { chip: DETAIL_COLORS.chipMint, icon: DETAIL_COLORS.approvedValue },
  decision: { chip: DETAIL_COLORS.chipAmber, icon: '#F9480F' },
};

export const OVERVIEW_STEPPER_COLORS = {
  complete: DETAIL_COLORS.main,
  pending: '#D9D9D9',
  pendingText: DETAIL_COLORS.textMuted,
  // The stage the record sits at now — drawn as a hollow ring on the Lifecycle rail.
  current: '#F9480F',
} as const;

export const OVERVIEW_COLORS = {
  value: DETAIL_COLORS.text,
  muted: DETAIL_COLORS.textMuted,
  // Tile captions sit darker than `muted` — they are read as headings for the figure
  // beneath them, where the muted grey is reserved for absent or inactive values.
  label: '#4A5568',
  divider: DETAIL_COLORS.rowDivider,
  noteBg: DETAIL_COLORS.noteBg,
  clauseChipBg: DETAIL_COLORS.mainSoft,
  clauseChipBorder: DETAIL_COLORS.tagBorder,
  navy: DETAIL_COLORS.main,
  yes: DETAIL_COLORS.approvedValue,
  no: DETAIL_COLORS.textMuted,
} as const;

export const OVERVIEW_SIZES = {
  gutter: 20,
  cardGap: 18,
  tilePadding: 18,
  tileChip: 34,
  tileChipRadius: 8,
  tileIconFontSize: 16,
  tileLabelFontSize: 13,
  tileValueFontSize: 16,
  tileCaptionFontSize: 10,
  rowFontSize: 12,
  bodyFontSize: 13,
  clauseNumberFontSize: 16,
  clauseChipPadding: '6px 14px',
  flagFontSize: 11,
  stepperNodeSize: 36,
  stepperNodeFontSize: 16,
  stepperLineWidth: 87,
  stepperLabelFontSize: 11,
  lifecyclePadding: '22px 24px',
  lifecycleDot: 12,
  lifecycleGap: 18,
  lifecycleLabelFontSize: 13,
  lifecycleDateFontSize: 12,
  summaryPadding: '20px 26px',
  summaryRowGap: 18,
  // Applied above and below each row, so a field's text sits clear of the hairlines on
  // either side of it and the rules read as separators rather than underlines.
  summaryRowPaddingBlock: 16,
  // The label column is fixed rather than sized to its content, so every value in the
  // card starts on one left edge instead of floating out to the card's right edge.
  summaryLabelWidth: 200,
} as const;
