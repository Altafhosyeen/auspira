'use client';

import { Card, Flex, Skeleton } from 'antd';

// Loading state for the Program Health detail screen — mirrors the defect-notice detail
// skeleton's block order (title card, banner, tab strip, content card).
const ProgrammeDetailSkeleton = () => (
  <Flex vertical gap={20}>
    <Card styles={{ body: { padding: '12px 20px' } }}>
      <Flex align="center" gap={12}>
        <Skeleton.Avatar active size={36} shape="square" />
        <Skeleton.Input active style={{ width: 260, height: 24 }} />
        <Skeleton.Input active style={{ width: 80, height: 24 }} />
      </Flex>
    </Card>

    <Skeleton.Button active block style={{ height: 60 }} />

    <Flex gap={24} style={{ borderBottom: '1px solid #EAECF0', paddingBottom: 12 }}>
      {[130, 100, 60, 60, 110, 95, 125].map((width, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, order never changes
        <Skeleton.Input key={idx} active style={{ width, height: 22 }} />
      ))}
    </Flex>

    <Card styles={{ body: { padding: 0 } }}>
      <Flex vertical gap={16} style={{ padding: '20px 22px' }}>
        {[1, 2, 3, 4].map((row) => (
          <Flex key={row} align="center" gap={24}>
            <Skeleton.Input active style={{ width: 158, height: 16 }} />
            <Skeleton.Input active style={{ width: 320, height: 16 }} />
          </Flex>
        ))}
      </Flex>
    </Card>
  </Flex>
);

export default ProgrammeDetailSkeleton;
