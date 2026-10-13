'use client';

import { KPI_CARDS } from '@/components/contract-control-agent/early-watchtower/early-watchtower.data';
import EarlyWatchtowerFeedTable from '@/components/contract-control-agent/early-watchtower/EarlyWatchtowerFeedTable';
import React from 'react';

const EarlyWatchtowerPage = () => {
  return (
    <div className="text-text min-h-screen antialiased">
      <div className="mx-auto max-w-7xl">
        {/* --- Header --- */}
        <header className="mb-5">
          <div className="flex items-center gap-3">
            <h1 className="ds-heading-1 text-text tracking-tight">Watchtower</h1>
            <span className="badge-success border-badge-success-soft ds-micro rounded border px-2 py-0.5 font-mono font-bold tracking-wider">
              NEC4 Cl. 15.1
            </span>
          </div>
          <p className="ds-body text-icon mt-1.5">
            Auspira&apos;s 24/7 monitoring feed — what it&apos;s reading, what it found, when it
            last checked
          </p>
        </header>

        {/* --- KPI Grid --- */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="ds-body-strong text-text">{card.title}</h3>
                <span className="bg-success h-2 w-2 rounded-full" />
              </div>

              <div className="mt-2">
                <p className="ds-micro text-icon font-bold tracking-wider uppercase">
                  {card.lastLabel}
                </p>
                <p className="ds-body text-text mt-0.5 font-semibold">{card.lastValue}</p>
              </div>

              <div className="mt-2">
                <p className="ds-micro text-icon font-bold tracking-wider uppercase">
                  {card.metricLabel}
                </p>
                <p className="ds-body-large text-text mt-0.5">
                  {card.metricPrefix}
                  <span className={`font-bold ${card.metricHighlightClass}`}>
                    {card.metricHighlight}
                  </span>
                </p>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-2.5">
                <p className="ds-micro text-icon font-bold tracking-wider uppercase">
                  How it works
                </p>
                <p className="ds-caption text-text mt-1 leading-relaxed">{card.howItWorks}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- Main Data Feed Table --- */}
        <EarlyWatchtowerFeedTable />
      </div>
    </div>
  );
};

export default EarlyWatchtowerPage;
