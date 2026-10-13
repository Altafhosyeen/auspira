'use client';

import { Input, Button, notification } from 'antd';
import Image from 'next/image';
import AuthCard from '@/components/module/auth/AuthCard';
import { useForgotPassword } from '@/hooks/modules/auth';
import { useRouter } from 'nextjs-toploader/app';
import { NON_MENU_PATHS } from '@/constants';
import { useState } from 'react';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const { mutateAsync: forgetPassword, isPending } = useForgotPassword();

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleChange = (value: string) => {
    setEmail(value);

    if (!value) {
      setError('');
      return;
    }

    if (!validateEmail(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  const handleForgetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const res = await forgetPassword({ email });

      if (!(res as any)?.userExists) {
        notification.error({
          message: 'User Not Found',
          description: 'No account found with this email address.',
          placement: 'topRight',
        });
        return;
      }

      notification.success({
        message: 'OTP Sent',
        description: 'A verification code has been sent to your email.',
        placement: 'topRight',
      });

      router.push(`${NON_MENU_PATHS.OTP}?email=${encodeURIComponent(email)}`);
    } catch (error) {
      // Message only — the full error object can carry the request payload.
      console.error('Forgot password error:', error instanceof Error ? error.message : 'unknown');
      notification.error({
        message: 'Request Failed',
        description: 'Could not send the verification code. Please try again.',
        placement: 'topRight',
      });
    }
  };

  return (
    <AuthCard
      icon={
        <Image
          src="/assets/images/aspuria-logo.png"
          alt="Email Verification"
          width={100}
          height={100}
        />
      }
      title="Verify Email"
      description="Enter your email to receive a verification code for password reset."
      footer={
        <p className="text-sm text-gray-600">
          New on our Auspira?{' '}
          <Link href={NON_MENU_PATHS.ORGANIZATION_REGISTRATION} className="text-[#1E7BCC]">
            Create an organisation account
          </Link>
        </p>
      }
    >
      <div>
        <label className="mb-1 block text-sm text-gray-600">Email</label>

        <Input
          placeholder="john.doe@example.com"
          size="large"
          type="email"
          value={email}
          onChange={(e) => handleChange(e.target.value)}
        />

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <Button loading={isPending} type="primary" block size="large" onClick={handleForgetPassword}>
        Send OTP
      </Button>
    </AuthCard>
  );
}
