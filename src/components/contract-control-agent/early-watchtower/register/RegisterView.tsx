'use client';

import React from 'react';
import { Button } from 'antd';
import { CheckCircleFilled, CheckOutlined } from '@ant-design/icons';
import EarlyWarningDetailsCard from './EarlyWarningDetailsCard';
import ImpactAssessmentCard from './ImpactAssessmentCard';
import ClauseReferencesCard from './ClauseReferencesCard';
import EvidenceCard from './EvidenceCard';
import FirstActionCard from './FirstActionCard';
import { EW_DETAILS } from './register.data';

const RegisterView = () => {
  return (
    <div className="text-text min-h-screen antialiased">
      <div className="mx-auto max-w-7xl">
        {/* --- Header --- */}
        <header className="mb-6">
          <h1 className="ds-heading-2 text-text tracking-tight">Register Early Warning</h1>
          <div className="mt-1.5 flex items-center gap-3">
            <p className="ds-body text-icon">
              Complete the details below. This creates a formal record in the EW Register and starts
              the lifecycle.
            </p>
            <span className="badge-success border-badge-success-soft ds-micro rounded border px-2 py-0.5 font-mono font-bold tracking-wider whitespace-nowrap">
              NEC4 Cl. 15.1
            </span>
          </div>
        </header>

        {/* --- Success Banner --- */}
        <div className="badge-success border-badge-success-soft mb-6 flex items-start gap-3 rounded border p-4">
          <CheckCircleFilled className="text-success mt-0.5 shrink-0 text-base" />
          <div className="ds-body leading-relaxed">
            Auspira has pre-filled fields from the contractor&apos;s email and attachments. Review,
            complete any gaps, then save.
          </div>
        </div>

        {/* --- Two-Column Layout --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Form */}
          <div className="space-y-6 lg:col-span-2">
            <EarlyWarningDetailsCard />
            <ImpactAssessmentCard />
          </div>

          {/* RIGHT: Reference & actions */}
          <div className="space-y-4 lg:col-span-1">
            <ClauseReferencesCard />
            <EvidenceCard />
            <FirstActionCard />

            <div className="flex items-center justify-end gap-5 pt-4">
              <button className="ds-caption text-icon hover:text-text font-bold transition-colors">
                Save draft
              </button>
              <Button type="primary" icon={<CheckOutlined />}>
                Register {EW_DETAILS.reference}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;
