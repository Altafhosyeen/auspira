'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { STAT_CARDS } from '@/constants/org-dashboard.constants';

/** Thin caret used by the "x% than last month" footer — matches the design's stroked chevron. */
const DeltaCaret: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 10 10"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1.5 6.75 5 3.25l3.5 3.5" />
  </svg>
);

export const StatCardsSection: React.FC = () => (
  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
    {STAT_CARDS.map((card, i) => (
      <motion.div
        key={card.label}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.06, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
          >
            {card.icon}
          </span>
          <div className="min-w-0">
            <p className="!my-0 text-xs font-medium text-slate-500">{card.label}</p>
            <p className="!my-0 text-[26px] leading-tight font-bold tracking-tight text-slate-900">
              {card.value}
            </p>
          </div>
        </div>

        <p className="!my-0 flex items-center gap-1 text-xs">
          <DeltaCaret
            className={`h-2.5 w-2.5 shrink-0 ${
              card.deltaTone === 'negative' ? 'text-red-500' : 'text-emerald-500'
            }`}
          />
          <span
            className={`font-semibold ${
              card.deltaTone === 'negative' ? 'text-red-500' : 'text-emerald-500'
            }`}
          >
            {card.delta}
          </span>
          <span className="text-slate-400">{card.deltaLabel}</span>
        </p>
      </motion.div>
    ))}
  </div>
);

StatCardsSection.displayName = 'StatCardsSection';
