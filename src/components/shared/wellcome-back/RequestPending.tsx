'use client';

import React from 'react';
import { Typography } from 'antd';
import Image from 'next/image';

const { Title, Text } = Typography;

const RequestPending: React.FC = () => {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
      <div className="relative mt-10 h-[300px] w-[300px]">
        <Image
          src="/assets/images/request-pending.png"
          alt="Request Pending"
          fill
          priority
          className="object-contain"
        />
      </div>
      <Title level={3} style={{ marginBottom: 16, fontWeight: 700 }}>
        Request Pending
      </Title>
      <Text type="secondary" style={{ display: 'block', fontSize: 14, lineHeight: 1.6 }}>
        Your request has been submitted and is currently being reviewed by the system administrator.
        You'll be notified once it's approved.
      </Text>
    </div>
  );
};

export default RequestPending;
