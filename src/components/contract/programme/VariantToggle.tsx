import React from 'react';
import type { ProgrammeVariant } from './types';

export interface VariantToggleProps {
  variant: ProgrammeVariant;
  onChange: (variant: ProgrammeVariant) => void;
}

export const VariantToggle: React.FC<VariantToggleProps> = ({ variant, onChange }) => (
  <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
    {(['accepted', 'revised'] as const).map((value) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={`ds-caption! rounded-md px-3 py-1.5 font-semibold! transition-colors ${
          variant === value ? 'bg-main-p! text-white!' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {value === 'accepted' ? 'Accepted Programme' : 'Revised Programme'}
      </button>
    ))}
  </div>
);

VariantToggle.displayName = 'VariantToggle';
