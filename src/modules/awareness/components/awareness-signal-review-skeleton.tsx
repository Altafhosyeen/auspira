'use client';

import { Card, Col, Flex, Row, Skeleton } from 'antd';

export const AwarenessSignalReviewSkeleton = () => (
  <Flex vertical gap={16}>
    {/* Title & Banner Skeleton */}
    <Flex vertical gap={8}>
      <Skeleton.Input active style={{ width: 280, height: 32 }} />
      <Skeleton.Input active style={{ width: 450, height: 20 }} />
    </Flex>
    <Skeleton.Button active block style={{ height: 40 }} />

    {/* 2-Column Layout */}
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Flex vertical gap={16}>
          {/* Email Card Skeleton */}
          <Card>
            <Flex vertical gap={16}>
              <Flex justify="space-between" align="center">
                <Flex align="center" gap={8}>
                  <Skeleton.Avatar active size={32} shape="circle" />
                  <Skeleton.Input active style={{ width: 220, height: 24 }} />
                </Flex>
                <Skeleton.Input active style={{ width: 120, height: 20 }} />
              </Flex>
              <Skeleton active paragraph={{ rows: 2 }} title={{ width: 140 }} />
              <Skeleton active paragraph={{ rows: 6 }} title={false} />
            </Flex>
          </Card>

          {/* Assessment Card Skeleton */}
          <Card>
            <Flex vertical gap={12}>
              <Skeleton.Input active style={{ width: 340, height: 20 }} />
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            </Flex>
          </Card>

          {/* Comment Box Skeleton */}
          <Card>
            <Flex vertical gap={12}>
              <Skeleton.Input active style={{ width: 100, height: 20 }} />
              <Skeleton.Input active block style={{ height: 72 }} />
            </Flex>
          </Card>

          {/* Action Buttons Skeleton */}
          <Flex vertical gap={12}>
            <Flex gap={12}>
              <Skeleton.Button active block style={{ height: 40 }} />
              <Skeleton.Button active block style={{ height: 40 }} />
            </Flex>
            <Skeleton.Button active block style={{ height: 40 }} />
          </Flex>
        </Flex>
      </Col>

      {/* Right Rail */}
      <Col xs={24} lg={8}>
        <Flex vertical gap={16}>
          {/* Documents & Communication Skeleton */}
          <Card>
            <Flex vertical gap={16}>
              <Skeleton.Input active style={{ width: 180, height: 24 }} />
              <Skeleton.Button active block style={{ height: 32 }} />
              <Skeleton active paragraph={{ rows: 5 }} title={false} />
            </Flex>
          </Card>

          {/* Confidence Score Skeleton */}
          <Card>
            <Flex vertical gap={12}>
              <Skeleton.Input active style={{ width: 140, height: 20 }} />
              <Skeleton.Input active style={{ width: 80, height: 36 }} />
              <Skeleton.Button active block style={{ height: 8 }} />
            </Flex>
          </Card>
        </Flex>
      </Col>
    </Row>
  </Flex>
);

export default AwarenessSignalReviewSkeleton;
