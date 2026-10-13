import React from 'react';
import { WarningOutlined } from '@ant-design/icons';
import { Card } from './Card';
import { missingFields } from './early-watchtower-review.data';

const MissingFieldsCard = () => (
  <Card className="p-5">
    <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
      <div className="flex items-center gap-2">
        <WarningOutlined className="text-badge-warning text-sm" />
        <h4 className="ds-caption text-text font-bold">Missing from contractor&apos;s email</h4>
      </div>
      {/* <span className="ds-micro text-badge-warning font-bold">3 gaps found</span> */}
    </div>

    <div className="mt-4 space-y-4">
      {missingFields.map((field) => (
        <div key={field.id} className="flex items-start gap-3">
          <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${field.dotClass}`} />
          <div>
            <h5 className="ds-caption text-text font-semibold">{field.title}</h5>
            <p className="ds-caption text-icon mt-0.5 leading-normal">{field.description}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default MissingFieldsCard;
