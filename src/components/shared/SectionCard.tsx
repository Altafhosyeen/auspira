/**
 * Section Card
 * Reusable card wrapper with rounded border and shadow.
 *
 * Two modes:
 *  - Plain wrapper: <SectionCard className="...">{children}</SectionCard>
 *  - With header:   <SectionCard number={1} title="..." badge="...">{children}</SectionCard>
 *    renders a numbered chip + title on the left and an uppercase badge on the right.
 */

import React from 'react';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  /** Numbered chip shown to the left of the title (enables the header). */
  number?: number;
  /** Section title shown next to the numbered chip. */
  title?: string;
  /** Muted uppercase label shown on the right of the header. */
  badge?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  className = '',
  number,
  title,
  badge,
}) => {
  const hasHeader = number !== undefined || title !== undefined || badge !== undefined;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${className}`}>
      {hasHeader && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {number !== undefined && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#14284B] text-xs font-bold text-white">
                {number}
              </span>
            )}
            {title && <h3 className="heading-card">{title}</h3>}
          </div>
          {badge && (
            <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

SectionCard.displayName = 'SectionCard';
