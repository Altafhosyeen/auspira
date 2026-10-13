import { ClockCircleOutlined } from '@ant-design/icons';
import { Avatar, Card, Empty, Flex, Typography } from 'antd';
import { COMPENSATION_EVENT_REGISTER_COPY } from '../constants/compensation-event.constants';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/compensation-event-register.theme';
import type { CompensationEventActivity } from '../types/compensation-event.types';
import { formatRelativeTime, getPersonInitials } from '../utils/compensation-event.utils';

interface CompensationEventActivityPanelProps {
  items: CompensationEventActivity[];
  loading?: boolean;
}

const CompensationEventActivityPanel = ({
  items,
  loading = false,
}: CompensationEventActivityPanelProps) => (
  <Card loading={loading} size="small" style={{ borderColor: REGISTER_COLORS.cardBorder }}>
    <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
      <Flex align="center" gap={8}>
        <ClockCircleOutlined />
        <Typography.Text strong style={{ fontSize: REGISTER_SIZES.subjectFontSize }}>
          {COMPENSATION_EVENT_REGISTER_COPY.activityTitle}
        </Typography.Text>
      </Flex>
      <Typography.Text style={{ color: REGISTER_COLORS.textMuted, fontSize: 11 }}>
        {COMPENSATION_EVENT_REGISTER_COPY.viewAllLabel}
      </Typography.Text>
    </Flex>

    {items.length === 0 ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent activity" />
    ) : (
      <Flex vertical gap={18}>
        {items.map((item) => (
          <Flex key={item.id} align="center" justify="space-between" gap={12}>
            <Flex align="center" gap={8}>
              <Avatar size={28} style={{ background: REGISTER_COLORS.avatarBg, flexShrink: 0 }}>
                <Typography.Text style={{ fontSize: 10, fontWeight: 600 }}>
                  {getPersonInitials(item.actorName) || item.reference.slice(-2)}
                </Typography.Text>
              </Avatar>
              <Typography.Text style={{ color: REGISTER_COLORS.textMuted, fontSize: 11 }}>
                {item.summary}
              </Typography.Text>
            </Flex>
            <Typography.Text
              style={{ color: REGISTER_COLORS.textMuted, fontSize: 11, whiteSpace: 'nowrap' }}
            >
              {formatRelativeTime(item.occurredAt)}
            </Typography.Text>
          </Flex>
        ))}
      </Flex>
    )}
  </Card>
);

export default CompensationEventActivityPanel;
