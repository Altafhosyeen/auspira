import React, { useState } from 'react';
import { Form, Input, Row, Col, Checkbox, notification, Progress } from 'antd';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { FormInstance } from 'antd';

import InputX from '@/components/antd/InputX';
import { verifyEmail } from '@/hooks/modules/users';

interface AccountDetailsFormProps {
  form?: FormInstance;
  onFinish?: (values: any) => void;
  onValuesChange?: (changedValues: any, allValues: any) => void;
}

const itemStyle = {
  marginBottom: 8,
};

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({
  form: externalForm,
  onFinish,
  onValuesChange,
}) => {
  const [internalForm] = Form.useForm();
  const form = externalForm ?? internalForm;

  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const requirementsStatus = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[\W_]/.test(password),
  };
  const allRequirementsMet = Object.values(requirementsStatus).every(Boolean);

  // Password validation — the live requirements checklist below the fields is the
  // detailed feedback, so the field itself only shows one short, stable message.
  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please enter a password'));
    }

    const meetsAll =
      value.length >= 8 &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[\W_]/.test(value);

    if (!meetsAll) {
      return Promise.reject(new Error('Password does not meet all requirements'));
    }

    return Promise.resolve();
  };

  // Verify the work email is not already registered — runs on blur only
  const validateEmailExists = async (_: any, value: string) => {
    const email = value?.trim();

    // Let the `required` and `type: 'email'` rules own empty/invalid cases —
    // no point hitting the API until we have a well-formed address.
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Promise.resolve();
    }

    try {
      const res = await verifyEmail(email);

      // Backend returns { email, isAvailable } — isAvailable: false = taken.
      if (res?.isAvailable === false) {
        return Promise.reject(new Error(res?.message || 'This email is already registered'));
      }

      return Promise.resolve();
    } catch {
      // Network/backend error — don't block registration on a failed check.
      return Promise.resolve();
    }
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please confirm your password'));
    }

    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match'));
    }

    return Promise.resolve();
  };

  const handleFinish = (values: any) => {
    if (!termsAccepted) {
      notification.error({
        message: 'Terms Required',
        description: 'Please accept the terms of service to continue.',
        placement: 'topRight',
      });

      return;
    }

    if (!consentAccepted) {
      notification.error({
        message: 'Consent Required',
        description: 'Please consent to data processing to continue.',
        placement: 'topRight',
      });

      return;
    }

    onFinish?.({
      ...values,
      termsAccepted,
      consentAccepted,
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);

    notification.error({
      message: 'Validation Error',
      description: 'Please check the form for errors and try again.',
      placement: 'topRight',
    });
  };

  // Password strength
  const getPasswordStrength = () => {
    const requirementsMet = Object.values(requirementsStatus).filter((req) => req).length;

    if (requirementsMet === 0) {
      return {
        color: '#D9D9D9',
        text: 'None',
        percent: 0,
      };
    }

    if (requirementsMet === 1) {
      return {
        color: '#ff4d4f',
        text: 'Very Weak',
        percent: 20,
      };
    }

    if (requirementsMet === 2) {
      return {
        color: '#FF7A45',
        text: 'Weak',
        percent: 40,
      };
    }

    if (requirementsMet === 3) {
      return {
        color: '#faad14',
        text: 'Fair',
        percent: 60,
      };
    }

    if (requirementsMet === 4) {
      return {
        color: '#52c41a',
        text: 'Good',
        percent: 80,
      };
    }

    return {
      color: '#1890FF',
      text: 'Strong',
      percent: 100,
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        className="compact-form"
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChange}
        initialValues={{
          fullName: '',
          jobTitle: '',
          workEmail: '',
          mobile: '',
        }}
      >
        <Row gutter={[24, 0]}>
          {/* Full Name */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Full Name"
              name="fullName"
              style={itemStyle}
              rules={[
                {
                  required: true,
                  message: 'Please enter your full name',
                },
              ]}
            >
              <InputX placeholder="Enter your full name" />
            </Form.Item>
          </Col>

          {/* Job Title */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Job Title"
              name="jobTitle"
              style={itemStyle}
              rules={[
                {
                  required: true,
                  message: 'Please enter your job title',
                },
              ]}
            >
              <InputX placeholder="Enter your job title" />
            </Form.Item>
          </Col>

          {/* Work Email */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Work Email"
              name="workEmail"
              style={itemStyle}
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                {
                  required: true,
                  message: 'Please enter your work email',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
                {
                  validateTrigger: 'onBlur',
                  validator: validateEmailExists,
                },
              ]}
            >
              <InputX placeholder="name@example.org" type="email" />
            </Form.Item>
          </Col>

          {/* Mobile */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mobile"
              name="mobile"
              style={itemStyle}
              rules={[
                {
                  required: true,
                  message: 'Please enter your mobile number',
                },
                {
                  pattern: /^\+[1-9]\d{0,3}[\s-]?[\d()\s-]{6,20}$/,
                  message: 'Please enter a valid mobile number with country code (+1 996 448 2775)',
                },
              ]}
            >
              <InputX placeholder="Enter your mobile number with country code" type="tel" />
            </Form.Item>
          </Col>

          {/* Password */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="New Password"
              name="password"
              style={itemStyle}
              validateTrigger="onBlur"
              rules={[{ validator: validatePassword, required: true }]}
            >
              <Input.Password
                placeholder="Enter new password"
                onChange={(e) => setPassword(e.target.value)}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          </Col>

          {/* Confirm Password */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              style={itemStyle}
              validateTrigger="onBlur"
              rules={[{ validator: validateConfirmPassword, required: true }]}
            >
              <Input.Password
                placeholder="Confirm Password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Password Strength & Requirements — shared design with the Create Password screen */}
        {password && (
          <div className="mb-4">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#374151]">Password Strength:</span>
                <span
                  className="text-[14px] font-semibold"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.text}
                </span>
              </div>
              <Progress
                percent={Math.round(passwordStrength.percent)}
                strokeColor={passwordStrength.color}
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

        {/* Checkboxes */}
        <div>
          <Form.Item
            name="termsAccepted"
            style={{ marginBottom: 8 }}
            rules={[
              {
                validator: () =>
                  termsAccepted
                    ? Promise.resolve()
                    : Promise.reject(new Error('You must accept the terms of service to continue')),
              },
            ]}
          >
            <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>
              I accept the Auspira terms of service
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="consentAccepted"
            style={{ marginBottom: 0 }}
            rules={[
              {
                validator: () =>
                  consentAccepted
                    ? Promise.resolve()
                    : Promise.reject(new Error('You must consent to data processing to continue')),
              },
            ]}
          >
            <Checkbox
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
            >
              I consent to Auspira processing the contract & project we upload.
            </Checkbox>
          </Form.Item>
        </div>
      </Form>
    </>
  );
};

export default AccountDetailsForm;
