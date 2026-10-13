'use client';

import React from 'react';
import { Button } from 'antd';
import { CheckCircleFilled, CheckOutlined } from '@ant-design/icons';
import EarlyWarningDetailsCard from '@/components/contract-control-agent/early-watchtower/register/EarlyWarningDetailsCard';
import ImpactAssessmentCard from '@/components/contract-control-agent/early-watchtower/register/ImpactAssessmentCard';
import ClauseReferencesCard from '@/components/contract-control-agent/early-watchtower/register/ClauseReferencesCard';
import EvidenceCard from '@/components/contract-control-agent/early-watchtower/register/EvidenceCard';
import FirstActionCard from '@/components/contract-control-agent/early-watchtower/register/FirstActionCard';
import { EW_DETAILS } from '@/components/contract-control-agent/early-watchtower/register/register.data';

const RegisterView = () => {
  return (
    <div className="text-text min-h-screen antialiased">
      <div className="mx-auto max-w-7xl">
        {/* --- Header --- */}
        <header className="">
          <h1 className="ds-heading-2 text-text tracking-tight">Register Early Warning</h1>
          <div className="flex items-center gap-3">
            <p className="ds-body text-icon">
              Complete the details below. This creates a formal record in the EW Register and starts
              the lifecycle.
            </p>
            <span className="badge-success border-badge-success-soft ds-micro -mt-2! rounded border px-2 py-0.5 font-mono font-bold tracking-wider whitespace-nowrap">
              NEC4 Cl. 15.1
            </span>
          </div>
        </header>

        {/* --- Success Banner --- */}
        <div className="badge-success border-badge-success-soft mb-2 flex items-start gap-3 rounded border p-4">
          <CheckCircleFilled className="text-success mt-0.5 flex-shrink-0 text-base" />
          <div className="ds-body leading-relaxed">
            Auspira has pre-filled fields from the contractor&apos;s email and attachments. Review,
            complete any gaps, then save.
          </div>
        </div>

        {/* --- Two-Column Layout --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Form */}
          <div className="space-y-2 lg:col-span-2">
            <EarlyWarningDetailsCard />
            <ImpactAssessmentCard />
          </div>

          {/* RIGHT: Reference & actions */}
          <div className="space-y-4 lg:col-span-1">
            <ClauseReferencesCard />
            <EvidenceCard />
            <FirstActionCard />

            <div className="flex items-center justify-end gap-5">
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
