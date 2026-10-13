'use client';

import React, { useState, useMemo } from 'react';
import { Input, Drawer, Tag, notification } from 'antd';
import { SearchOutlined, ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';

// Definition for our data row
interface NoticeRecord {
  id: string;
  ref: string;
  type: string;
  summary: string;
  clock: string;
  clockType: 'orange' | 'dark' | 'none';
  status: 'LEVER READY' | 'QUOTE DUE' | 'MEETING DUE' | 'TO ASSESS' | 'IMPLEMENTED';
  isOpen: boolean;
  hasLiveClock: boolean;
}

const initialData: NoticeRecord[] = [
  {
    id: '1',
    ref: 'CE-031',
    type: 'Compensation event',
    summary: 'PM late reply to quotation · 60.1(6) · £42.5k exposure',
    clock: '6d 04h',
    clockType: 'orange',
    status: 'LEVER READY',
    isOpen: true,
    hasLiveClock: true,
  },
  {
    id: '2',
    ref: 'CE-028',
    type: 'Compensation event',
    summary: 'PMI changing scope of bridge bearings · awaiting quotation',
    clock: '12 days',
    clockType: 'dark',
    status: 'QUOTE DUE',
    isOpen: true,
    hasLiveClock: true,
  },
  {
    id: '3',
    ref: 'EWN-014',
    type: 'Early warning',
    summary: 'Tidal access window narrowing — risk to marine works',
    clock: '—',
    clockType: 'none',
    status: 'MEETING DUE',
    isOpen: true,
    hasLiveClock: false,
  },
  {
    id: '4',
    ref: 'PMI-022',
    type: 'PM instruction',
    summary: 'Revised coating spec for steelwork · to assess for CE',
    clock: '—',
    clockType: 'none',
    status: 'TO ASSESS',
    isOpen: true,
    hasLiveClock: false,
  },
  {
    id: '5',
    ref: 'CE-024',
    type: 'Compensation event',
    summary: 'Changes in the law · X2 · revised CDM duty · implemented',
    clock: '—',
    clockType: 'none',
    status: 'IMPLEMENTED',
    isOpen: false,
    hasLiveClock: false,
  },
];

export default function ContractKeeper() {
  // const [data, setData] = useState<NoticeRecord[]>(initialData);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'clocks'>('all');
  const [selectedRecord, setSelectedRecord] = useState<NoticeRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      // 1. Text Search Filter
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        item.ref.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // 2. Button Group Filters
      if (activeFilter === 'open') {
        return item.isOpen;
      }
      if (activeFilter === 'clocks') {
        return item.hasLiveClock;
      }

      return true; // 'all'
    });
  }, [searchText, activeFilter]);

  // Handle row interactions
  const handleRowClick = (record: NoticeRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
    notification.info({ message: `Opening file: ${record.ref}` });
  };

  return (
    <div className="bg-surface-muted flex min-h-screen flex-col justify-between p-4 font-sans selection:bg-blue-100 md:p-12">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        {/* Top bar controls */}
        <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`ds-body! rounded-full px-4 py-1.5 font-medium! transition-all duration-150 ${
                activeFilter === 'all'
                  ? 'bg-surface-dark text-white!'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              All · 34
            </button>
            <button
              onClick={() => setActiveFilter('open')}
              className={`ds-body! rounded-full px-4 py-1.5 font-medium! transition-all duration-150 ${
                activeFilter === 'open'
                  ? 'bg-surface-dark text-white!'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Open · 17
            </button>
            <button
              onClick={() => setActiveFilter('clocks')}
              className={`ds-body! rounded-full px-4 py-1.5 font-medium! transition-all duration-150 ${
                activeFilter === 'clocks'
                  ? 'bg-surface-dark text-white!'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Clocks live · 4
            </button>
          </div>

          {/* Search Input with right-aligned icon */}
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search notices..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="ds-body! w-full rounded-lg border-slate-200 py-2 pr-10 pl-4 shadow-sm transition-all placeholder:text-slate-700 hover:border-slate-300 focus:border-blue-400"
              suffix={<SearchOutlined className="text-slate-700" />}
            />
          </div>
        </div>

        {/* Custom Data Grid Table matching original spacing & borders */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto border-collapse text-left">
              {/* Header */}
              <thead>
                <tr className="bg-badge-info-soft border-b border-slate-200/60">
                  <th className="ds-micro! text-badge-neutral w-[12%] px-6 py-3 font-bold! tracking-wider">
                    REF
                  </th>
                  <th className="ds-micro! text-badge-neutral w-[20%] px-6 py-3 font-bold! tracking-wider">
                    TYPE
                  </th>
                  <th className="ds-micro! text-badge-neutral w-[42%] px-6 py-3 font-bold! tracking-wider">
                    SUMMARY
                  </th>
                  <th className="ds-micro! text-badge-neutral w-[13%] px-6 py-3 font-bold! tracking-wider">
                    CLOCK
                  </th>
                  <th className="ds-micro! text-badge-neutral w-[13%] px-6 py-3 text-right font-bold! tracking-wider">
                    STATUS
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row)}
                      className="group hover:bg-surface-subtle cursor-pointer transition-all duration-150"
                    >
                      {/* Ref */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="ds-body-strong! text-text transition-colors group-hover:text-blue-600">
                          {row.ref}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="ds-body! text-slate-500">{row.type}</span>
                      </td>

                      {/* Summary */}
                      <td className="px-6 py-4.5">
                        <span className="ds-body! font-normal! text-slate-700">{row.summary}</span>
                      </td>

                      {/* Clock */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {row.clockType === 'orange' && (
                          <span className="ds-body-strong! text-badge-warning">{row.clock}</span>
                        )}
                        {row.clockType === 'dark' && (
                          <span className="ds-body-strong! text-text">{row.clock}</span>
                        )}
                        {row.clockType === 'none' && (
                          <span className="ds-body! font-medium! text-slate-700">{row.clock}</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        {row.status === 'LEVER READY' && (
                          <span className="badge-error ds-micro! inline-block rounded-[4px] px-2.5 py-1 font-bold! tracking-wider">
                            LEVER READY
                          </span>
                        )}
                        {row.status === 'QUOTE DUE' && (
                          <span className="badge-warning ds-micro! inline-block rounded-[4px] px-2.5 py-1 font-bold! tracking-wider">
                            QUOTE DUE
                          </span>
                        )}
                        {row.status === 'MEETING DUE' && (
                          <span className="badge-warning ds-micro! inline-block rounded-[4px] px-2.5 py-1 font-bold! tracking-wider">
                            MEETING DUE
                          </span>
                        )}
                        {row.status === 'TO ASSESS' && (
                          <span className="badge-info ds-micro! inline-block rounded-[4px] px-2.5 py-1 font-bold! tracking-wider">
                            TO ASSESS
                          </span>
                        )}
                        {row.status === 'IMPLEMENTED' && (
                          <span className="badge-success ds-micro! inline-block rounded-[4px] px-2.5 py-1 font-bold! tracking-wider">
                            IMPLEMENTED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="ds-body! py-12 text-center text-slate-700">
                      No matching notices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explanatory Footer Warning Box */}
        <div className="badge-warning border-badge-warning/30 rounded-xl border p-5 shadow-sm transition-all hover:shadow-md">
          <p className="ds-body!">
            <strong className="font-bold">This is the bridge into CCA.</strong> Contract Keeper
            lists every notice and where it stands. To draft a reply or fire the Cl. 62.6 lever on{' '}
            <button
              onClick={() => {
                const target = initialData.find((d) => d.ref === 'CE-031');
                if (target) handleRowClick(target);
              }}
              className="font-semibold text-amber-950 underline transition-colors hover:text-amber-700"
            >
              CE-031
            </button>
            , you click through to the Contract Control Agent — the library hands off to the
            workshop.
          </p>
        </div>
      </div>

      {/* Interactive Detail Drawer (Contract Control Agent Hand-off Simulation) */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">{selectedRecord?.ref}</span>
            <span className="ds-caption! font-normal! text-slate-700">
              | {selectedRecord?.type}
            </span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={480}
        extra={
          selectedRecord?.status === 'LEVER READY' && (
            <Tag color="red" className="font-bold">
              62.6 READY
            </Tag>
          )
        }
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div>
              <h4 className="ds-micro! mb-1 font-bold! tracking-wider text-slate-700 uppercase">
                Notice Summary
              </h4>
              <p className="ds-body-large! font-medium! text-slate-800">{selectedRecord.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <h4 className="ds-micro! mb-1 font-bold! tracking-wider text-slate-700 uppercase">
                  Time Remaining
                </h4>
                <p className="ds-heading-3! font-bold! text-slate-800">{selectedRecord.clock}</p>
              </div>
              <div>
                <h4 className="ds-micro! mb-1 font-bold! tracking-wider text-slate-700 uppercase">
                  Current State
                </h4>
                <p className="ds-body! font-semibold! text-slate-700">{selectedRecord.status}</p>
              </div>
            </div>

            <div className="mt-8 space-y-3 rounded-lg border border-slate-200/60 bg-slate-50 p-4">
              <div className="flex items-start gap-2.5">
                <InfoCircleOutlined className="mt-0.5 text-slate-500" />
                <p className="ds-caption! text-slate-600">
                  You are viewing this record via the{' '}
                  <span className="font-semibold">Contract Keeper</span> bridge. To execute
                  adjustments, file communications, or execute contractual mechanisms, transition
                  below.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  notification.success({
                    message: `Simulating action: Invoking actions for ${selectedRecord.ref}`,
                  });
                  setDrawerOpen(false);
                }}
                className="bg-surface-dark ds-body! hover:bg-surface-dark/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold! text-white shadow-sm transition-all duration-150 hover:shadow"
              >
                <span>Handoff to Contract Control Agent</span>
                <ArrowRightOutlined className="ds-caption!" />
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
