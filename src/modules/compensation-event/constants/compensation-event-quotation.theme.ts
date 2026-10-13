import type { ThemeConfig } from 'antd';
import { NOTICE_COLORS, NOTICE_SIZES, NOTICE_THEME } from './compensation-event-notice.theme';

// The Contractor Quotation frame reuses the Notice palette and adds the submitted
// badge, the table chrome and the member avatar tints.
export const QUOTATION_COLORS = {
  ...NOTICE_COLORS,
  submittedText: '#0CBE73',
  submittedBg: '#E1FAEF',
  submittedBorder: 'rgba(12, 190, 115, 0.4)',
  headerText: '#6F6B7D',
  rowDivider: '#EEF0F3',
  groupBoxBorder: '#E3E7EC',
  amount: '#1F2937',
  memberName: '#3A3541',
} as const;

export const QUOTATION_SIZES = {
  ...NOTICE_SIZES,
  memberAvatar: 20,
  categoryAvatar: 24,
  categoryChipRadius: 7,
  headerFontSize: 11,
  headerLetterSpacing: 0.4,
  cellFontSize: 12,
  memberFontSize: 11,
  totalFontSize: 13,
  chevronFontSize: 9,
  // The info icon that carries a row's description once the DESCRIPTION column is dropped.
  hintFontSize: 11,
  // The flat summary card: a label and an outlined figure per line, no table chrome.
  summaryRowGap: 14,
  summaryLabelFontSize: 14,
  summaryAmountWidth: 120,
  summaryAmountRadius: 6,
  summaryAmountPaddingBlock: 5,
  // antd drops its own indent span once `showExpandColumn` is off, so the member rows
  // are stepped in from inside the ITEM cell instead.
  memberIndent: 28,
  amountInputWidth: 104,
  // The closed picker only ever shows a reference, so it stays heading-sized; the popup
  // opens wider than the control because the options carry the event title as well.
  referenceSelectWidth: 190,
  referenceSelectHeight: 20,
  referenceSelectPopupWidth: 340,
  labelColumnSpan: 8,
  // Programme Impact sets its own label column: the frame runs the value hard against the
  // label rather than out at the card's midpoint, and spaces the claim lines by this gap
  // now that no divider separates them.
  programmeLabelSpan: 6,
  programmeRowGap: 12,
  programmeFontSize: 14,
  // A collapsed group is drawn as its own outlined block rather than a table row, so it
  // takes over all three columns and lays them out again at these widths.
  itemColumnWidth: '32%',
  amountColumnWidth: '22%',
  groupBoxRadius: 8,
  groupBoxGap: 5,
  groupBoxPaddingBlock: 12,
  // The table's own cell inset — shared with the group box so a boxed row's ITEM,
  // DESCRIPTION and AMOUNT text starts exactly where the header's does.
  cellPaddingInline: 8,
} as const;

// Member avatars are tinted from a fixed set so the same person keeps one colour
// across every line of the quotation.
export const QUOTATION_MEMBER_TINTS = [
  { background: '#E6F4FF', color: '#1677FF' },
  { background: '#FFF1E6', color: '#FA6E1E' },
  { background: '#E1FAEF', color: '#0CBE73' },
] as const;

export const QUOTATION_THEME: ThemeConfig = {
  token: NOTICE_THEME.token,
  components: {
    ...NOTICE_THEME.components,
    Table: {
      // Both quotation tables draw the column row on the soft blue band.
      headerBg: QUOTATION_COLORS.mainSoft,
      headerColor: QUOTATION_COLORS.headerText,
      headerSplitColor: 'transparent',
      // The frame rules only between groups, never under every row, so the default cell
      // border is cleared and each table draws its own divider through `onCell`.
      borderColor: 'transparent',
      cellPaddingBlock: 10,
      cellPaddingInline: QUOTATION_SIZES.cellPaddingInline,
      rowHoverBg: 'transparent',
    },
    InputNumber: {
      controlHeight: 32,
      borderRadius: NOTICE_SIZES.controlRadius,
    },
  },
};
