'use client';

import React from 'react';
import { Progress } from 'antd';
import { Card, CardEyebrow } from './Card';
import { CONFIDENCE, CONFIDENCE_STROKE, CONFIDENCE_TRACK } from './early-watchtower-review.data';

const ConfidenceCard = () => (
  <Card className="p-5">
    <CardEyebrow>Confidence Score</CardEyebrow>
    <div className="mt-3 flex items-baseline gap-1">
      <span className="ds-heading-1 text-error font-extrabold">{CONFIDENCE.score}%</span>
    </div>
    <p className="ds-caption text-icon mt-1">{CONFIDENCE.label}</p>
    <div className="mt-4">
      <Progress
        percent={CONFIDENCE.score}
        strokeColor={CONFIDENCE_STROKE}
        trailColor={CONFIDENCE_TRACK}
        strokeWidth={6}
        showInfo={false}
      />
    </div>
  </Card>
);

export default ConfidenceCard;
