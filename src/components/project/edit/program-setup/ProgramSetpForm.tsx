'use client';

import {
  Col,
  DatePicker,
  Divider,
  Form,
  type FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
} from 'antd';
import type React from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';

const { Option } = Select;

interface ProgramSetupFormProps {
  form: FormInstance;
}

const ProgramSetupForm: React.FC<ProgramSetupFormProps> = ({ form }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          referenceNumber: 'EEC-PRO-01',
        }}
      >
        {/* Core Details */}
        <div className="">
          <h2 className="heading-section">Core Details</h2>
          <p className="mb-4 text-sm text-gray-500">
            Provide the foundational identity for this contract.
          </p>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Name" name="name">
                <Input placeholder="Name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <DisabledTooltip
                disabled
                reason="Reference numbers are generated automatically and can't be edited."
              >
                <Form.Item label="Reference Number" name="referenceNumber">
                  <Input disabled />
                </Form.Item>
              </DisabledTooltip>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Contract Framework */}
        <div>
          <h2 className="heading-section">Contract Framework</h2>
          <p className="mb-4 text-sm text-gray-500">
            Select the NEC form to automatically adapt subsequent roles and terminology.
          </p>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Your Role (ECC)"
                name="role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select Form">
                  <Option value="contractor">Contractor</Option>
                  <Option value="client">Client</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="NEC Form" name="necForm" rules={[{ required: true }]}>
                <Select>
                  <Option value="ecc">Engineering and Construction Contract (ECC)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Parent Organisation " name="parentOrg" rules={[{ required: true }]}>
                <Select>
                  <Option value="acme">Acme Construction Ltd.</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Your Role (ECC)" name="role2" rules={[{ required: true }]}>
                <Select placeholder="Select">
                  <Option value="pm">Project Manager</Option>
                  <Option value="supplier">Supplier</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Counterparty Organisation  (Contractor)" name="counterparty">
                <Input placeholder="Start typing to search or create new..." />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Logistics & Value */}
        <div>
          <h2 className="heading-section">Logistics & Value</h2>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Estimated Value (£)" name="value">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Site Address / Location" name="location">
                <Input placeholder="e.g. London, UK" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Starting Date" name="startDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Completion Date" name="endDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default ProgramSetupForm;
