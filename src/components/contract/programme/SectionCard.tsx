import React from 'react';

export interface SectionCardProps {
  number: number;
  title: string;
  badge: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ number, title, badge, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="ds-caption! bg-main-p! flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold! text-white">
          {number}
        </span>
        <h3 className="heading-card">{title}</h3>
      </div>
      <span className="ds-micro! font-semibold! tracking-wider text-slate-700 uppercase">
        {badge}
      </span>
    </div>
    {children}
  </div>
);

SectionCard.displayName = 'SectionCard';
