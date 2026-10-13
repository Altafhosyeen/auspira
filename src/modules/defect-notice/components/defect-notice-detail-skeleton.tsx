'use client';

import { Card, Flex, Skeleton } from 'antd';
import { DEFECT_NOTICE_DETAIL_TABS } from '../constants/defect-notice.constants';

// Loading state for the defect-notice detail screen — header, banner, tab strip, summary
// card, in the order the page composes them.
export const DefectNoticeDetailSkeleton = () => (
  <Flex vertical gap={16}>
    {/* Title Header Card Skeleton */}
    <Card styles={{ body: { padding: '12px 20px' } }}>
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Flex align="center" gap={12}>
          <Skeleton.Avatar active size={36} shape="square" />
          <Skeleton.Input active style={{ width: 340, height: 24 }} />
          <Skeleton.Input active style={{ width: 90, height: 24 }} />
        </Flex>
        <Skeleton.Button active style={{ width: 170, height: 36 }} />
      </Flex>
    </Card>

    {/* Notice Banner Skeleton */}
    <Skeleton.Button active block style={{ height: 44 }} />

    {/* Tabs Skeleton */}
    <Flex gap={24} style={{ borderBottom: '1px solid #EAECF0', paddingBottom: 12 }}>
      {DEFECT_NOTICE_DETAIL_TABS.map(({ key, label }) => (
        <Skeleton.Input
          key={key}
          active
          // Roughly the rendered label's width, so the placeholders line up with the real
          // strip rather than jumping when it swaps in.
          style={{ width: Math.max(70, label.length * 9), height: 24 }}
        />
      ))}
    </Flex>

    {/* Description Banner Card Skeleton */}
    <Card
      style={{
        backgroundColor: '#F4F8FC',
        borderColor: '#E1EDF7',
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Flex vertical gap={12}>
        <Skeleton.Input active style={{ width: 100, height: 16 }} />
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
      </Flex>
    </Card>

    {/* Overview: the Defect Summary card, which is all that tab renders. */}
    <Card
      title={
        <Flex align="center" gap={8}>
          <Skeleton.Avatar active size={32} shape="square" />
          <Skeleton.Input active style={{ width: 130, height: 20 }} />
        </Flex>
      }
    >
      <Flex vertical gap={16} style={{ padding: '8px 16px' }}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Flex key={item} align="flex-start" gap={24}>
            <Skeleton.Input active style={{ width: 160, height: 16 }} />
            <Skeleton.Input active style={{ width: 280, height: 16 }} />
          </Flex>
        ))}
      </Flex>
    </Card>
  </Flex>
);

export default DefectNoticeDetailSkeleton;
