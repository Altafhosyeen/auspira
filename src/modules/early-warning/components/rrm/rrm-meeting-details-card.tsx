import {
  CalendarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Card, Checkbox, Col, Divider, Flex, Progress, Row, Typography } from 'antd';
import type { RrmDetail } from '../../utils/early-warning-rrm.utils';
import { toProgressPercent } from '../../utils/early-warning-rrm.utils';
import EwIconChip from '../register/ew-icon-chip';

export interface RrmMeetingDetailsCardProps {
  detail: RrmDetail;
  onToggleAction: (actionId: string) => void;
  completingAction?: boolean;
}

export const RrmMeetingDetailsCard = ({
  detail,
  onToggleAction,
  completingAction,
}: RrmMeetingDetailsCardProps) => (
  <Flex vertical gap={16}>
    <Card
      title={
        <Flex align="center" gap={8}>
          <EwIconChip icon={<FileTextOutlined />} bordered />
          Meeting Details
        </Flex>
      }
    >
      <Flex vertical gap={16}>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Flex vertical gap={6}>
              <Typography.Text type="secondary" className="text-xs">
                Meeting Date
              </Typography.Text>
              <Typography.Text strong className="text-sm">
                <CalendarOutlined className="mr-2 text-slate-800" />
                {detail.meetingDate}
              </Typography.Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12}>
            <Flex vertical gap={6}>
              <Typography.Text type="secondary" className="text-xs">
                Format
              </Typography.Text>
              <Typography.Text strong className="text-sm">
                <EnvironmentOutlined className="mr-2 text-slate-800" />
                {detail.format}
              </Typography.Text>
            </Flex>
          </Col>
        </Row>

        <Flex vertical gap={6}>
          <Typography.Text type="secondary" className="text-xs">
            Participants
          </Typography.Text>
          <Typography.Text strong className="text-sm">
            <UserOutlined className="mr-2 text-slate-800" />
            {detail.participantsText}
          </Typography.Text>
        </Flex>

        <Divider style={{ margin: '4px 0' }} />

        <Flex vertical gap={6}>
          <Typography.Text type="secondary" className="text-xs">
            Summary
          </Typography.Text>
          {detail.summary ? (
            <Typography.Text className="text-sm text-slate-700 leading-relaxed">
              {detail.summary}
            </Typography.Text>
          ) : (
            <Typography.Text type="secondary" italic className="text-sm text-slate-500">
              No summary has been written yet - this section will appear blank in the saved record.
            </Typography.Text>
          )}
        </Flex>
      </Flex>
    </Card>

    <Card
      title="Agreed actions"
      extra={
        <Typography.Text className="text-xs text-slate-500 font-medium tracking-wide">
          {detail.completedCount} OF {detail.totalCount} COMPLETE
        </Typography.Text>
      }
    >
      <Flex vertical gap={16}>
        <Progress
          percent={toProgressPercent(detail)}
          showInfo={false}
          strokeColor="#FA541C"
          trailColor="#F2F4F7"
          size={['100%', 6]}
          style={{ margin: '4px 0 8px 0' }}
        />

        {detail.agreedActions.length === 0 ? (
          <Typography.Text type="secondary" className="text-xs py-2">
            No agreed actions recorded yet.
          </Typography.Text>
        ) : (
          <Flex vertical gap={16}>
            {detail.agreedActions.map((action) => (
              <Flex key={action.id} align="center" gap={12}>
                <Checkbox
                  checked={action.checked}
                  onChange={() => onToggleAction(action.id)}
                  disabled={completingAction}
                />
                <Typography.Text
                  className={`text-sm cursor-pointer ${action.checked ? 'text-slate-500' : 'text-slate-900'}`}
                  onClick={() => onToggleAction(action.id)}
                >
                  {action.label}
                </Typography.Text>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>

    <Card title="Outcome so far">
      <Alert type="info" showIcon message={detail.outcomeSoFar || 'No outcome recorded yet.'} />
    </Card>
  </Flex>
);

export default RrmMeetingDetailsCard;
