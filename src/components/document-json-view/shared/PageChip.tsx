import React from 'react';
import { ClickablePageTag } from './ClickablePageTag';
import { toSearchText } from './toSearchText';

interface PageChipProps {
  /** Raw page value from JSON — may be number, numeric string, null, or undefined. Renders nothing if invalid. */
  page: number | string | null | undefined;
  /** Text shown before the number. Defaults to "P". */
  prefix?: string;
  /**
   * Text to highlight in the PDF after jumping to the page. Accepts a raw JSON
   * value (string, object, or list) — it is normalised to a plain-text query so
   * object/array citations still produce a usable search.
   */
  searchText?: unknown;
  /**
   * Sibling values from the same record (a clause number, a title) that
   * disambiguate `searchText` when it appears more than once on the page —
   * forwarded straight to the PDF highlighter's ranking.
   */
  contextHints?: string[];
}

/** Coerce raw API page value to a valid positive integer, or null if invalid. */
export function toPageNumber(raw: number | string | null | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

/**
 * Clickable page-number pill — gray rounded-full chip, consistent across all meta panels.
 * Renders nothing if `page` is missing or non-numeric.
 */
export function PageChip({ page, prefix = 'P', searchText, contextHints }: PageChipProps) {
  const n = toPageNumber(page);
  if (n == null) return null;

  return (
    <ClickablePageTag page={n} searchText={toSearchText(searchText)} contextHints={contextHints}>
      <span className="inline-flex h-5! items-center justify-center rounded-full! bg-gray-400! px-3! text-[12px]! font-semibold! whitespace-nowrap text-white! transition-opacity hover:opacity-75!">
        {`${prefix} ${n}`}
      </span>
    </ClickablePageTag>
  );
}
