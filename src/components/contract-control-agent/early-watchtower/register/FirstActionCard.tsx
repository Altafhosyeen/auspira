'use client';

import React from 'react';
import { Select } from 'antd';
import { RegisterCard, CardEyebrow } from './register.ui';
import { firstActionOptions } from './register.data';

const FirstActionCard = () => (
  <RegisterCard>
    <div className="mb-3">
      <CardEyebrow>First action after registering</CardEyebrow>
    </div>
    <Select
      className="w-full"
      defaultValue={firstActionOptions[0].value}
      options={firstActionOptions}
    />
  </RegisterCard>
);

export default FirstActionCard;
