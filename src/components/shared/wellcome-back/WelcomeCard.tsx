'use client';

import React from 'react';
import { Card, Button, Typography } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Text } = Typography;

const WelcomeCard: React.FC = () => {
  return (
    <Card className="w-[420px] rounded-xl text-center shadow-md [&>.ant-card-body]:px-8 [&>.ant-card-body]:py-10">
      <Image
        src="/assets/images/aspuria-logo.png"
        alt="Welcome Back"
        width={80}
        height={80}
        className="mx-auto mb-6"
        quality={100}
      />
      <Title level={3} className="!mb-3 font-bold!">
        Welcome back to Auspira
      </Title>

      <Text type="secondary" className="mb-8 block text-sm">
        Set up your organisation to get started with Auspira
      </Text>

      <Button
        type="primary"
        size="large"
        block
        className="mb-5 h-11"
        onClick={() => {
          // redirect /
          window.location.href = '/';
        }}
      >
        Let's get started
      </Button>

      <Text type="secondary" className="text-sm">
        New on our Auspira?{' '}
        <Link href="/login" className="text-[var(--theme-primary)]">
          Sign In
        </Link>
      </Text>
    </Card>
  );
};

export default WelcomeCard;
