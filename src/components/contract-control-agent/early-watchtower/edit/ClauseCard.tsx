import React from 'react';
import { Card } from './Card';
import { triggers } from './early-watchtower-review.data';

const ClauseCard = () => (
  <Card className="p-5">
    <h4 className="ds-body-strong text-text">NEC4 Clause 15.1</h4>
    <div className="mt-3">
      <span className="badge-success border-badge-success-soft ds-micro inline-block rounded border px-2 py-0.5 font-mono font-bold">
        Cl. 15.1 - Early Warning
      </span>
    </div>
    <p className="ds-caption text-icon mt-3.5 leading-relaxed">
      Either party may give an early warning by notifying the other of any matter which could
      increase the total of the Prices, delay completion, delay meeting a Key Date or impair the
      performance of the works in use.
    </p>

    <div className="mt-5 border-t border-gray-100 pt-4">
      <p className="ds-micro text-icon font-extrabold tracking-wider uppercase">
        Detected triggers
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {triggers.map((trig) => {
          const Icon = trig.icon;
          return (
            <div
              key={trig.label}
              className={`ds-caption flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold ${trig.chipClass}`}
            >
              <Icon className="text-xs" />
              <span>{trig.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  </Card>
);

export default ClauseCard;
