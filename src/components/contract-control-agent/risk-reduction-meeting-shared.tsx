'use client';

import { Tooltip } from 'antd';
import type React from 'react';

/** Card shell + label styles shared between the RRM detail screen and the meeting detail modal. */
export const RRM_DETAIL_CARD = 'rounded-xl border border-slate-200 bg-white p-4';
export const RRM_META_LABEL =
  'ds-micro mb-1.5 block font-bold tracking-wider text-slate-400 uppercase';

/** Rough two-line capacity of a stat card at its narrowest; longer text is clamped, so only then
 * is a hover tooltip worth attaching. */
const NOTE_CLAMP_THRESHOLD = 70;

export const RrmStatCard = ({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) => (
  <div className={RRM_DETAIL_CARD}>
    <p className="text-[11px] font-normal tracking-wider text-slate-500 uppercase">{label}</p>
    <p className="mt-1.5 text-2xl font-bold text-[#0F2E4C] line-clamp-2 wrap-break-word">{value}</p>
    <Tooltip title={note.length > NOTE_CLAMP_THRESHOLD ? note : undefined}>
      <p className="ds-caption! mt-0.5 line-clamp-2 text-slate-500">{note}</p>
    </Tooltip>
  </div>
);

export const RrmMetaRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div>
    <span className={RRM_META_LABEL}>{label}</span>
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
      <span className="text-slate-400">{icon}</span>
      <span>{value}</span>
    </div>
  </div>
);
