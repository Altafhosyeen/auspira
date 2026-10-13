'use client';

import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import { AlertTriangle, BookText } from 'lucide-react';
import type { EarlyWarningFormValues } from './EarlyWarningNoticeFormOld';

const Field = ({
  label,
  value,
  fallback,
}: {
  label: string;
  value?: React.ReactNode;
  /** Shown (muted) when value is empty — e.g. the field's placeholder text. */
  fallback?: string;
}) => {
  const isEmpty = value === undefined || value === null || value === '';

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
        {label}
      </span>
      <span className="text-sm whitespace-pre-line text-gray-800">
        {isEmpty ? <span className="text-gray-400">{fallback ?? '—'}</span> : value}
      </span>
    </div>
  );
};

const Card = ({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
      {icon}
      {title}
      {hint && <span className="text-xs font-normal text-gray-400">{hint}</span>}
    </h3>
    {children}
  </div>
);

interface Props {
  values: EarlyWarningFormValues;
}

const EarlyWarningNoticePreview = ({ values }: Props) => {
  const dateLabel = values.date ? dayjs(values.date).format('MM/DD/YYYY') : '';

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="heading-page my-0">Early Warning Notice Preview</h2>
        <p className="mt-1 mb-0 text-xs font-medium tracking-wide text-gray-400 uppercase">
          NEC4 Clause 15.1 · Early Warning Procedure
        </p>
      </div>

      {/* NEC4 banner */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
              <AlertTriangle size={18} className="text-rose-500" />
            </span>
            <Tag
              bordered={false}
              className="m-0 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-blue-600"
            >
              NEC4 ECC
            </Tag>
            <span className="text-base font-bold text-gray-900">NEC4 Early Warning Notice</span>
          </div>
          <Tag
            bordered={false}
            className="m-0 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white"
          >
            TIME CRITICAL
          </Tag>
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
          <p className="m-0 text-[13px] leading-relaxed text-blue-500">
            Clause 15 - Both parties must notify early warnings as soon as becoming aware of any
            matter affecting cost, time, or quality. All early warnings are recorded in the Early
            Warning Register.
          </p>
        </div>
      </div>

      {/* Project Context */}
      <Card title="Project Context" icon={<BookText size={15} className="text-gray-500" />}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <Field label="EW Reference" value={values.ewReference} />
          <Field label="Date" value={dateLabel} />
          <Field label="Project Name" value={values.projectName} />
          <Field label="Contract Reference" value={values.contractReference} />
        </div>
      </Card>

      {/* Communication Details */}
      <Card title="Communication Details">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <Field label="To" value={values.to} />
          <Field label="From" value={values.from} />
          {values.cc && <Field label="CC" value={values.cc} />}
          {values.bcc && <Field label="BCC" value={values.bcc} />}
        </div>
        <div className="mt-5">
          <Field label="Subject" value={values.subject} />
        </div>
      </Card>

      {/* Early Warning Matter */}
      <Card title="Early Warning Matter" hint="(for Early Warning Register)">
        <div className="flex flex-col gap-5">
          <Field
            label="Description of Matter"
            value={values.description}
            fallback="Describe the matter that could affect cost, time, or quality (per Clause 15)..."
          />
          <Field
            label="Potential Impacts"
            value={values.potentialImpacts}
            fallback="Describe potential impacts on cost, programme, or performance..."
          />
          <Field
            label="Proposed Mitigation Actions"
            value={values.proposedMitigation}
            fallback="Describe proposed actions to avoid or reduce the impact..."
          />
        </div>
      </Card>
    </div>
  );
};

export default EarlyWarningNoticePreview;
