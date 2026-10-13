'use client';

import React from 'react';
import { RegisterCard, CardEyebrow } from './register.ui';
import { evidenceItems } from './register.data';

const EvidenceCard = () => (
  <RegisterCard className="space-y-4">
    <div className="border-b border-gray-100 pb-3">
      <CardEyebrow>Evidence auto-attached</CardEyebrow>
    </div>

    <div className="space-y-3">
      {evidenceItems.map((item) => (
        <div key={item.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {item.icon}
            <span className="ds-caption text-text font-semibold">{item.label}</span>
          </div>
          {item.isAuto && (
            <span className="badge-neutral ds-micro text-icon rounded px-1.5 py-0.5 font-extrabold tracking-wider uppercase">
              AUTO
            </span>
          )}
        </div>
      ))}
    </div>

    <div className="border-t border-gray-100 pt-2">
      <span className="ds-caption text-icon hover:text-text cursor-pointer font-semibold">
        + Add more documents
      </span>
    </div>
  </RegisterCard>
);

export default EvidenceCard;
