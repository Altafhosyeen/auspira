import { ContractDocumentType } from '@/constants/enum.constant';

// Enum definition lives in constants/enum.constant.ts; re-exported here so the
// existing `@/lib/utils/document.type.code` import path keeps working.
export { ContractDocumentType };

/**
 * Labels / descriptions
 */
export const ContractDocumentLabels: Record<number, string> = {
  1: 'The primary executing document.',
  2: 'Part 1',
  3: 'Part 2',
  4: 'Core & Main Options',
  5: 'Additional conditions',
  6: 'Scope & specifications',
  7: 'Conditions & data',
  8: 'Pricing document',
  9: 'Bill of quantities',
  10: 'Primavera schedule',
  11: 'Insurance certificate',
  12: 'CE register',
  13: 'A1 document',
  14: 'B1 document',
  15: 'C1 document',
  16: 'C2 document',
  17: 'C3 document',
  18: 'D1 document',
  19: 'D2 document',
  20: 'D3 document',
  21: 'E1 document',
  22: 'F1 document',
  23: 'HSQE document',
};

/**
 * Pass enum name -> return number
 * Example:
 * getDocumentTypeValue('WorksInfo')
 * => 6
 */
export const getDocumentTypeValue = (name: keyof typeof ContractDocumentType): number => {
  return ContractDocumentType[name];
};

/**
 * Pass number -> return enum name
 * Example:
 * getDocumentTypeName(4)
 * => "Conditions"
 */
export const getDocumentTypeName = (value: number): string | undefined => {
  return ContractDocumentType[value];
};

/** Space out a PascalCase enum name for display, e.g. "WorksInfo" -> "Works Info". */
const humanizeTypeName = (raw: string): string =>
  raw
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .trim();

/**
 * Display names that differ from the humanized enum identifier — the enum member
 * stays as-is because the backend contract and hooks key off it.
 */
const DISPLAY_NAME_OVERRIDES: Record<number, string> = {
  [ContractDocumentType.Primavera]: 'Program File',
};

/**
 * Pass number -> return a human, spaced display name (unlike `getDocumentTypeName`,
 * which returns the raw enum identifier — fine for lookups, unreadable when shown
 * directly in the UI, e.g. "WorksInfo" / "SiteInfo" with no space).
 * Example:
 * getDocumentTypeDisplayName(6)
 * => "Works Info"
 */
export const getDocumentTypeDisplayName = (value: number): string => {
  const override = DISPLAY_NAME_OVERRIDES[value];
  if (override) return override;

  const raw = ContractDocumentType[value];
  return raw ? humanizeTypeName(raw) : `Document ${value}`;
};

/**
 * Pass number -> return label/description
 * Example:
 * getDocumentLabel(4)
 * => "Core & Main Options"
 */
export const getDocumentLabel = (value: number): string => {
  return ContractDocumentLabels[value] || '';
};

/**
 * Pass enum name -> return label
 * Example:
 * getDocumentLabelByName('ZClauses')
 * => "Additional conditions"
 */
export const getDocumentLabelByName = (name: keyof typeof ContractDocumentType): string => {
  const value = ContractDocumentType[name];

  return ContractDocumentLabels[value] || '';
};
