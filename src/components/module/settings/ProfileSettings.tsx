'use client';

import {
  CheckCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Form, Input, notification, Progress, Tabs, Tag } from 'antd';
import { BriefcaseBusiness } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import CardX from '@/components/shared/CardX';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import PageX from '@/components/shared/PageX';
import { useChangePassword } from '@/hooks/modules/auth';
import { useUpdateProfile } from '@/hooks/modules/users';
import { useAuthStore } from '@/store/auth.store';

// ─── Password Strength Utils ─────────────────────────────────────────────────

const calculatePasswordStrength = (
  password: string
): { strength: number; label: string; color: string } => {
  let strength = 0;

  if (!password) return { strength: 0, label: '', color: '' };

  // Length
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;

  // Lowercase
  if (/[a-z]/.test(password)) strength += 15;

  // Uppercase
  if (/[A-Z]/.test(password)) strength += 15;

  // Numbers
  if (/[0-9]/.test(password)) strength += 15;

  // Special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;

  let label = 'Weak';
  let color = '#ef4444';

  if (strength >= 25 && strength < 50) {
    label = 'Fair';
    color = '#f97316';
  } else if (strength >= 50 && strength < 75) {
    label = 'Good';
    color = '#eab308';
  } else if (strength >= 75) {
    label = 'Strong';
    color = '#22c55e';
  }

  return { strength: Math.min(strength, 100), label, color };
};

// ─── Change Password ─────────────────────────────────────────────────────────

interface ChangePasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordTab: React.FC = () => {
  const [form] = Form.useForm<ChangePasswordFields>();
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' });
  const { mutateAsync: changePassword, isPending } = useChangePassword();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    const strength = calculatePasswordStrength(pwd);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (values: ChangePasswordFields) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      notification.success({ message: 'Password updated successfully' });
      form.resetFields();
      setPasswordStrength({ strength: 0, label: '', color: '' });
    } catch {
      // API errors are already handled globally by lib/api/error-handler.ts
    }
  };

  return (
    <div className="">
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="">
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="••••••••"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Please enter a new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="••••••••"
            size="large"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {/* Password Strength Indicator */}
        {passwordStrength.label && (
          <div className="-mt-2 mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Password Strength</span>
              <Tag
                color={passwordStrength.color}
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                icon={passwordStrength.strength >= 75 ? <CheckCircleOutlined /> : undefined}
              >
                {passwordStrength.label}
              </Tag>
            </div>
            <Progress
              percent={passwordStrength.strength}
              strokeColor={passwordStrength.color}
              size="small"
              showInfo={false}
              className="mb-3"
            />
            <div className="text-xs text-gray-500">
              {passwordStrength.strength < 50 && (
                <>
                  <ExclamationCircleOutlined className="mr-1 text-orange-500" />
                  Add uppercase, numbers, or special characters for a stronger password
                </>
              )}
              {passwordStrength.strength >= 50 && passwordStrength.strength < 75 && (
                <>
                  <CheckCircleOutlined className="mr-1 text-yellow-500" />
                  Good password. Consider adding special characters
                </>
              )}
              {passwordStrength.strength >= 75 && (
                <>
                  <CheckCircleOutlined className="mr-1 text-green-500" />
                  Strong password
                </>
              )}
            </div>
          </div>
        )}

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="••••••••"
            size="large"
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isPending} size="large">
          <SaveOutlined />
          Update Password
        </Button>
      </Form>
    </div>
  );
};

// ─── Profile Info ─────────────────────────────────────────────────────────────

