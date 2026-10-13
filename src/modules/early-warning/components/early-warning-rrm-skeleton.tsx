'use client';

import { Card, Col, Flex, Row, Skeleton } from 'antd';

export const EarlyWarningRrmSkeleton = () => (
  <Flex vertical gap={16}>
    <Flex vertical gap={8}>
      <Skeleton.Input active style={{ width: 280, height: 32 }} />
      <Skeleton.Input active style={{ width: 450, height: 20 }} />
    </Flex>
    <Skeleton.Button active block style={{ height: 40 }} />

    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Flex vertical gap={16}>
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((k) => (
              <Col key={k} xs={24} sm={12} lg={6}>
                <Card size="small" style={{ height: 112 }}>
                  <Flex vertical gap={8}>
                    <Skeleton.Input active style={{ width: 60, height: 14 }} />
                    <Skeleton.Input active style={{ width: 100, height: 28 }} />
                    <Skeleton.Input active style={{ width: 80, height: 12 }} />
                  </Flex>
                </Card>
              </Col>
            ))}
          </Row>

          <Card>
            <Flex vertical gap={16}>
              <Skeleton.Input active style={{ width: 160, height: 24 }} />
              <Skeleton active paragraph={{ rows: 6 }} title={false} />
            </Flex>
          </Card>

          <Card>
            <Flex vertical gap={16}>
              <Skeleton.Input active style={{ width: 140, height: 24 }} />
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            </Flex>
          </Card>
        </Flex>
      </Col>

      <Col xs={24} lg={8}>
        <Flex vertical gap={16}>
          <Card>
            <Flex vertical gap={16}>
              <Skeleton.Input active style={{ width: 180, height: 24 }} />
              <Skeleton.Button active block style={{ height: 32 }} />
              <Skeleton active paragraph={{ rows: 6 }} title={false} />
            </Flex>
          </Card>
          <Flex gap={12}>
            <Skeleton.Button active block style={{ height: 40 }} />
            <Skeleton.Button active block style={{ height: 40 }} />
          </Flex>
        </Flex>
      </Col>
    </Row>
  </Flex>
);

export default EarlyWarningRrmSkeleton;
