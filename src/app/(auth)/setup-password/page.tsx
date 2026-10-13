'use client';

import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, notification, Progress } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthCard from '@/components/module/auth/AuthCard';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { useResetPassword } from '@/hooks/modules/auth';
import { useAuthStore } from '@/store/auth.store';

export default function Page() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [password, setPassword] = useState('');
  const [isPreparingResetFlow, setIsPreparingResetFlow] = useState(false);
  const hasSignedOutRef = useRef(false);
  const setUser = useAuthStore((state) => state.setUser);

  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';
  // The backend generates the reset link with the token URL-encoded (%2F, %2B, …)
  // and validates it in that exact form. useSearchParams() auto-decodes query
  // values, so re-encode to send the token exactly as it appears in the link.
  // (The space→'+' replace first restores any '+' that decoding turned into a space.)
  const token = encodeURIComponent((searchParams.get('token') || '').replace(/ /g, '+'));

  useEffect(() => {
    if (hasSignedOutRef.current) return;
    if (!email && !token) return;

    hasSignedOutRef.current = true;

    void (async () => {
      try {
        setIsPreparingResetFlow(true);
        await signOut({ redirect: false });
        setUser(null);

        // `token` is already URL-encoded — encoding it again here would
        // double-encode it (%2F → %252F) after the URL rewrite.
        const resetUrl = `/setup-password?email=${encodeURIComponent(email)}&token=${token}`;
        router.replace(resetUrl);
      } finally {
        setIsPreparingResetFlow(false);
      }
    })();
  }, [email, token, router, setUser]);

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  // Validate required parameters
  const isValidParams = email && token;

  // Password requirements status
  const requirementsStatus = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[\W_]/.test(password),
    };
  }, [password]);

  // Check if all requirements are met
  const allRequirementsMet = Object.values(requirementsStatus).every((req) => req);

  const isSubmitDisabled = !isValidParams || !allRequirementsMet || isPreparingResetFlow;
  const submitDisabledReason = !isValidParams
    ? 'Email and token are required. Please use a valid reset link.'
    : !allRequirementsMet
      ? 'Password does not meet all requirements'
      : isPreparingResetFlow
        ? 'Preparing the reset flow — please wait.'
        : '';

  // Calculate password strength
  const requirementsMet = Object.values(requirementsStatus).filter((req) => req).length;
  const strengthPercent = (requirementsMet / 5) * 100;

  let strengthLevel = 'Poor';
  let strengthColor = '#FF4D4F'; // red

  if (requirementsMet === 0) {
    strengthLevel = 'None';
    strengthColor = '#D9D9D9'; // gray
  } else if (requirementsMet === 1) {
    strengthLevel = 'Very Weak';
    strengthColor = '#FF4D4F'; // red
  } else if (requirementsMet === 2) {
    strengthLevel = 'Weak';
    strengthColor = '#FF7A45'; // orange
  } else if (requirementsMet === 3) {
    strengthLevel = 'Fair';
    strengthColor = '#FAAD14'; // yellow
  } else if (requirementsMet === 4) {
    strengthLevel = 'Good';
    strengthColor = '#52C41A'; // light green
  } else if (requirementsMet === 5) {
    strengthLevel = 'Strong';
    strengthColor = '#1890FF'; // blue
  }

  // The live requirements checklist below is the detailed feedback, so the field
  // itself only shows one short, stable message — long per-rule errors shift the layout.
  const passwordRules = [
    {
      required: true,
      message: 'Please enter your password',
    },
    {
      validator: (_: unknown, value: string) => {
        if (!value) return Promise.resolve();
        const meetsAll =
          value.length >= 8 &&
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /[0-9]/.test(value) &&
          /[\W_]/.test(value);
        return meetsAll
          ? Promise.resolve()
          : Promise.reject(new Error('Password does not meet all requirements'));
      },
    },
  ];

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    // Validate parameters before submission
    if (!email) {
      notification.error({
        message: 'Email is missing',
        description: 'Please request a new password reset link.',
      });
      return;
    }

    if (!token) {
      notification.error({
        message: 'Reset token is missing or invalid',
        description: 'Please request a new password reset link.',
      });
      return;
    }

    try {
      await resetPassword({
        email,
        token,
        newPassword: values.password,
      });

      notification.success({
        message: 'Password Reset Successful',
        description:
          'Your password has been reset successfully. Please log in with your new password.',
      });
      router.push('/succeed');
    } catch (error) {
      // Log the message only — the full AxiosError carries the request body
      // (which includes the new password) and console.error survives prod builds.
      console.error(
        'Error resetting password:',
        error instanceof Error ? error.message : 'unknown'
      );
    }
  };

  return (
    <AuthCard
      icon={
        <Image src="/assets/images/aspuria-logo.png" alt="Verification" width={150} height={150} />
      }
      title="Create Password"
      description="Create a secure password to get started with Auspira"
      footer={
        <p>
          New on our Auspira?{' '}
          <Link
            href="organization-registration"
            className="font-medium text-[#1E7BCC] hover:underline"
          >
            Create an organisation account
          </Link>
        </p>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Invalid Parameters Alert */}
        {!isValidParams && (
          <Alert
            message="Invalid Password Reset Link"
            description={`${!email ? 'Email is missing. ' : ''}${!token ? 'Reset token is missing or invalid. ' : ''}Please request a new password reset link.`}
            type="error"
            showIcon
            closable
            className=""
          />
        )}
        {/* New Password */}
        <Form.Item
          label={<span className="text-[16px] font-medium text-[#374151]">New Password</span>}
          name="password"
          rules={passwordRules}
          validateFirst
        >
          <Input.Password
            size="large"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label={<span className="text-[16px] font-medium text-[#374151]">Confirm Password</span>}
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: 'Please confirm your password',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password size="large" placeholder="••••••••••" />
        </Form.Item>

        {/* Password Strength & Requirements — hidden until the user starts typing,
            matching the Create Organisation  Account step. */}
        {password && (
          <div className="pt-2">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#374151]">Password Strength:</span>
                <span className="text-[14px] font-semibold" style={{ color: strengthColor }}>
                  {strengthLevel}
                </span>
              </div>
              <Progress
                percent={Math.round(strengthPercent)}
                strokeColor={strengthColor}
                showInfo={false}
                size="small"
              />
            </div>

            {/* Checklist disappears once every rule is met — the Strong bar is enough. */}
            {!allRequirementsMet && (
              <>
                <h4 className="mb-3 text-[16px] font-bold text-[#374151]">
                  Password Requirements:
                </h4>

                <ul className="space-y-2 pl-2 text-[15px] leading-7">
                  <li className="flex items-center gap-2">
                    {requirementsStatus.minLength ? (
                      <CheckCircleOutlined className="shrink-0 text-green-500" />
                    ) : (
                      <CloseCircleOutlined className="shrink-0 text-gray-300" />
                    )}
                    <span
                      className={requirementsStatus.minLength ? 'text-green-600' : 'text-[#6B7280]'}
                    >
                      Minimum 8 characters long
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {requirementsStatus.hasUppercase ? (
                      <CheckCircleOutlined className="shrink-0 text-green-500" />
                    ) : (
                      <CloseCircleOutlined className="shrink-0 text-gray-300" />
                    )}
                    <span
                      className={
                        requirementsStatus.hasUppercase ? 'text-green-600' : 'text-[#6B7280]'
                      }
                    >
                      At least one uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {requirementsStatus.hasLowercase ? (
                      <CheckCircleOutlined className="shrink-0 text-green-500" />
                    ) : (
                      <CloseCircleOutlined className="shrink-0 text-gray-300" />
                    )}
                    <span
                      className={
                        requirementsStatus.hasLowercase ? 'text-green-600' : 'text-[#6B7280]'
                      }
                    >
                      At least one lowercase letter
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    {requirementsStatus.hasNumber ? (
                      <CheckCircleOutlined className="shrink-0 text-green-500" />
                    ) : (
                      <CloseCircleOutlined className="shrink-0 text-gray-300" />
                    )}
                    <span
                      className={requirementsStatus.hasNumber ? 'text-green-600' : 'text-[#6B7280]'}
                    >
                      At least one number
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {requirementsStatus.hasSpecial ? (
                      <CheckCircleOutlined className="shrink-0 text-green-500" />
                    ) : (
                      <CloseCircleOutlined className="shrink-0 text-gray-300" />
                    )}
                    <span
                      className={
                        requirementsStatus.hasSpecial ? 'text-green-600' : 'text-[#6B7280]'
                      }
                    >
                      At least one special character
                    </span>
                  </li>
                </ul>
              </>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Form.Item className="mt-8! mb-0!">
          <DisabledTooltip disabled={isSubmitDisabled} reason={submitDisabledReason}>
            <Button
              loading={isPending}
              type="primary"
              htmlType="submit"
              className="w-full"
              disabled={isSubmitDisabled}
              title={submitDisabledReason}
            >
              Set Password
            </Button>
          </DisabledTooltip>
        </Form.Item>
      </Form>
    </AuthCard>
  );
}
