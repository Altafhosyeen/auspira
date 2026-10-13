'use client';

import { Form, Input, Button, Checkbox, notification } from 'antd';
import { signIn, getSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: '/',
      });

      if (!result || result.error) {
        notification.error({
          description: result?.error,
        });
        return;
      }

      const session = await getSession();
      const name = session?.user?.name;

      if (name) {
        notification.success({
          message: 'Login Successful',
          description: `Welcome back, ${name}!`,
        });
      }

      const nextPath =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('next')
          : null;

      const redirectPath = nextPath && nextPath.startsWith('/') ? nextPath : '/';

      router.replace(redirectPath);
    } catch (error) {
      console.log(error);
      /* ---------------------------------- error --------------------------------- */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">
      <div className="pb-3">
        <Image
          src="/assets/images/aspuria-logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>
      {/* Header */}
      <div className="text-center">
        <p className="text-2xl font-semibold text-gray-800">Welcome back to Auspira</p>
        <p className="mt-1 text-sm text-gray-400">Enter your credentials to access your account</p>
      </div>

      {/* Form */}
      <Form
        layout="vertical"
        onFinish={handleLogin}
        requiredMark={false}
        // initialValues={{
        //   email: 'admin@auspira.com',
        //   password: 'Admin@123!',
        // }}
      >
        {/* Email */}
        <Form.Item
          name="email"
          label={<span className="font-semibold!">Username</span>}
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input size="large" placeholder="john.doe@example.com" autoComplete="email" />
        </Form.Item>

        {/* Password */}

        <Form.Item
          label={<span className="font-semibold!">Password</span>}
          name="password"
          rules={[{ required: true, message: 'Password is required' }]}
        >
          <Input.Password type={'password'} size="large" placeholder="Enter your password" />
        </Form.Item>
        <div
          onClick={() => router.push('/forget-password')}
          className="mb-2 flex w-full items-center justify-end"
        >
          <span className="-mt-5! cursor-pointer text-xs font-semibold text-[#1E7BCC] hover:underline">
            Forgot Password?
          </span>
        </div>
        {/* Remember */}
        <Form.Item>
          <Checkbox>Remember Me</Checkbox>
        </Form.Item>

        {/* Submit */}
        <Form.Item className="mb-0">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={loading}
            disabled={loading}
            className="w-full rounded-lg bg-[#1E7BCC] hover:bg-[#1666A3]"
          >
            Sign in
          </Button>
        </Form.Item>
      </Form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-500">
        New on our Auspira?{' '}
        <Link
          href="/organization-registration"
          className="font-medium text-[#1E7BCC] hover:underline"
        >
          Create an organisation account
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
