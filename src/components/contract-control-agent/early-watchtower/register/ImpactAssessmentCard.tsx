'use client';

import React from 'react';
import { Checkbox, Input } from 'antd';
import { RegisterCard, FieldLabel } from './register.ui';
import { IMPACT, impactTypes } from './register.data';

/** Matches the register form's impact fields — see `register-early-warning/ImpactAssessmentCard`. */
const IMPACT_AUTO_SIZE = { minRows: 2, maxRows: 6 };

const ImpactAssessmentCard = () => (
  <RegisterCard className="space-y-4">
    <h3 className="ds-body-strong text-text border-b border-gray-100 pb-3">Impact Assessment</h3>

    {/* Full-width rows rather than a 2-up grid — as textareas these need the room. */}
    <div>
      <FieldLabel>Time Impact</FieldLabel>
      <Input.TextArea defaultValue={IMPACT.timeImpact} autoSize={IMPACT_AUTO_SIZE} />
    </div>

    <div>
      <FieldLabel>Cost Impact</FieldLabel>
      <Input.TextArea defaultValue={IMPACT.costImpact} autoSize={IMPACT_AUTO_SIZE} />
    </div>

    <div>
      <FieldLabel>Key Dates Affected</FieldLabel>
      <Input.TextArea defaultValue={IMPACT.keyDates} autoSize={IMPACT_AUTO_SIZE} />
    </div>

    <div>
      <FieldLabel>Impact Types</FieldLabel>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {impactTypes.map((item) => (
          <Checkbox
            key={item.value}
            defaultChecked={item.checked}
            className="ds-caption text-text font-semibold"
          >
            {item.label}
          </Checkbox>
        ))}
      </div>
    </div>
  </RegisterCard>
);

export default ImpactAssessmentCard;
