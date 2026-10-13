import React from 'react';
import { Card, CardEyebrow } from './Card';
import { threadItems } from './early-watchtower-review.data';

const EmailThreadCard = () => (
  <Card className="p-5">
    <CardEyebrow>Email Thread</CardEyebrow>
    <div className="ds-caption relative mt-4 ml-1 space-y-3.5 border-l border-gray-100 pl-3">
      {threadItems.map((item) => (
        <div key={item.id} className={`relative ${item.active ? '' : 'text-icon'}`}>
          <span
            className={`absolute top-1.5 -left-[16px] h-2.5 w-2.5 rounded-full border-2 border-white ${
              item.active ? 'bg-surface-dark' : 'bg-icon'
            }`}
          />
          <p className={item.active ? 'text-text font-semibold' : ''}>{item.label}</p>
        </div>
      ))}
    </div>
  </Card>
);

export default EmailThreadCard;
