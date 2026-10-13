'use client';

import { Flex, message, Typography } from 'antd';
import { useMemo } from 'react';
import {
  useGetEarlyWarningAttachments,
  useViewEarlyWarningAttachment,
} from '../../hooks/use-early-warnings';
import type { MeetingActionDto } from '../../types/early-warning-api.types';
import EwMeetingAttachments from './ew-meeting-attachments';

interface EwActionContextSummaryProps {
  action?: MeetingActionDto | null;
  projectId: string;
  // Skips the attachments fetch while the owning modal is closed.
  enabled?: boolean;
}

const LABEL_STYLE = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
} as const;

const FRAME_STYLE = {
  border: '1px solid var(--theme-border)',
  borderRadius: 8,
} as const;

// Read-only recap of an action — title, description and files — shown above the editable fields.
export const EwActionContextSummary = ({
  action,
  projectId,
  enabled = true,
}: EwActionContextSummaryProps) => {
  const { mutate: viewAttachment } = useViewEarlyWarningAttachment();

  // Files uploaded with an action are stored against the ACTION id, so they come
  // from the attachments endpoint rather than the action DTO, which omits them.
  const { data: rawAttachments } = useGetEarlyWarningAttachments({
    entityId: action?.id,
    projectId,
    enabled: enabled && !!action?.id && !!projectId,
  });

  const attachments = useMemo(() => {
    const fromEndpoint = (rawAttachments ?? []).map((att) => ({
      id: att.id,
      fileName: att.fileName,
      filePath: att.filePath,
    }));
    return fromEndpoint.length > 0 ? fromEndpoint : (action?.attachments ?? []);
  }, [rawAttachments, action?.attachments]);

  // Description falls back to assign notes, matching the actions table.
  const description = action?.description || action?.assignNotes || '';

  if (!action?.title && !description && attachments.length === 0) return null;

  return (
    <Flex vertical gap={12}>
      {action?.title && (
        <Flex vertical gap={2}>
          <Typography.Text type="secondary" style={LABEL_STYLE}>
            Action
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 14 }} ellipsis>
            {action.title}
          </Typography.Text>
        </Flex>
      )}

      {description && (
        <Flex vertical gap={8}>
          <Typography.Text strong style={{ fontSize: 15 }}>
            Description
          </Typography.Text>
          <div style={{ ...FRAME_STYLE, padding: '12px 14px' }}>
            <Typography.Paragraph
              style={{ margin: 0, fontSize: 14, whiteSpace: 'pre-wrap' }}
              ellipsis={{ rows: 4, expandable: true, symbol: 'more' }}
            >
              {description}
            </Typography.Paragraph>
          </div>
        </Flex>
      )}

      {attachments.length > 0 && (
        <Flex vertical gap={8}>
          <Typography.Text strong style={{ fontSize: 15 }}>
            Attachments ({attachments.length})
          </Typography.Text>
          <div style={{ ...FRAME_STYLE, padding: 12 }}>
            <EwMeetingAttachments
              attachments={attachments}
              hideHeading
              onView={(att) => {
                if (att.filePath) {
                  viewAttachment({ url: att.filePath });
                } else {
                  message.info('This attachment has no stored file to preview.');
                }
              }}
            />
          </div>
        </Flex>
      )}
    </Flex>
  );
};

export default EwActionContextSummary;
