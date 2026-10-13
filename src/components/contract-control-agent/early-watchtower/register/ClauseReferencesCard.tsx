import React from 'react';
import { RegisterCard, CardEyebrow } from './register.ui';
import { clauseReferences } from './register.data';

const ClauseReferencesCard = () => (
  <RegisterCard>
    <div className="mb-3">
      <CardEyebrow>Clause References</CardEyebrow>
    </div>
    <div className="flex flex-wrap gap-2">
      {clauseReferences.map((ref) => (
        <span
          key={ref}
          className="badge-neutral border-badge-neutral-soft ds-caption rounded border px-2.5 py-1 font-bold"
        >
          {ref}
        </span>
      ))}
    </div>
  </RegisterCard>
);

export default ClauseReferencesCard;
