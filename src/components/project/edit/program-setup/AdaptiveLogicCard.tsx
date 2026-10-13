'use client';

import React from 'react';
import { Typography } from 'antd';
import { Sparkles } from 'lucide-react';

const { Title, Text } = Typography;

const AdaptiveLogicCard = () => {
  return (
    <div className="h-fit rounded-xl border border-blue-200 bg-[#E5EEFF] p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="text-theme-primary" size={20} />
        <Title level={4} className="text-theme-primary !mb-0 font-bold!">
          Adaptive Logic Active
        </Title>
      </div>

      {/* Description */}
      <Text className="mb-4 block text-gray-700">
        The fields on this form automatically adjust based on your selected{' '}
        <span className="font-semibold">NEC Form</span>.
      </Text>

      {/* Inner Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <Text className="mb-2 block text-xs font-semibold tracking-wide text-gray-500">
          CURRENT CONFIGURATION:
        </Text>

        <Title level={5} className="!mb-2 font-bold! !text-blue-700">
          ECC (Engineering and Construction Contract)
        </Title>

        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Primary roles defined as Employer and Contractor.</li>
          <li>Project Manager functionality enabled for later stages.</li>
          <li>Z Clauses tailored for main contract conditions.</li>
        </ul>
      </div>

      {/* Footer Note */}
      <Text className="mt-4 block text-gray-600">
        Changing to ECS (Subcontract) will relabel roles to Contractor and Subcontractor.
      </Text>
    </div>
  );
};

export default AdaptiveLogicCard;
