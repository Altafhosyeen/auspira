// Shared presentation tokens for the audit timeline. Both the Early Warning and the
// Compensation Event trails render through these so the two can never drift apart.
export const AUDIT_TIMELINE = {
  paddingTop: 8,
  paddingLeft: 8,
  itemGap: 6,
  itemPaddingBottom: 16,
  headerGap: 12,
  titleGap: 8,
  metaGap: 8,
  titleFontSize: 14,
  titleColor: '#101828',
  tagFontSize: 11,
  tagPadding: '2px 8px',
  tagRadius: 4,
  timeFontSize: 12,
  metaFontSize: 13,
} as const;

// A tinted pill whose text, background and border share one hue.
export interface AuditTagTone {
  color: string;
  bgColor: string;
  borderColor: string;
}

// Fallback tone for a tag whose source value has no mapping of its own.
export const AUDIT_TAG_FALLBACK_TONE: AuditTagTone = {
  color: '#1D39C4',
  bgColor: '#F0F5FF',
  borderColor: '#ADC6FF',
};
