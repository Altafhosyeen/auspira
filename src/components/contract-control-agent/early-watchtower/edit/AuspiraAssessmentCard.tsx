import React from 'react';
import { assessmentPhrases } from './early-watchtower-review.data';

const AuspiraAssessmentCard = () => (
  <div className="bg-surface-subtle rounded-xl border border-gray-100 p-5">
    <h4 className="ds-micro text-icon font-extrabold tracking-wider uppercase">
      Auspira Assessment — What was detected and why
    </h4>
    <p className="ds-caption text-text mt-3">
      This email may constitute an Early Warning under Clause 15.1. Trigger phrases detected:
    </p>
    <ul className="ds-caption mt-4 space-y-2.5">
      {assessmentPhrases.map((item) => (
        <li key={item.id} className="flex items-start gap-1.5">
          <span className="text-icon font-bold">•</span>
          <span>
            <span className="text-text font-semibold">{item.phrase}</span>
            <span className="text-icon mx-1.5">→</span>
            <span className="text-icon">{item.meaning}</span>
          </span>
        </li>
      ))}
    </ul>
    <p className="ds-micro text-icon mt-5 border-t border-gray-100 pt-3 leading-relaxed">
      Note: Auspira cannot confirm this is a valid Early Warning — that is a contractual decision
      for you as PM. The assessment is based on NEC4 Clause 15.1 trigger language.
    </p>
  </div>
);

export default AuspiraAssessmentCard;
