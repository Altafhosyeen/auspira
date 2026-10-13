import React from 'react';
import {
  ClockCircleOutlined,
  TagOutlined,
  WarningOutlined,
  PoundOutlined,
} from '@ant-design/icons';
import type { DecisionVariant, ImpactIcon, ThreadMessage } from './early-warning-detail.data';

export const IMPACT_ICON: Record<ImpactIcon, React.ReactNode> = {
  delay: <ClockCircleOutlined className="text-[10px]" />,
  'key-date': <TagOutlined className="text-[10px]" />,
  cost: <PoundOutlined className="text-[10px]" />,
  performance: <WarningOutlined className="text-[10px]" />,
};

export const DECISION_CLASS: Record<DecisionVariant, string> = {
  primary: 'bg-main-p text-white! hover:opacity-90',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  warning: 'bg-warning text-white! hover:opacity-90',
};

export const AVATAR_TONE: Record<ThreadMessage['avatarTone'], string> = {
  dark: 'bg-surface-dark',
  blue: 'bg-main-p',
};

export const fileKey = (file: File) => `${file.name}|${file.size}|${file.lastModified}`;
