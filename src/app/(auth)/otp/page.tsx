'use client';

import { Button, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Image from 'next/image';
import AuthCard from '@/components/module/auth/AuthCard';
import OtpInput from 'react-otp-input';
import { useState } from 'react';
import { useResendOTP, useVerifyOTP } from '@/hooks/modules/auth';
import { useSearchParams } from 'next/navigation';

import { useRouter } from 'nextjs-toploader/app';
export default function OTP() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { mutateAsync: verifyOTPMutation, isPending: isVerifying } = useVerifyOTP();
  const { mutateAsync: resendOTPMutation, isPending: isResending } = useResendOTP();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOrg = searchParams.get('org') === 'true';
  const email = searchParams.get('email') ?? '';

  const handleVerify = async () => {
    if (!otp || otp.length < 5) {
      notification.error({
        message: 'Enter Valid OTP',
        description: 'Please enter the 5-digit OTP sent to your email.',
        placement: 'topRight',
      });
      return;
    }
    try {
      const response = await verifyOTPMutation({
        email: email,
        OTP: otp,
      });
      if (!isOrg) {
        // Response is void, so navigate to setup-password without token
        setTimeout(() => {
          router.push(
            '/setup-password?email=' + email + '&token=' + (response as any)?.resetPasswordToken
          );
        }, 1500);
        notification.success({
          message: 'OTP is verified',
          description: 'Your OTP has been verified successfully!.',
          placement: 'topRight',
        });
      }
      if (isOrg) {
        router.push('/succeed');
        notification.success({
          message: 'OTP Verified',
          description: 'Your OTP has been verified successfully!.',
          placement: 'topRight',
        });
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    if (!email) {
      setError('Email is missing. Cannot resend OTP.');
      setIsLoading(false);
      return;
    }

    try {
      // Call your resend OTP API here
      await resendOTPMutation({ email: email });
      setError('');
      // Show success message
      notification.success({
        message: 'OTP Resent',
        description: `A new OTP has been sent to ${formatEmailForDisplay(email)}`,
        placement: 'topRight',
      });
    } catch {
      console.log('');
    } finally {
      setIsLoading(false);
    }
  };

  // Format email for display (mask it)
  const formatEmailForDisplay = (email: string) => {
    if (!email) return 'your email';
    const [username, domain] = email.split('@');
    if (username.length <= 4) return email;
    const maskedUsername = username.slice(0, 3) + '...' + username.slice(-2);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#f6f7ff] px-4">
      <AuthCard
        icon={
          <Image
            src="/assets/images/aspuria-logo.png"
            alt="Email Verification"
            width={200}
            height={200}
          />
        }
        title="Code Verification"
        description={`We just sent code to your Email ${formatEmailForDisplay(email)}`}
        footer={
          <p className="text-center text-sm text-gray-500">
            Didn't receive code?{' '}
            <button
              onClick={handleResendOTP}
              className="cursor-pointer font-medium text-blue-600 hover:underline"
              disabled={isLoading}
            >
              Resend
            </button>
          </p>
        }
      >
        {/* OTP Label */}
        <label className="mb-2 block text-sm text-gray-600">Enter OTP</label>

        {/* OTP Inputs */}
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={5}
          renderInput={(props) => {
            // A box turns blue as soon as it holds a digit; red on error, grey when empty.
            const isFilled = Boolean(props.value);
            const idleBorder = error ? '#ff4d4f' : isFilled ? '#1677ff' : '#d1d5db';
            return (
              <input
                {...props}
                type="text"
                inputMode="numeric"
                style={{
                  ...props.style,
                  width: '100%',
                  height: '52px',
                  borderRadius: '10px',
                  border: `1px solid ${idleBorder}`,
                  fontSize: '20px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
                onKeyPress={(e) => {
                  // Only allow numeric input (0-9)
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #1677ff';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = `1px solid ${idleBorder}`;
                }}
              />
            );
          }}
          containerStyle="grid grid-cols-5 gap-3 mb-4"
        />

        {/* Verify Button */}
        <Button
          type="primary"
          size="large"
          disabled={isResending || isVerifying || !otp || otp.length < 5 || !email}
          block
          loading={isVerifying}
          onClick={handleVerify}
          // disabled={!otp || otp.length < 5 || !email}
        >
          Verify
        </Button>

        {/* Escape hatch back to the login screen */}
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/login')}
          className="mt-2 w-full text-gray-500 hover:text-blue-600!"
        >
          Back to login
        </Button>
      </AuthCard>
    </div>
  );
}
