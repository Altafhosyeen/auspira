'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { ACTIVITY_ITEMS } from '@/constants/org-dashboard.constants';

export const RecentActivitySection: React.FC = () => (
  <motion.div
    className="overflow-hidden rounded-[12px] border border-slate-200/90 bg-white shadow-sm"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.22, duration: 0.38 }}
  >
    <div className="flex items-center gap-3 px-5 pt-5 pb-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50">
        <Activity className="h-4 w-4 text-violet-500" />
      </span>
      <div>
        <p className="!my-0 text-sm font-bold text-slate-800">Recent Activity</p>
        <p className="!my-0 !mt-0.5 text-xs text-slate-400">
          Stay up to date with the latest actions and updates.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-px border-t border-slate-100 bg-slate-100 md:grid-cols-2 xl:grid-cols-4">
      {ACTIVITY_ITEMS.map((item) => (
        <div key={item.id} className="flex items-start gap-3 bg-white px-5 py-5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}
          >
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="!my-0 text-xs leading-snug font-semibold text-slate-800">{item.title}</p>
            <p className="!my-0 !mt-1 text-xs text-slate-400">{item.meta}</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

RecentActivitySection.displayName = 'RecentActivitySection';