const ProfileTab: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Sync form fields with user data whenever user changes
  useEffect(() => {
    if (user && !editing) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber ?? '',
        jobTitle: user.jobTitle ?? '',
      });
    }
  }, [user, editing, form]);

  const handleSave = async (values: {
    fullName: string;
    phoneNumber: string;
    jobTitle: string;
  }) => {
    setLoading(true);
    try {
      const updatedUser = await updateProfile({
        values: {
          name: values.fullName,
          phoneNumber: values.phoneNumber || null,
          jobTitle: values.jobTitle || null,
          contractor: null,
          areasOfInterest: null,
        },
      });

      // Explicitly update the store with the response
      if (updatedUser) {
        setUser(updatedUser);
      }

      notification.success({
        message: 'Profile Updated',
        description: 'Your profile information has been updated successfully',
      });
      setEditing(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update profile';
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Avatar section */}
      {!editing && (
        <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-8">
          <Avatar
            size={80}
            className="bg-theme-primary text-2xl font-semibold"
            icon={!initials ? <UserOutlined /> : undefined}
          >
            {initials}
          </Avatar>
          <div className="text-center">
            <p className="my-0 text-xl font-bold text-gray-900">{user?.fullName}</p>
            <p className="mt-0.5 text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
      )}

      {/* Info cards (read mode) */}
      {!editing && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <InfoCard icon={<UserOutlined />} label="Full Name" value={user?.fullName} />
            <InfoCard icon={<MailOutlined />} label="Email Address" value={user?.email} />
            <InfoCard
              icon={<PhoneOutlined />}
              label="Phone Number"
              value={user?.phoneNumber ?? '—'}
            />
            <InfoCard
              icon={<BriefcaseBusiness size={16} className="text-current" />}
              label="Job Title"
              value={user?.jobTitle ?? '—'}
            />
          </div>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                fullName: user?.fullName,
                phoneNumber: user?.phoneNumber ?? '',
                jobTitle: user?.jobTitle ?? '',
              });
              setEditing(true);
            }}
          >
            Edit Profile
          </Button>
        </>
      )}

      {/* Edit form */}
      {editing && (
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} size="large" />
          </Form.Item>
          <DisabledTooltip disabled reason="Email address cannot be changed.">
            <Form.Item label="Email Address" name="email">
              <Input prefix={<MailOutlined className="text-gray-400" />} disabled size="large" />
            </Form.Item>
          </DisabledTooltip>
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[
              {
                pattern: /^\+[1-9]\d{0,3}[\s-]?[\d()\s-]{6,20}$/,
                required: true,
                message:
                  'Please enter a valid phone number with country code (e.g., +1 996 448 2775)',
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              size="large"
              type="tel"
              placeholder="e.g., +1 996 448 2775"
            />
          </Form.Item>
          <Form.Item
            label="Job Title"
            name="jobTitle"
            rules={[
              { required: true, message: 'Please enter your job title' },
              { max: 100, message: 'Job title cannot exceed 100 characters' },
            ]}
          >
            <Input
              prefix={<BriefcaseBusiness size={16} className="text-gray-400" />}
              size="large"
            />
          </Form.Item>
          <div className="flex gap-2">
            <Button type="primary" htmlType="submit" loading={loading}>
              <SaveOutlined />
              Save Changes
            </Button>
            <Button onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </Form>
      )}
    </div>
  );
};

// ─── Info Card ────────────────────────────────────────────────────────────────

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({
  icon,
  label,
  value,
}) => {
  const iconElement = typeof icon === 'string' ? null : icon;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all duration-200 hover:border-gray-300 hover:shadow-sm">
      <span className="bg-theme-primary bg-opacity-10 text-theme-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base">
        {iconElement}
      </span>
      <div className="min-w-0 flex-1">
        <p className="my-0 text-xs font-medium text-gray-600">{label}</p>
        <p className="my-0 truncate text-sm font-semibold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfileSettings: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          Profile
        </span>
      ),
      children: <ProfileTab />,
    },
    {
      key: 'security',
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          Security
        </span>
      ),
      children: <ChangePasswordTab />,
    },
  ];

  const statusBadge =
    user?.status === 1 ? (
      <Tag color="success" className="rounded-full px-2 py-0.5 text-xs">
        Active
      </Tag>
    ) : null;

  return (
    <PageX
      heading={<span>Account Settings {statusBadge}</span>}
      subheading="Manage your profile and security preferences"
    >
      <div className="mt-6">
        <CardX
          className="mt-4"
          style={{
            boxShadow: 'none',
            border: '1px solid #e5e7eb',
          }}
        >
          <Tabs items={tabItems} defaultActiveKey="profile" />
        </CardX>
      </div>
    </PageX>
  );
};

export default ProfileSettings;
