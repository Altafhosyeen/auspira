'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import TableX from '@/components/antd/TableX';
import { MENU_PATH } from '@/constants/routes.constants';
import {
  CONFIDENCE_TRACK,
  FEED_ITEMS,
  getSourceStyles,
  type FeedItem,
} from './early-watchtower.data';

// ─── FEED TABLE COLUMNS ──────────────────────────────────────────────────────

const feedColumns: ColumnsType<FeedItem> = [
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
    width: 130,
    render: (time: string, item) => (
      <span className={`ds-caption text-icon ${item.muted ? '' : 'font-medium'}`}>{time}</span>
    ),
  },
  {
    title: 'Source',
    dataIndex: 'sourceType',
    key: 'source',
    width: 200,
    render: (_, item) => {
      const sourceStyles = getSourceStyles(item.sourceType, item.muted);
      return (
        <div>
          <p className={`${sourceStyles.labelClass} ds-body leading-tight`}>{item.sourceType}</p>
          <p className="ds-caption text-text leading-normal">{item.sourceSub}</p>
        </div>
      );
    },
  },
  {
    title: 'What Auspira Found',
    dataIndex: 'title',
    key: 'found',
    render: (_, item) => (
      <div className="pr-4">
        <p className={`ds-body leading-snug font-bold ${item.muted ? 'text-icon' : 'text-text'}`}>
          {item.title}
        </p>
        {item.details && <p className="ds-caption text-text mt-0.5">{item.details}</p>}
      </div>
    ),
  },
  {
    title: 'Confidence',
    dataIndex: 'confidence',
    key: 'confidence',
    width: 180,
    render: (confidence: number, item) => (
      <div className="flex items-center gap-3">
        <div className="w-20">
          <Progress
            percent={confidence}
            strokeColor={item.confidenceColor}
            trailColor={CONFIDENCE_TRACK}
            size={[100, 6]}
            showInfo={false}
          />
        </div>
        <span className={`ds-caption font-bold ${item.muted ? 'text-icon' : 'text-text'}`}>
          {confidence}%
        </span>
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 140,
    align: 'right',
    render: (_, item) => {
      if (item.status === 'UNREVIEWED') {
        return (
          <span className="badge-warning ds-micro rounded px-2 py-0.5 font-extrabold tracking-wide">
            UNREVIEWED
          </span>
        );
      }
      if (item.status === 'DISMISSED') {
        return (
          <span className="badge-neutral ds-micro rounded px-2 py-0.5 font-extrabold tracking-wide">
            DISMISSED
          </span>
        );
      }
      return (
        <span className="badge-neutral ds-micro rounded px-2 py-0.5 font-extrabold tracking-wide">
          REGISTERED <span className="text-badge-neutral ml-0.5 font-bold">{item.statusExtra}</span>
        </span>
      );
    },
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const EarlyWatchtowerFeedTable = () => {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <TableX<FeedItem>
        columns={feedColumns}
        dataSource={FEED_ITEMS}
        rowKey="id"
        onRow={(item) => ({
          onClick: () => router.push(`${MENU_PATH.WATCH_TOWER.pathname}/${item.id}`),
          className: 'cursor-pointer',
        })}
      />
    </div>
  );
};

export default EarlyWatchtowerFeedTable;
