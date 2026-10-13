import React from 'react';
import { MailOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Card } from './Card';
import { EMAIL_META } from './early-watchtower-review.data';

const ContractorEmailCard = () => (
  <Card className="overflow-hidden">
    {/* Header */}
    <div className="bg-surface-subtle flex items-center justify-between border-b border-gray-100 px-5 py-3">
      <div className="text-text flex items-center gap-2">
        <MailOutlined className="text-sm" />
        <span className="ds-caption font-bold">Contractor Email — As Received</span>
      </div>
      <span className="ds-caption text-icon">{EMAIL_META.receivedAt}</span>
    </div>

    {/* Metadata */}
    <div className="ds-caption space-y-2.5 border-b border-gray-100 bg-white px-5 py-4">
      <div className="grid grid-cols-12 gap-1">
        <span className="text-icon col-span-2 font-medium">From</span>
        <div className="text-text col-span-10 flex flex-wrap items-center gap-2">
          <span className="text-text font-semibold">{EMAIL_META.fromName}</span>
          <span className="text-icon">&lt;{EMAIL_META.fromAddress}&gt;</span>
          <span className="bg-surface-dark ds-micro rounded px-1.5 py-0.5 font-bold tracking-wider text-white uppercase">
            CONTRACTOR
          </span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1">
        <span className="text-icon col-span-2 font-medium">To</span>
        <div className="text-text col-span-10">
          <span className="text-text font-semibold">{EMAIL_META.toName}</span>
          <span className="text-icon"> &lt;{EMAIL_META.toAddress}&gt;</span>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1">
        <span className="text-icon col-span-2 font-medium">Subject</span>
        <div className="text-text col-span-10 font-bold">{EMAIL_META.subject}</div>
      </div>
      <div className="grid grid-cols-12 gap-1">
        <span className="text-icon col-span-2 font-medium">Attachments</span>
        <div className="text-main-p col-span-10 flex cursor-pointer items-center gap-1.5 font-medium hover:underline">
          <PaperClipOutlined className="text-icon text-xs" />
          <span>{EMAIL_META.attachment}</span>
        </div>
      </div>
    </div>

    {/* Message body */}
    <div className="ds-body text-text space-y-4 p-6">
      <p>Sarah,</p>
      <p>
        Following our site meeting on Thursday, I wanted to confirm in writing that we are now
        forecasting a <span className="text-text font-bold">3-4 week slippage on piling</span> due
        to unexpectedly poor ground conditions in the north-east quadrant (see attached geotech
        update).
      </p>
      <p>
        This will likely push the structural steel sequence and could affect the Section 1
        completion date of 14 August. We have not yet quantified the cost impact but expect this to
        be material.
      </p>
      <p>Please advise on next steps.</p>
      <p className="text-icon pt-2">
        Regards,
        <br />
        <span className="text-text font-medium">James Whitmore</span> - Site Manager, BuildCo Ltd
      </p>
    </div>
  </Card>
);

export default ContractorEmailCard;
