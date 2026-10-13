'use client';

import {
  FileTextOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Flex, Input, Skeleton, Tooltip, Typography } from 'antd';
import type { MeetingDto } from '../../types/early-warning-api.types';
import EwIconChip from '../register/ew-icon-chip';
import EwMeetingCardItem from './ew-meeting-card-item';

interface EwMeetingsListColumnProps {
  meetings: MeetingDto[];
  activeMeetingId: string | null;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isLoading: boolean;
  onSelectMeeting: (id: string) => void;
  onCreateMeeting: () => void;
  onCollapse?: () => void;
  /** Discarded EWs are terminal — hide every create entry point. */
  readOnly?: boolean;
}

export const EwMeetingsListColumn = ({
  meetings,
  activeMeetingId,
  searchTerm,
  onSearchChange,
  isLoading,
  onSelectMeeting,
  onCreateMeeting,
  onCollapse,
  readOnly,
}: EwMeetingsListColumnProps) => {
  return (
    <Card
      title={
        <Flex align="center" gap={10}>
          <EwIconChip icon={<FileTextOutlined />} bordered />
          <Typography.Title level={5} style={{ margin: 0 }}>
            Meetings
          </Typography.Title>
        </Flex>
      }
      extra={
        <Flex align="center" gap={4}>
          {!readOnly && (
            <Tooltip title="Schedule Meeting">
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={onCreateMeeting}
                aria-label="Schedule Meeting"
              />
            </Tooltip>
          )}
          {onCollapse && (
            <Tooltip title="Collapse meetings sidebar">
              <Button
                type="text"
                icon={<MenuFoldOutlined />}
                onClick={onCollapse}
                aria-label="Collapse meetings sidebar"
              />
            </Tooltip>
          )}
        </Flex>
      }
      // Flat panel per the design — no header divider, no shadow, no border radius.
      style={{ boxShadow: 'none', width: '100%' }}
      styles={{
        header: { borderBottom: 'none' },
        body: { padding: '16px', paddingTop: 0 },
      }}
    >
      <Flex vertical gap={12}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
        />

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : meetings.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No meetings scheduled yet." />
        ) : (
          // Long meeting lists scroll inside the panel instead of stretching
          // the page — the detail column keeps its own height.
          <Flex vertical gap={10} style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
            {meetings.map((meeting, index) => (
              <EwMeetingCardItem
                key={meeting.id}
                meeting={meeting}
                index={index}
                isSelected={meeting.id === activeMeetingId}
                onSelect={() => onSelectMeeting(meeting.id)}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default EwMeetingsListColumn;
