'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MENU_PATH } from '@/constants/routes.constants';
import { decisionCards, type DecisionTone } from './early-watchtower-review.data';

const TONE_STYLES: Record<
  DecisionTone,
  { card: string; iconBox: string; title: string; description: string }
> = {
  primary: {
    card: 'bg-main-p ',
    iconBox: 'bg-white/10 text-white',
    title: 'text-white',
    description: 'text-white/70',
  },
  success: {
    card: 'border border-gray-100 bg-white ',
    iconBox: 'badge-success border-badge-success-soft border',
    title: 'text-text',
    description: 'text-icon',
  },
  neutral: {
    card: 'border border-gray-100 bg-white ',
    iconBox: 'badge-neutral border-badge-neutral-soft border',
    title: 'text-text',
    description: 'text-icon',
  },
};

const DecisionPanel = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const handleClick = (route?: string) => {
    if (!route || !id) return;
    router.push(`${MENU_PATH.WATCH_TOWER.pathname}/${id}/${route}`);
  };

  return (
    <div className="mt-4">
      <h3 className="ds-body-large mb-4 font-extrabold tracking-wider text-slate-700 uppercase">
        Your decision
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {decisionCards.map((card) => {
          const tone = TONE_STYLES[card.tone];
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleClick(card.route)}
              className={`flex cursor-pointer items-start gap-4 rounded-xl p-5 transition-all duration-150 ${tone.card}`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg ${tone.iconBox}`}
              >
                <Icon />
              </div>
              <div className="space-y-1">
                <h4 className={`ds-body-strong ${tone.title}`}>{card.title}</h4>
                {/* <p className={`ds-micro leading-normal ${tone.description}`}>{card.description}</p> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionPanel;
