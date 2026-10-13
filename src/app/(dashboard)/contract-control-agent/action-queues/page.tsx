'use client';

import { Tag } from 'antd';
import { ArrowDown, ArrowRight, CircleCheck } from 'lucide-react';
import React from 'react';
import {
  mapProjectEmailsToSources,
  type ProjectEmailSource,
  QUEUE_STATS,
} from '@/components/contract-control-agent/action-queue.data';
import MailboxSourceCard from '@/components/contract-control-agent/MailboxSourceCard';
import PageX from '@/components/shared/PageX';
import { useGetProjectEmails } from '@/hooks/modules/project';
import { useProjectStore } from '@/store/project.store';

const Page = () => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  const { data: projectEmails } = useGetProjectEmails<ProjectEmailSource[]>(
    selectedProjectId || undefined
  );

  const mailboxSources = React.useMemo(
    () => mapProjectEmailsToSources(projectEmails),
    [projectEmails]
  );

  return (
    <PageX
      heading="Sources feeding the EW queue"
      subheading="Every inbound and outbound contract communication is intercepted, classified, and routed. Nothing reaches a register without a clause tag and an audit row."
    >
      {/* Mailbox source cards */}
      {mailboxSources.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {mailboxSources.map((source) => (
            <MailboxSourceCard key={source.id} source={source} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          {selectedProjectId
            ? 'No intercepted communications for this project yet.'
            : 'Select a project to view its intercepted communications.'}
        </div>
      )}

      {/* Flow arrow */}
      <div className="my-4 flex justify-center text-gray-300">
        <ArrowDown size={20} />
      </div>

      {/* Contract Control Agent bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
              <CircleCheck size={18} className="text-violet-600" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">Contract Control Agent</span>
              <span className="text-xs text-gray-500">
                Classify · extract · score urgency · time-stamp the awareness date
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag
              bordered={false}
              className="m-0 rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-medium text-gray-600"
            >
              Cl. 15.1
            </Tag>
            <Tag
              bordered={false}
              className="m-0 rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-medium text-gray-600"
            >
              Cl. 61.3
            </Tag>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <ArrowRight size={14} /> Unified store + SLA engine
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUEUE_STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <span className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
              {stat.label}
            </span>
            <p className="mt-2 mb-1 text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="m-0 text-xs text-gray-500">{stat.hint}</p>
          </div>
        ))}
      </div>
    </PageX>
  );
};

export default Page;
