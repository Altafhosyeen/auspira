import type { CompensationEventEvidenceKind } from '../types/compensation-event.types';
import { FINANCIALS_COLORS } from './compensation-event-financials.theme';
import { REGISTER_COLORS } from './compensation-event-register.theme';

// Figma palette for the Compensation Event Details → Evidence & Thread tab.
export const EVIDENCE_COLORS = {
  contractorChipBg: '#F3E8FF',
  contractorChipText: '#773FE6',
  pmChipBg: '#E3FCEF',
  pmChipText: FINANCIALS_COLORS.positive,
  divider: REGISTER_COLORS.rowDivider,
  rowHoverBg: '#F5FAFE',
  columnLabel: '#8A93A2',
  threadCardBorder: REGISTER_COLORS.cardBorder,
  threadSubjectLink: '#0078D4',
  threadInboundBg: '#D1FAE5',
  threadInboundText: '#059669',
  threadOutboundBg: '#DBEAFE',
  threadOutboundText: '#1E40AF',
} as const;

export const EVIDENCE_KIND_TONES: Record<
  CompensationEventEvidenceKind,
  { background: string; color: string }
> = {
  PDF: { background: '#FEE7EA', color: FINANCIALS_COLORS.negative },
  XLSX: { background: '#E3FCEF', color: FINANCIALS_COLORS.positive },
  DOCX: { background: REGISTER_COLORS.mainSoft, color: REGISTER_COLORS.main },
  ZIP: { background: REGISTER_COLORS.mainSoft, color: REGISTER_COLORS.main },
  IMAGE: { background: REGISTER_COLORS.mainSoft, color: REGISTER_COLORS.main },
  FILE: { background: REGISTER_COLORS.mainSoft, color: REGISTER_COLORS.main },
};

export const EVIDENCE_SIZES = {
  threadPadding: '28px 17px 28px 18px',
  threadBodyGap: 13.222,
  threadBodyInline: 20.306,
  threadFontSize: 13,
  threadCardRadius: 8,
  threadCardPadding: '12px 16px',
  threadCardGap: 10,
  threadDirectionIcon: 24,
  threadDirectionGlyph: 13,
  threadCardAvatar: 40,
  threadCardAvatarFontSize: 13,
  threadSenderFontSize: 14,
  threadSubjectFontSize: 13,
  threadSnippetFontSize: 12,
  threadMetaFontSize: 12,
  threadBadgeFontSize: 10,
  packPadding: '17px 17px 17px 18px',
  packBodyGap: 15,
  packColumnGap: 24,
  packGridMinWidth: 804,
  packNameColumn: 'minmax(220px, 1fr)',
  packRowGap: 20,
  packFileChip: 36,
  packFileChipRadius: 6,
  packFileIconFontSize: 20,
  packMetaColumn: 132,
  // The Documents and Email Thread toolbars share the Audit Trail's search proportions
  // so the three detail tabs present one control set.
  toolbarSearchWidth: 320,
  packFontSize: 13,
  packColumnFontSize: 11,
  packRowPaddingInline: 8,
  packRowPaddingBlock: 10,
  packRowRadius: 8,
  packDownloadFontSize: 18,
  packDownloadButton: 32,
} as const;

// One source of truth for the Documents / Attachments table: the header and every row
// share these tracks, so a label can never drift out of line with the values under it.
// The name column takes all the slack; TYPE, UPLOADED and SIZE then share one width, so
// the meta columns read as an even rhythm rather than three different gaps. The download
// button sits directly after SIZE, at the end of the row.
export const EVIDENCE_PACK_GRID_COLUMNS = [
  `${EVIDENCE_SIZES.packFileChip}px`,
  EVIDENCE_SIZES.packNameColumn,
  `repeat(3, ${EVIDENCE_SIZES.packMetaColumn}px)`,
  `${EVIDENCE_SIZES.packDownloadButton}px`,
].join(' ');
