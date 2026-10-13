'use client';

import { CheckCircleFilled } from '@ant-design/icons';
import { Flex, Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import {
  COMPENSATION_EVENT_CONFIRM_COPY,
  type ConfirmActionCopy,
} from '../constants/compensation-event-confirm.constants';

interface CompensationEventConfirmActionModalProps {
  open: boolean;
  // The action's entry from COMPENSATION_EVENT_CONFIRM_COPY — carries title, body, tone and
  // the keyword that has to be typed to unlock the confirm button.
  action: ConfirmActionCopy;
  // Names the record being acted on, e.g. "CE-014 — Unforeseen ground conditions".
  subject: string;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// One confirmation dialog for every mutating action in the CE flow. The confirm button stays
// disabled until the action's keyword is typed, so no POST/PUT/DELETE in the flow can fire
// from a stray click — the user has to name the thing they are about to do.
const CompensationEventConfirmActionModal = ({
  open,
  action,
  subject,
  confirming = false,
  onConfirm,
  onCancel,
}: CompensationEventConfirmActionModalProps) => {
  const [typed, setTyped] = useState('');

  // Clear between openings so a previously satisfied keyword never unlocks the next action.
  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  const isDanger = action.tone === 'danger';
  // Case-sensitive and exact: the keyword is shown in capitals, so typing it in capitals is
  // the deliberate act the gate is asking for. Leading/trailing space is still forgiven —
  // that comes from the input, not from the user meaning something different.
  const entered = typed.trim();
  const unlocked = entered === action.keyword;
  // Only flag a mismatch once it can no longer become the keyword — marking it red while
  // the user is still part-way through typing reads as an error they have not made yet.
  const mismatched = entered.length > 0 && !action.keyword.startsWith(entered);

  return (
    <Modal
      open={open}
      title={action.title}
      onCancel={onCancel}
      onOk={onConfirm}
      centered
      destroyOnHidden
      maskClosable={!confirming}
      cancelText={COMPENSATION_EVENT_CONFIRM_COPY.cancel}
      okText={action.confirmLabel}
      confirmLoading={confirming}
      okButtonProps={{ danger: isDanger, disabled: !unlocked }}
    >
      <Flex vertical gap={16}>
        <Typography.Text>
          {action.bodyBefore}
          <Typography.Text strong>{subject}</Typography.Text>
          {action.bodyAfter}
          {/* Part of the sentence rather than its own banner — a destructive action reads as
              one continuous warning instead of a callout the eye skips past. */}
          {isDanger && (
            <>
              {' '}
              <Typography.Text strong>
                {COMPENSATION_EVENT_CONFIRM_COPY.irreversible}
              </Typography.Text>
            </>
          )}
        </Typography.Text>

        <Flex vertical gap={8}>
          <Typography.Text>
            {COMPENSATION_EVENT_CONFIRM_COPY.keywordPromptBefore}{' '}
            <Typography.Text strong>{action.keyword}</Typography.Text>{' '}
            {COMPENSATION_EVENT_CONFIRM_COPY.keywordPromptAfter}
          </Typography.Text>
          <Input
            autoFocus
            value={typed}
            placeholder={action.keyword}
            disabled={confirming}
            // Green once the keyword matches, red only when it no longer can — the field
            // says whether the button will unlock before the user reaches for it.
            status={mismatched ? 'error' : undefined}
            className={unlocked ? '!border-emerald-500 focus:!border-emerald-500' : undefined}
            // antd reserves the suffix slot only when `suffix` is set, so the empty span keeps
            // the text from shifting sideways the moment the tick appears.
            suffix={unlocked ? <CheckCircleFilled className="text-emerald-500" /> : <span />}
            onChange={(event) => setTyped(event.target.value)}
            // Enter is the natural finish for a typed confirmation, but only once the
            // keyword actually matches.
            onPressEnter={() => unlocked && onConfirm()}
            aria-label={COMPENSATION_EVENT_CONFIRM_COPY.keywordPrompt(action.keyword)}
          />
          {/* Reserved whether or not it is filled, so the footer does not jump as the
              message appears and clears while the user types. `role="alert"` announces the
              mismatch to a screen reader, which otherwise only sees a disabled button. */}
          <div className="min-h-5" role="alert">
            {mismatched && (
              <Typography.Text type="danger" className="text-xs">
                {COMPENSATION_EVENT_CONFIRM_COPY.keywordMismatch(action.keyword)}
              </Typography.Text>
            )}
            {unlocked && (
              <Typography.Text className="text-xs text-emerald-600">
                {COMPENSATION_EVENT_CONFIRM_COPY.keywordMatched}
              </Typography.Text>
            )}
          </div>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default CompensationEventConfirmActionModal;
