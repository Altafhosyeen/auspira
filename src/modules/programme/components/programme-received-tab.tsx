'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Card, Divider, Flex, Typography } from 'antd';
import { useState } from 'react';
import AttachmentsModal from '@/components/shared/attachments-modal';
import { type DetailSummaryRow, DetailSummaryRows } from '@/components/shared/detail-summary-rows';
import IconChip from '@/components/shared/icon-chip';
import { APP_COLORS } from '@/constants/app.theme';
import { PROGRAMME_DETAIL_COPY } from '../constants/programme.constants';
import type { ProgrammeReceivedTabProps } from '../types/programme.types';
import { toProgrammeReceivedView } from '../utils/programme-api.utils';
import { ProgrammeStatusPill } from './programme-section-card';

// A bold value line with an optional muted caption underneath — every row in the Figma
// design follows this shape (value + a one-line explanation of where it came from).
const RowValue = ({ value, caption }: { value: string; caption?: string }) => (
  <Flex vertical style={{ flex: 1, minWidth: 0 }}>
    <Typography.Text strong>{value}</Typography.Text>
    {caption && (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {caption}
      </Typography.Text>
    )}
  </Flex>
);

// "Programme Received" — the first tab of the Program Health detail screen (Figma node
// 9785:46020). The rows come off whichever record the container resolved: the alert when the
// signal was found, and the stored programme record's own identity when it was not, so the tab
// never renders a bare card. A field neither carries is omitted rather than shown empty.
const ProgrammeReceivedTab = ({
  alert,
  email,
  attachments,
  record,
  revisionLabel,
}: ProgrammeReceivedTabProps) => {
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const view = toProgrammeReceivedView({ alert, email, record, revisionLabel });

  const rows: DetailSummaryRow[] = view.rows.map((row) => ({
    label: row.label,
    value: <RowValue value={row.value} caption={row.caption} />,
  }));

  if (attachments.length > 0) {
    rows.push({
      label: PROGRAMME_DETAIL_COPY.attachments,
      value: (
        <Flex vertical style={{ flex: 1, minWidth: 0 }}>
          <Typography.Link onClick={() => setAttachmentsOpen(true)} style={{ fontWeight: 600 }}>
            {attachments.map((att) => att.name).join(' · ')}
          </Typography.Link>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {PROGRAMME_DETAIL_COPY.attachmentsCaption}
          </Typography.Text>
        </Flex>
      ),
    });
  }

  return (
    <>
      <Card styles={{ body: { padding: 0 } }}>
        <Flex align="center" justify="space-between" wrap gap={8} style={{ padding: '14px 22px' }}>
          <Flex align="center" gap={12}>
            <IconChip icon={<FileTextOutlined />} bordered size={32} />
            <Typography.Text strong style={{ fontSize: 15 }}>
              {view.heading}
            </Typography.Text>
            {/* Where the signal stands — "Unreviewed", "Registered", "Overdue" — off its own
                `alertStatus`, so the card stops claiming a reply is outstanding once one has
                been recorded. */}
            {view.status && (
              <ProgrammeStatusPill label={view.status.label} tone={view.status.tone} />
            )}
          </Flex>
          <Typography.Text type="secondary">{view.received}</Typography.Text>
        </Flex>

        <Divider style={{ margin: 0, borderColor: APP_COLORS.rowDivider }} />

        <div style={{ padding: '4px 22px 8px' }}>
          <DetailSummaryRows
            rows={rows}
            mutedColor="#6F6B7D"
            dividerColor={APP_COLORS.cardBorder}
            fontSize={14}
            labelWidth={158}
          />
        </div>
      </Card>

      <AttachmentsModal
        open={attachmentsOpen}
        onClose={() => setAttachmentsOpen(false)}
        items={attachments}
      />
    </>
  );
};

export default ProgrammeReceivedTab;
