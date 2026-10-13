'use client';

import { Input, Select } from 'antd';
import React from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { EW_DETAILS, raisedByOptions } from './register.data';
import { FieldLabel, RegisterCard } from './register.ui';

const { TextArea } = Input;

const EarlyWarningDetailsCard = () => (
  <RegisterCard className="space-y-4">
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <h3 className="ds-body-strong text-text">Early Warning Details</h3>
      {/* <span className="ds-micro text-icon font-mono tracking-wide uppercase">
        Auto-ref: {EW_DETAILS.reference}
      </span> */}
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <FieldLabel>EW Reference</FieldLabel>
        <DisabledTooltip
          disabled
          reason="EW reference numbers are generated automatically and cannot be edited."
        >
          <Input value={EW_DETAILS.reference} disabled />
        </DisabledTooltip>
      </div>
      <div>
        <FieldLabel>Raised by</FieldLabel>
        <Select
          className="w-full"
          defaultValue={raisedByOptions[0].value}
          options={raisedByOptions}
        />
      </div>
    </div>

    <div>
      <FieldLabel>
        Risk Title <span className="text-error">*</span>
      </FieldLabel>
      <Input defaultValue={EW_DETAILS.riskTitle} />
    </div>

    <div>
      <FieldLabel>Risk Description</FieldLabel>
      <TextArea
        rows={4}
        defaultValue={EW_DETAILS.riskDescription}
        className="ds-caption text-text resize-none leading-relaxed"
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <FieldLabel>Date Raised</FieldLabel>
        <Input defaultValue={EW_DETAILS.dateRaised} />
      </div>
      <div>
        <FieldLabel>Source</FieldLabel>
        <DisabledTooltip
          disabled
          reason="The source is detected automatically from the originating alert and cannot be edited."
        >
          <Input value={EW_DETAILS.source} disabled />
        </DisabledTooltip>
      </div>
    </div>
  </RegisterCard>
);

export default EarlyWarningDetailsCard;
