'use client';

import { Button, Typography } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'nextjs-toploader/app';
import { NON_MENU_PATHS } from '@/constants';

const { Title, Text } = Typography;

const VerificationSuccess = () => {
  const route = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/assets/images/aspuria-logo.png"
            alt="Verification Success"
            width={200}
            height={200}
            className="h-auto w-40"
          />
        </div>

        {/* Title */}
        <Title level={3} className="!mb-2 font-bold!">
          Verification Successful!
        </Title>

        {/* Description */}
        <Text className="mb-8 block text-gray-500">
          Set up your organisation to get started with Auspira
        </Text>

        {/* Button */}
        <Button
          onClick={() => route.push(NON_MENU_PATHS.LOGIN)}
          type="primary"
          size="large"
          className="h-11 w-full rounded-l text-sm font-medium"
        >
          Let’s get started
        </Button>

        {/* Footer */}
        <div className="mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccess;
