'use client';

import { Button, DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import type {
  CompensationEvent,
  CreateCompensationEventInput,
} from '../types/compensation-event.types';

type CompensationEventFormValues = Omit<CreateCompensationEventInput, 'eventDate'> & {
  eventDate?: Dayjs; // converted to YYYY-MM-DD at submit
};

interface CompensationEventFormProps {
  initialValues?: CompensationEvent;
  submitting?: boolean;
  onSubmit: (values: CreateCompensationEventInput) => void;
}

const CompensationEventForm = ({
  initialValues,
  submitting = false,
  onSubmit,
}: CompensationEventFormProps) => {
  const [form] = Form.useForm<CompensationEventFormValues>();

  const handleFinish = (values: CompensationEventFormValues) => {
    onSubmit({
      ...values,
      eventDate: values.eventDate?.format('YYYY-MM-DD') ?? initialValues?.eventDate ?? '',
    });
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish}>
      <Form.Item
        label="Reference"
        name="reference"
        rules={[{ required: true, message: 'Reference is required' }]}
      >
        <Input placeholder="e.g. CE-2026-001" />
      </Form.Item>

      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: 'Title is required' }]}
      >
        <Input placeholder="Compensation event title" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={3} placeholder="Optional description" />
      </Form.Item>

      <Form.Item
        label="Amount"
        name="amount"
        rules={[{ required: true, message: 'Amount is required' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Currency"
        name="currency"
        initialValue="GBP"
        rules={[{ required: true, message: 'Currency is required' }]}
      >
        <Select
          options={[
            { label: 'GBP', value: 'GBP' },
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Event date"
        name="eventDate"
        rules={[{ required: true, message: 'Event date is required' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit" loading={submitting}>
          {initialValues ? 'Save changes' : 'Create event'}
        </Button>
      </Space>
    </Form>
  );
};

export default CompensationEventForm;
