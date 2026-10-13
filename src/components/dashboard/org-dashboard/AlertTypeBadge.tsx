import React from 'react';
import type { TriangleAlert } from 'lucide-react';
import { BADGE_TONE_CLASS } from '@/constants/org-dashboard.constants';
import type { BadgeTone } from '@/types/dashboard/org-dashboard.types';

export interface AlertTypeBadgeProps {
  label: string;
  tone: BadgeTone;
  Icon: typeof TriangleAlert;
}

export const AlertTypeBadge: React.FC<AlertTypeBadgeProps> = ({ label, tone, Icon }) => (
  <span
    className={`ds-micro! inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-semibold! ${BADGE_TONE_CLASS[tone]}`}
  >
    <Icon className="h-3 w-3 shrink-0" />
    {label}
  </span>
);

AlertTypeBadge.displayName = 'AlertTypeBadge';
