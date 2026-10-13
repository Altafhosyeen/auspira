'use client';

import { Card, Col, Flex, Row, Skeleton } from 'antd';

// Loading placeholder for the PMI detail screen — pure antd skeletons, no custom styles.
const PmiDetailSkeleton = () => (
  <Flex vertical gap={16}>
    <Card styles={{ body: { padding: '12px 20px' } }}>
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Flex align="center" gap={12}>
          <Skeleton.Avatar active shape="square" />
          <Skeleton.Input active />
        </Flex>
        <Skeleton.Button active />
      </Flex>
    </Card>

    <Skeleton.Button active block />

    <Flex gap={24} style={{ borderBottom: '1px solid #EAECF0', paddingBottom: 12 }}>
      {['overview', 'audit', 'attachment', 'email', 'ce'].map((tabName) => (
        <Skeleton.Input key={tabName} active />
      ))}
    </Flex>

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Flex align="center" gap={8}>
              <Skeleton.Avatar active shape="square" />
              <Skeleton.Input active />
            </Flex>
          }
        >
          <Flex vertical gap={16} style={{ padding: '8px 16px' }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Flex key={item} align="flex-start" gap={24}>
                <Skeleton.Input active />
                <Skeleton.Input active />
              </Flex>
            ))}
          </Flex>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={<Skeleton.Input active />}>
          <Flex vertical gap={20} style={{ padding: '8px 0' }}>
            {[1, 2, 3, 4, 5].map((step) => (
              <Flex key={step} align="flex-start" gap={12}>
                <Skeleton.Avatar active shape="circle" />
                <Flex vertical gap={4} style={{ flex: 1 }}>
                  <Skeleton.Input active />
                  <Skeleton.Input active />
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Col>
    </Row>
  </Flex>
);

export default PmiDetailSkeleton;
