'use client';

/**
 * FeaturePageHeader
 * The icon-tile + title block that opens a full-page feature screen (Awareness,
 * Watchtower & Action Queue, …).
 *
 * Shared rather than repeated per page so the tile size, radius, border, shadow and
 * heading type stay identical across screens — these headers sit one navigation hop
 * apart, so any drift between them reads as two different products. Only the glyph and
 * its accent colour vary per feature; everything structural is fixed here.
 */

import type { LucideIcon } from 'lucide-react';
import type React from 'react';

export interface FeaturePageHeaderProps {
  /** Feature glyph. Sized by this component — pass the icon itself, not a styled node. */
  Icon: LucideIcon;
  title: string;
  /** Accent colour for the glyph only (e.g. `text-rose-500`). The tile stays neutral. */
  iconClassName?: string;
  /** Extra classes for the wrapper — spacing, mostly. */
  className?: string;
}

export const FeaturePageHeader: React.FC<FeaturePageHeaderProps> = ({
  Icon,
  title,
  iconClassName = 'text-main-p',
  className,
}) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_1px_2px_0_rgba(15,23,42,0.05)]">
      <Icon className={`h-[22px] w-[22px] ${iconClassName}`} aria-hidden="true" />
    </span>
    <h1 className="ds-heading-2! text-main-p my-0!">{title}</h1>
  </div>
);

FeaturePageHeader.displayName = 'FeaturePageHeader';

export default FeaturePageHeader;
