'use client';

import { Modal } from 'antd';
import React from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import CloseEarlyWarning, { type DecisionOption } from './CloseEarlyWarning';
import {
  AFTER_MEETING_ACTIONS,
  AFTER_MEETING_COPY,
  type DecisionVariant,
} from './early-warning-detail.data';
import { DECISION_CLASS } from './early-warning-detail.styles';

const decisionForVariant = (variant: DecisionVariant): DecisionOption =>
  variant === 'warning' ? 'link' : 'close';

export default function EarlyWarningAfterMeetingCard({
  earlyWarningId,
  closed,
  linkedToCE,
}: {
  earlyWarningId?: string;
  /** EW already closed — neither after-meeting decision is still open to take. */
  closed?: boolean;
  /** EW already linked to a CE (Link to CE lifecycle stage completed) — same as `closed`. */
  linkedToCE?: boolean;
}) {
  const [decision, setDecision] = React.useState<DecisionOption | null>(null);
  const disabled = closed || linkedToCE;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      <div>
        <h4 className="heading-card">{AFTER_MEETING_COPY.title}</h4>
        <p className="mt-1 text-[11px] text-slate-400">{AFTER_MEETING_COPY.subtitle}</p>
      </div>

      <DisabledTooltip
        disabled={disabled}
        reason={
          closed
            ? 'This Early Warning is already closed.'
            : 'This Early Warning is already linked to a Compensation Event.'
        }
      >
        <div className="space-y-2!">
          {AFTER_MEETING_ACTIONS.map((action) => {
            const option = decisionForVariant(action.variant);

            // Both actions open the Close/Link-to-CE modal, which is itself the
            // confirmation step — nothing here fires a request on click.
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => setDecision(option)}
                disabled={disabled}
                className={`w-full rounded-lg py-2 text-center text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${DECISION_CLASS[action.variant]}`}
              >
                {closed && option === 'close'
                  ? 'EW closed'
                  : linkedToCE && option === 'link'
                    ? 'Already linked to CE'
                    : action.label}
              </button>
            );
          })}
        </div>
      </DisabledTooltip>

      <Modal
        open={decision !== null}
        onCancel={() => setDecision(null)}
        footer={null}
        width="92%"
        style={{ maxWidth: 640 }}
        destroyOnHidden
      >
        {decision && (
          <CloseEarlyWarning
            decision={decision}
            earlyWarningId={earlyWarningId}
            onFinished={() => setDecision(null)}
          />
        )}
      </Modal>
    </div>
  );
}
