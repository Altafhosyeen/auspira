'use client';

import { Card, Col, Flex, Row, Skeleton } from 'antd';

export const EarlyWarningDetailSkeleton = () => (
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
      {['overview', 'email', 'meetings', 'document', 'audit-trail'].map((tabName, idx) => (
        <Skeleton.Input
          key={tabName}
          active
          style={{ width: [100, 70, 80, 90, 90][idx], height: 24 }}
        />
      ))}
    </Flex>

    {/* Progress / Timeline Bar Skeleton */}
    <Flex vertical gap={8}>
      <Flex justify="space-between" align="center">
        <Skeleton.Input active style={{ width: 130, height: 16 }} />
        <Skeleton.Input active style={{ width: 180, height: 16 }} />
      </Flex>
      <Skeleton.Button active block style={{ height: 8 }} />
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

    {/* 2-Column Overview Layout Skeleton */}
    <Row gutter={[16, 16]}>
      {/* Left Column: EW Summary Card */}
      <Col xs={24} lg={16}>
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
                <Skeleton.Input active style={{ width: 120, height: 16 }} />
                <Skeleton.Input active style={{ width: 260, height: 16 }} />
              </Flex>
            ))}
          </Flex>
        </Card>
      </Col>

      {/* Right Column: Lifecycle Card */}
      <Col xs={24} lg={8}>
        <Card title={<Skeleton.Input active style={{ width: 90, height: 20 }} />}>
          <Flex vertical gap={20} style={{ padding: '8px 0' }}>
            {[1, 2, 3, 4, 5].map((step) => (
              <Flex key={step} align="flex-start" gap={12}>
                <Skeleton.Avatar active size={16} shape="circle" style={{ marginTop: 2 }} />
                <Flex vertical gap={4} style={{ flex: 1 }}>
                  <Skeleton.Input active style={{ width: 140, height: 16 }} />
                  <Skeleton.Input active style={{ width: 180, height: 14 }} />
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Col>
    </Row>

    {/* Bottom Action Buttons Skeleton */}
    <Flex gap={16} style={{ width: '100%' }}>
      <Skeleton.Button active style={{ flex: 1, height: 48 }} />
      <Skeleton.Button active style={{ flex: 1, height: 48 }} />
    </Flex>
  </Flex>
);

export default EarlyWarningDetailSkeleton;
