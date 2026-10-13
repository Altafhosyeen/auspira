'use client';

import React from 'react';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import ContractorEmailCard from './ContractorEmailCard';
import AuspiraAssessmentCard from './AuspiraAssessmentCard';
import MissingFieldsCard from './MissingFieldsCard';
import ClauseCard from './ClauseCard';
import ConfidenceCard from './ConfidenceCard';
import EmailThreadCard from './EmailThreadCard';
import SourceTypeCard from './SourceTypeCard';
import DecisionPanel from './DecisionPanel';

const FLAGGED_SUMMARY =
  'Auspira has flagged this as a possible Early Warning. Review before any register entry is created.';

const EarlyWatchtowerReview = () => {
  return (
    <div className="bg-surface-muted text-text min-h-screen px-6 py-8 antialiased">
      <div className="mx-auto max-w-7xl">
        {/* --- Header --- */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="ds-heading-1 text-text tracking-tight">Review — Contractor Email</h1>
            <span className="badge-success border-badge-success-soft ds-micro rounded border px-2 py-0.5 font-mono font-bold tracking-wider">
              NEC4 Cl. 15.1
            </span>
            {/* Flag rationale moved off the page and onto this icon. Icon is aria-hidden — the
                sentence below carries it for screen readers, which cannot hover. */}
            <Tooltip title={FLAGGED_SUMMARY}>
              <InfoCircleOutlined
                aria-hidden
                className="text-icon cursor-help text-base transition-colors hover:text-slate-600"
              />
            </Tooltip>
          </div>
          <p className="sr-only">{FLAGGED_SUMMARY}</p>
        </header>

        {/* --- Top Alert Banner --- */}
        <div className="badge-warning border-badge-warning-soft mb-6 flex items-start gap-3.5 rounded-lg border p-4">
          <WarningOutlined className="text-badge-warning mt-0.5 flex-shrink-0 text-base" />
          <div className="ds-body leading-relaxed">
            <span className="font-bold">No Early Warning has been registered yet.</span> According
            to Clause 15.1, this communication may constitute an Early Warning — but the
            contractor&apos;s email is missing required information. Your decision is needed.
          </div>
        </div>

        {/* --- Two-Column Layout --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            <ContractorEmailCard />
            <AuspiraAssessmentCard />
            <MissingFieldsCard />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4 lg:col-span-1">
            <ClauseCard />
            <ConfidenceCard />
            <EmailThreadCard />
            <SourceTypeCard />
          </div>
        </div>

        {/* --- Decision Action Panel --- */}
        <DecisionPanel />
      </div>
    </div>
  );
};

export default EarlyWatchtowerReview;
