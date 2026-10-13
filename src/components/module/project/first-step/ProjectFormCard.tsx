/**
 * Project Form Card
 * Ant Design Form for creating or editing project basic details
 */

import React, { useEffect } from 'react';
import { Button, Input, Form, Tooltip } from 'antd';
import { FileText, Info } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { FieldLabel } from '@/components/shared/FieldLabel';
import { ProjectData } from '@/types/project/create.types';
import { API_ENDPOINTS } from '@/constants';
import { axiosInstance } from '@/lib/api/axios';
import type { AxiosRequestConfig } from 'axios';
import SelectX from '@/components/antd/SelectX';
import { documentClassifications } from '@/utils/project-display';

type ReferenceAvailabilityResponse = {
  referenceId?: string;
  isAvailable?: boolean;
  message?: string;
  detail?: string;
};

const validateReferenceAvailability = async (_: unknown, value: string | undefined) => {
  const referenceValue = String(value ?? '').trim();

  if (!referenceValue) {
    return Promise.resolve();
  }

  try {
    const response = await axiosInstance.request({
      url: `${API_ENDPOINTS.PROJECTS.PROJECT}/verify-reference/?referenceId=${encodeURIComponent(
        referenceValue
      )}`,
      method: 'GET',
      // field-level validation — must not trigger the global loader
      skipLoader: true,
      validateStatus: () => true,
    } as AxiosRequestConfig & { skipLoader?: boolean });

    const responseData = response.data as ReferenceAvailabilityResponse | undefined;
    const isAvailable =
      response.status >= 200 && response.status < 300 && responseData?.isAvailable === true;

    if (isAvailable) {
      return Promise.resolve();
    }

    if (responseData?.isAvailable === false) {
      return Promise.reject(
        new Error(
          responseData?.message || responseData?.detail || 'Reference number already exists'
        )
      );
    }

    return Promise.reject(new Error('Unable to verify reference number'));
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string; detail?: string } } })?.response?.data
        ?.message ||
      (error as { response?: { data?: { message?: string; detail?: string } } })?.response?.data
        ?.detail ||
      'Unable to verify reference number';

    return Promise.reject(new Error(message));
  }
};

interface ProjectFormCardProps {
  initialData?: ProjectData;
  isLoading?: boolean;
  onSave: (data: ProjectData) => void;
  onCancel?: () => void;
}

export const ProjectFormCard: React.FC<ProjectFormCardProps> = ({
  initialData,
  isLoading = false,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditMode = Boolean(initialData?.id);
  // Reference number is immutable once the project has been created
  const isReferenceLocked = Boolean(initialData?.id);

  // Reset and repopulate whenever the project being edited changes
  useEffect(() => {
    form.resetFields();
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name ?? '',
        referenceId: initialData.referenceId ?? '',
        necForm: initialData.necForm ?? undefined,
      });
    }
    // Use primitive deps so the effect reruns whenever any field value changes
  }, [form]);

  const handleFinish = (values: { name: string; referenceId: string; necForm: number }) => {
    onSave({
      name: values.name,
      referenceId: values.referenceId,
      necForm: values.necForm,
    });
  };

  return (
    <SectionCard className="overflow-hidden border border-slate-200 bg-white pb-0! shadow-sm">
      {/* Header */}
      <div className="">
        <h2 className="heading-section flex items-center gap-2">
          <FileText /> {isEditMode ? 'Edit Project Details' : 'Project Details'}
          <Tooltip
            title="Fill in the project name, reference and classification. These details identify the project across the contract workflow and can be edited later."
            placement="right"
          >
            <Info className="h-4 w-4 shrink-0 cursor-help text-slate-700 transition-colors hover:text-slate-600" />
          </Tooltip>
        </h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          name: initialData?.name ?? '',
          referenceId: initialData?.referenceId ?? '',
          necForm: initialData?.necForm ?? undefined,
        }}
      >
        {/* Fields + actions on a single row (wraps on narrow screens) */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Project Name */}
          <div className="min-w-0 flex-1">
            <FieldLabel label="Project Name" required />
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Project name is required', whitespace: true }]}
              className="mb-0"
            >
              <Input size="middle" placeholder="Enter project name" className="rounded-xl" />
            </Form.Item>
          </div>

          {/* Reference Number */}
          <div className="min-w-0 flex-1">
            <FieldLabel label="Reference Number" required />
            <Form.Item
              name="referenceId"
              rules={[
                { required: true, message: 'Reference number is required' },
                ...(isReferenceLocked ? [] : [{ validator: validateReferenceAvailability }]),
              ]}
              className="mb-0"
            >
              <Input
                size="middle"
                placeholder="Enter reference number"
                type="text"
                className="rounded-xl"
                disabled={isReferenceLocked}
              />
            </Form.Item>
          </div>

          {/* NEC Form */}
          <div className="min-w-0 flex-1">
            <FieldLabel label="Contract Type" required />
            <Form.Item
              name="necForm"
              rules={[{ required: true, message: 'NEC Form is required' }]}
              className="mb-0"
            >
              <SelectX
                size="middle"
                className="w-full"
                placeholder="Select NEC Form"
                options={documentClassifications.map((doc) => ({
                  label: doc.label,
                  value: doc.id,
                }))}
              />
            </Form.Item>
          </div>

          {/* Actions — inline with the fields, bottom-aligned to the inputs */}
          <div className="mt-6 flex h-fit shrink-0 items-end gap-3">
            <Button
              size="middle"
              onClick={onCancel ?? (() => window.history.back())}
              className="rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button type="primary" size="middle" htmlType="submit" loading={isLoading}>
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Form>
    </SectionCard>
  );
};

ProjectFormCard.displayName = 'ProjectFormCard';
