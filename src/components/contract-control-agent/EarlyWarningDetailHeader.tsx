'use client';

import React from 'react';
import { WarningOutlined } from '@ant-design/icons';
import { ArrowDownLeft, ArrowUpRight, Mail, PenLine, type LucideIcon } from 'lucide-react';
import type { EwDetailHeader, EwSourceKind } from './early-warning-detail.map';

/** Arrows read as direction at a glance; the neutral envelope covers "email, direction unknown". */
const SOURCE_ICON: Record<EwSourceKind, LucideIcon> = {
  manual: PenLine,
  email: Mail,
  inbound: ArrowDownLeft,
  outbound: ArrowUpRight,
};

export default function EarlyWarningDetailHeader({
  header,
}: {
  header: EwDetailHeader;
  onPrimaryAction: () => void;
}) {
  const SourceIcon = SOURCE_ICON[header.source.kind];

  return (
    <header className="relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {/* Badge sits inline after the title and wraps with it on narrow screens — same
              placement as the signal review header. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="ds-heading-2 text-text tracking-tight">{header.title}</h1>
            <span className="badge-success border-success/20 -mt-1 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold">
              {header.clauseBadge}
            </span>
            {/* Label kept alongside the icon — an arrow alone doesn't say "email". */}
            <span
              title={header.source.label}
              className="inline-flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
            >
              <SourceIcon className="h-3 w-3 shrink-0" aria-hidden />
              {header.source.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {/* <button
            onClick={onPrimaryAction}
            className="bg-main-p ds-micro flex cursor-pointer items-center gap-1.5 rounded px-4 py-2 font-bold text-white! shadow-sm transition-colors hover:opacity-90"
          >
            <span>{header.primaryAction}</span>
          </button> */}
          {header.rrmWarning && (
            <div className="ds-body text-error flex items-center gap-1.5 font-bold">
              <WarningOutlined className="text-md" />
              <span>{header.rrmWarning}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
