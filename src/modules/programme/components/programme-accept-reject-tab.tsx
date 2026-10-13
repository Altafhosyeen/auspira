'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Alert, Button, Checkbox, Flex, Input, Tooltip, Typography } from 'antd';
import { APP_COLORS } from '@/constants/app.theme';
import { PROGRAMME_ACCEPT_REJECT_COPY } from '../constants/programme.constants';
import type { AcceptRejectTabProps } from '../types/programme.types';
import { ProgrammeSectionCard } from './programme-section-card';

// "Accept / Reject" — the sixth tab of the Program Health detail screen. The PM's Cl. 31.3
// decision: accept the programme, or notify non-acceptance citing one or more of the four
// grounds, each with its own written justification. The selection and the justifications are
// owned by the caller so a part-made decision survives a tab switch. The accept posts to the
// accept endpoint; the non-acceptance notification has no route yet, so it stays inert.
const ProgrammeAcceptRejectTab = ({
  reasons,
  selectedKeys,
  onSelectionChange,
  justifications,
  onJustificationChange,
  onAccept,
  onNotifyNonAcceptance,
  submitting = false,
  decisionRecordedLabel,
}: AcceptRejectTabProps) => {
  // The two actions are mutually exclusive: non-acceptance has to cite a ground, and
  // accepting while grounds are ticked would contradict the decision being recorded.
  const hasReasons = selectedKeys.length > 0;
  // Every cited ground goes into the notification with its justification, so a ticked
  // reason left blank holds the notification back.
  const allJustified = selectedKeys.every((key) => justifications[key]?.trim());

  const notifyHint = !hasReasons
    ? PROGRAMME_ACCEPT_REJECT_COPY.notifyDisabledHint
    : !allJustified
      ? PROGRAMME_ACCEPT_REJECT_COPY.justificationRequiredHint
      : undefined;

  // The decision the register already holds: the grounds are moot, and accepting again would
  // overwrite it — so the tab states the outcome rather than inviting a second decision.
  if (decisionRecordedLabel) {
    return (
      <ProgrammeSectionCard
        icon={<FileTextOutlined />}
        title={PROGRAMME_ACCEPT_REJECT_COPY.reasonsTitle}
      >
        <Flex vertical style={{ padding: '16px 22px 20px' }}>
          <Alert
            type="success"
            showIcon
            message={PROGRAMME_ACCEPT_REJECT_COPY.decisionRecorded(decisionRecordedLabel)}
          />
        </Flex>
      </ProgrammeSectionCard>
    );
  }

  return (
    <ProgrammeSectionCard
      icon={<FileTextOutlined />}
      title={PROGRAMME_ACCEPT_REJECT_COPY.reasonsTitle}
    >
      <Flex vertical gap={16} style={{ padding: '16px 22px 20px' }}>
        <Flex vertical gap={12}>
          {reasons.map((reason) => {
            const checked = selectedKeys.includes(reason.key);
            return (
              // A ticked ground lifts to the soft-blue fill and opens its justification box,
              // so the reasons actually being cited read apart from the ones merely offered.
              <Flex
                key={reason.key}
                vertical
                gap={12}
                style={{
                  background: checked ? APP_COLORS.mainSoft : undefined,
                  border: `1px solid ${checked ? APP_COLORS.mainSoft : APP_COLORS.cardBorder}`,
                  borderRadius: 6,
                  padding: '14px 16px',
                }}
              >
                <Checkbox
                  checked={checked}
                  disabled={submitting}
                  onChange={(event) =>
                    onSelectionChange(
                      event.target.checked
                        ? [...selectedKeys, reason.key]
                        : selectedKeys.filter((key) => key !== reason.key)
                    )
                  }
                  style={{ alignItems: 'flex-start', margin: 0 }}
                >
                  <Flex vertical style={{ marginInlineStart: 4 }}>
                    <Typography.Text style={{ fontSize: 14 }}>{reason.label}</Typography.Text>
                    {reason.caption && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {reason.caption}
                      </Typography.Text>
                    )}
                  </Flex>
                </Checkbox>

                {checked && (
                  <Input.TextArea
                    value={justifications[reason.key] ?? ''}
                    onChange={(event) => onJustificationChange(reason.key, event.target.value)}
                    placeholder={PROGRAMME_ACCEPT_REJECT_COPY.justificationPlaceholder}
                    disabled={submitting}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                  />
                )}
              </Flex>
            );
          })}
        </Flex>

        <Flex align="center" justify="space-between" gap={16} wrap>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {hasReasons ? PROGRAMME_ACCEPT_REJECT_COPY.selectionSummary(selectedKeys.length) : ''}
          </Typography.Text>

          <Flex gap={12} wrap>
            <Tooltip
              title={hasReasons ? PROGRAMME_ACCEPT_REJECT_COPY.acceptDisabledHint : undefined}
            >
              <Button
                type="primary"
                loading={submitting}
                disabled={hasReasons}
                onClick={onAccept}
                style={{ minWidth: 180 }}
              >
                {PROGRAMME_ACCEPT_REJECT_COPY.accept}
              </Button>
            </Tooltip>

            <Tooltip title={notifyHint}>
              <Button
                danger
                type="primary"
                loading={submitting}
                disabled={!hasReasons || !allJustified}
                onClick={onNotifyNonAcceptance}
                style={{ minWidth: 180 }}
              >
                {PROGRAMME_ACCEPT_REJECT_COPY.notifyNonAcceptance}
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      </Flex>
    </ProgrammeSectionCard>
  );
};

export default ProgrammeAcceptRejectTab;
