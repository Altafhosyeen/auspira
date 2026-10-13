'use client';

import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Col, Flex, Row, Tooltip, Typography } from 'antd';

interface EwMeetingMetaRowProps {
  date: string;
  time: string;
  location: string;
  instructedBy: string;
}

export const EwMeetingMetaRow = ({ date, time, location, instructedBy }: EwMeetingMetaRowProps) => {
  const items = [
    { icon: <CalendarOutlined />, label: 'Date', value: date },
    { icon: <ClockCircleOutlined />, label: 'Time', value: time },
    { icon: <EnvironmentOutlined />, label: 'Location', value: location },
    { icon: <UserOutlined />, label: 'Instructed by', value: instructedBy },
  ];

  return (
    <Row gutter={[24, 16]}>
      {items.map((item) => (
        <Col key={item.label} xs={12} sm={6}>
          <Flex vertical gap={2}>
            <Flex align="center" gap={6}>
              {item.icon}
              <Typography.Text type="secondary">{item.label}</Typography.Text>
            </Flex>
            {/* Values clamp to two lines; the tooltip carries the full text when it overflows. */}
            <Tooltip title={item.value || undefined}>
              <Typography.Text className="line-clamp-2 wrap-break-word">
                {item.value || '—'}
              </Typography.Text>
            </Tooltip>
          </Flex>
        </Col>
      ))}
    </Row>
  );
};

export default EwMeetingMetaRow;
