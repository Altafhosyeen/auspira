'use client';

import { FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Tag, Tooltip, Typography } from 'antd';
import { CLAUSE_CHIP_COLORS } from '@/components/shared/clause-chip';
import { DetailBanner } from '@/components/shared/detail-banner';
import IconChip from '@/components/shared/icon-chip';
import { APP_COLORS } from '@/constants/app.theme';
import { PROGRAMME_DETAIL_COPY } from '../constants/programme.constants';

interface ProgrammeDetailHeaderProps {
  title: string;
  /** Bare clause numbers, e.g. ["31.1", "31.2", "32.2"] — the design shows one tag per clause. */
  clauseNumbers: string[];
}

// Mirrors AppPageTitle's layout, but with one tag per clause (the Figma design shows three
// — "Cl. 31.1 / 31.2 / 32.2" — and the shared AppPageTitle/ClauseChip only render one).
const ProgrammeDetailHeader = ({ title, clauseNumbers }: ProgrammeDetailHeaderProps) => (
  <Flex vertical gap={16}>
    <Flex
      align="center"
      gap={12}
      wrap
      style={{
        background: '#fff',
        border: `1px solid ${APP_COLORS.cardBorder}`,
        borderRadius: 6,
        padding: '12px 20px',
      }}
    >
      <IconChip icon={<FileTextOutlined />} size={36} />
      <Typography.Title level={2} style={{ margin: 0, fontSize: 20, color: APP_COLORS.main }}>
        {title}
      </Typography.Title>
      {clauseNumbers.map((number) => (
        <Tooltip key={number} title={`Clause ${number}`}>
          <Tag
            bordered
            style={{
              backgroundColor: CLAUSE_CHIP_COLORS.background,
              borderColor: CLAUSE_CHIP_COLORS.border,
              borderRadius: 20,
              color: CLAUSE_CHIP_COLORS.text,
              lineHeight: 1,
              margin: 0,
              padding: '4px 10px',
            }}
          >
            <Flex align="center" gap={6}>
              <InfoCircleOutlined />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Cl. {number}</span>
            </Flex>
          </Tag>
        </Tooltip>
      ))}
    </Flex>
    <DetailBanner
      fallback={PROGRAMME_DETAIL_COPY.banner}
      color={CLAUSE_CHIP_COLORS.text}
      background={CLAUSE_CHIP_COLORS.background}
      borderColor={CLAUSE_CHIP_COLORS.border}
    />
  </Flex>
);

export default ProgrammeDetailHeader;
