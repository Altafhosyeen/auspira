import type { AuditTagTone } from '@/components/shared/audit-trail';
import type { CompensationEventAuditAction } from '../types/compensation-event.types';

// Layout tokens live with the shared timeline row; re-exported so existing
// module-local imports keep working.
export { AUDIT_TIMELINE } from '@/components/shared/audit-trail';

export const AUDIT_SIZES = {
  cardPadding: '26px 36px',
  toolbarGap: 8,
  toolbarHeight: 44,
  searchWidth: 320,
  filtersWidth: 143,
  // The action vocabulary runs past 20 entries, so the dropdown scrolls instead of
  // running off the bottom of the viewport.
  filtersMenuMaxHeight: 320,
  toolbarBottomGap: 20,
  rowMinWidth: 900,
  rowPaddingBlock: 15,
  rowPaddingInline: 18,
  rowGap: 25,
  headerRadius: 6,
  headerPaddingBlock: 12,
  headerPaddingInline: 18,
  headerFontSize: 12,
  dateColumnWidth: 135,
  actorColumnWidth: 190,
  actionColumnWidth: 255,
  actionDot: 7,
  actionDotGap: 10,
  dateFontSize: 13,
  timeFontSize: 12,
  actorFontSize: 13,
  actorRoleFontSize: 11,
  actionFontSize: 13,
  detailsFontSize: 12,
  footerGap: 30,
  footerPaddingTop: 20,
  footerFontSize: 13,
  loadMoreHeight: 37,
} as const;

// Tag tones per logged action — mirrors the EW stage tags: a tinted pill whose
// text/background/border share one hue. Each action gets its own hue, drawn from
// distinct colour families rather than steps along one ramp: stretching a single
// family far enough to separate its members lands in washed-out lime/yellow.
// Green is reserved for the positive terminal states (Approved / Implemented /
// Closed); the other lifecycle actions take their own saturated hue.
export const AUDIT_ACTION_TAG_TONES: Record<CompensationEventAuditAction, AuditTagTone> = {
  CREATED: { color: '#AD4E00', bgColor: '#FFF7E6', borderColor: '#FFD591' },
  DETECTED: { color: '#0958D9', bgColor: '#E6F4FF', borderColor: '#91CAFF' },
  LIFECYCLE_COMPLETED: { color: '#00646B', bgColor: '#E6FFFB', borderColor: '#87E8DE' },
  MITIGATION_AGREED: { color: '#7A4C00', bgColor: '#FFF8E6', borderColor: '#FFD666' },
  RISK_REDUCTION_MEETING_INVITE_SENT: {
    color: '#1D39C4',
    bgColor: '#F0F5FF',
    borderColor: '#ADC6FF',
  },
  UPDATED: { color: '#096DD9', bgColor: '#F0F7FF', borderColor: '#BAE0FF' },
  STATUS_CHANGED: { color: '#10239E', bgColor: '#F0F2FF', borderColor: '#9CB0FF' },
  LOCKED: { color: '#595959', bgColor: '#FAFAFA', borderColor: '#D9D9D9' },
  UNLOCKED: { color: '#707070', bgColor: '#FFFFFF', borderColor: '#D9D9D9' },
  DOCUMENT_UPLOADED: { color: '#0F4C81', bgColor: '#EDF7FF', borderColor: '#A6D0F5' },
  EVIDENCE_ADDED: { color: '#531DAB', bgColor: '#F9F0FF', borderColor: '#D3ADF7' },
  DECISION_RECORDED: { color: '#873800', bgColor: '#FFF6E6', borderColor: '#FFC069' },
  REVIEWED: { color: '#C41D7F', bgColor: '#FFF0F6', borderColor: '#FFADD2' },
  APPROVED: { color: '#237804', bgColor: '#F6FFED', borderColor: '#95DE64' },
  REVISION_REQUESTED: { color: '#AD2102', bgColor: '#FFF2E8', borderColor: '#FFBB96' },
  REJECTED: { color: '#CF1322', bgColor: '#FFF1F0', borderColor: '#FFA39E' },
  IMPLEMENTED: { color: '#2B7A0B', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  CLOSED: { color: '#135200', bgColor: '#F0F9E8', borderColor: '#7CB305' },
  COMMENT_ADDED: { color: '#391085', bgColor: '#F4F0FF', borderColor: '#B37FEB' },
  ACCEPTED: { color: '#389E0D', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  CONFIRMED: { color: '#08979C', bgColor: '#E6FFFB', borderColor: '#5CDBD3' },
  NOT_ACCEPTED: { color: '#A8071A', bgColor: '#FFF1F0', borderColor: '#FFA39E' },
  DISCARDED: { color: '#595959', bgColor: '#FAFAFA', borderColor: '#D9D9D9' },
};

// Timeline dot per action — the tag's own hue, so the marker and the pill never
// disagree about what kind of activity a row is.
export const AUDIT_ACTION_COLORS: Record<CompensationEventAuditAction, string> = Object.fromEntries(
  Object.entries(AUDIT_ACTION_TAG_TONES).map(([action, tone]) => [action, tone.color])
) as Record<CompensationEventAuditAction, string>;
