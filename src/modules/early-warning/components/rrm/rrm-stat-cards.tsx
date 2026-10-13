import { Card, Col, Flex, Row, Tooltip, Typography } from 'antd';
import type { RrmDetail } from '../../utils/early-warning-rrm.utils';

// Stat card for the KPI row (Clause / Meeting Held / Participant / Actions).
const StatCard = ({ label, value, note }: { label: string; value: string; note?: string }) => {
  const displayNote = note && note !== '—' ? note : '';

  return (
    <Card
      style={{ height: '100%', minHeight: 112 }}
      styles={{
        body: {
          padding: '14px 16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Flex vertical gap={6} style={{ width: '100%', overflow: 'hidden' }}>
        <Typography.Text className="text-[11px] font-normal text-slate-500 uppercase tracking-wider">
          {label}
        </Typography.Text>
        <Tooltip title={value.length > 20 ? value : undefined}>
          <Typography.Title
            level={3}
            className="!m-0 !text-2xl !font-bold !text-[#0F2E4C]"
            ellipsis
          >
            {value}
          </Typography.Title>
        </Tooltip>
      </Flex>

      <Tooltip title={displayNote || undefined}>
        <Typography.Text
          type="secondary"
          ellipsis
          className="text-xs block mt-1.5 min-h-[18px] leading-[18px] text-slate-500"
        >
          {displayNote || '\u00A0'}
        </Typography.Text>
      </Tooltip>
    </Card>
  );
};

export interface RrmStatCardsProps {
  detail: RrmDetail;
}

export const RrmStatCards = ({ detail }: RrmStatCardsProps) => (
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
      <StatCard label="Clause" value={detail.clauseNumber} note={detail.clauseTitle} />
    </Col>
    <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
      <StatCard label="Meeting Held" value={detail.meetingDate} note={detail.format} />
    </Col>
    <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
      <StatCard
        label="Participant"
        value={String(detail.participantCount).padStart(2, '0')}
        note={detail.participantsText}
      />
    </Col>
    <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
      <StatCard
        label="Actions"
        value={`${detail.completedCount}/${detail.totalCount}`}
        note="Completed"
      />
    </Col>
  </Row>
);

export default RrmStatCards;
