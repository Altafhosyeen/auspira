'use client';

import {
  CalendarOutlined,
  CloseOutlined,
  FileTextOutlined,
  FlagOutlined,
  PlusOutlined,
  TagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  message,
  Select,
  Typography,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useCreateMeetingAction, useGetProjectUsersLookup } from '../../hooks/use-early-warnings';
import { Priority } from '../../types/early-warning-api.types';
import EwActionDocumentsUpload from './ew-action-documents-upload';
import EwCreateMeetingAttendeesSelect from './ew-create-meeting-attendees-select';
import EwIconField from './ew-icon-field';

interface EwAddMeetingActionModalProps {
  open: boolean;
  onClose: () => void;
  meetingId: string;
  projectId: string;
  onSuccess?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EwAddMeetingActionModal = ({
  open,
  onClose,
  meetingId,
  projectId,
  onSuccess,
}: EwAddMeetingActionModalProps) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { mutateAsync: createAction, isPending } = useCreateMeetingAction();
  const { data: projectUsers = [], isLoading: loadingUsers } = useGetProjectUsersLookup({
    projectId,
    enabled: open && !!projectId,
  });

  useEffect(() => {
    if (open) {
      form.resetFields();
      setFileList([]);
      form.setFieldsValue({
        priority: Priority.Medium,
        deadline: dayjs(),
        attendees: [],
      });
    }
  }, [open, form]);

  const handleFinish = async (values: any) => {
    const userIds: string[] = [];
    const externalAttendees: Array<{ name: string; email: string }> = [];
    const invalidEntries: string[] = [];

    (values.attendees || []).forEach((rawItem: string) => {
      const item = rawItem.trim();
      const matchedUser = projectUsers.find(
        (u) =>
          u.id.toLowerCase() === item.toLowerCase() ||
          (u.email && u.email.toLowerCase() === item.toLowerCase())
      );

      if (matchedUser) {
        userIds.push(matchedUser.id);
      } else if (EMAIL_RE.test(item)) {
        // External assignee from a typed email — name derived from the prefix.
        const name = item
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        externalAttendees.push({ name, email: item });
      } else {
        invalidEntries.push(item);
      }
    });

    if (invalidEntries.length > 0) {
      message.error(
        `Remove the invalid assignee(s): ${invalidEntries.join(', ')}. Pick a project member or enter an email address.`
      );
      return;
    }

    if (userIds.length === 0 && externalAttendees.length === 0) {
      message.error('Please select at least one assignee — internal or external.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('MeetingId', meetingId);
      formData.append('ProjectId', projectId);
      formData.append('Title', values.title);
      if (values.description) {
        formData.append('Description', values.description);
      }
      if (values.deadline) {
        formData.append('DueDate', dayjs(values.deadline).format('YYYY-MM-DDTHH:mm:ss'));
      }
      formData.append('Priority', String(values.priority ?? Priority.Medium));

      userIds.forEach((uid) => {
        formData.append('UserIds', uid);
      });

      externalAttendees.forEach((ext, idx) => {
        formData.append(`ExternalAttendees[${idx}].Email`, ext.email.trim());
        formData.append(`ExternalAttendees[${idx}].Name`, ext.name.trim());
      });

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('Attachments', file.originFileObj);
        }
      });

      await createAction(formData);
      message.success('Action created successfully');
      form.resetFields();
      setFileList([]);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to create action:', err);
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to create action';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={false}
      footer={null}
      width={640}
      destroyOnHidden
      styles={{
        container: { padding: 0, overflow: 'hidden' },
        body: { padding: 0 },
      }}
    >
      {/* Modal Header */}
      <Flex justify="space-between" align="center" style={{ padding: '16px 30px' }}>
        <Flex align="center" gap={12}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--theme-border)] bg-[var(--ds-surface-table-header)] text-[var(--ds-main-p)]">
            <PlusOutlined className="text-base" />
          </div>
          <Typography.Title level={4} className="!m-0">
            Add Action
          </Typography.Title>
        </Flex>

        <Button onClick={onClose} aria-label="Close" icon={<CloseOutlined />} />
      </Flex>

      {/* Full End-to-End Divider */}
      <Divider style={{ margin: 0 }} />

      {/* Form Content */}
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Flex vertical gap={8} style={{ padding: '16px 30px' }}>
          {/* What was agreed */}
          <Form.Item
            name="title"
            label="What was agreed"
            rules={[{ required: true, message: 'Please enter what was agreed' }]}
            className="mb-0!"
          >
            <EwIconField icon={<TagOutlined />}>
              <Input
                variant="borderless"
                placeholder="What was agreed — confirm the crane oversail permit with the highway authority"
                maxLength={200}
              />
            </EwIconField>
          </Form.Item>

          {/* Decision context */}
          <Form.Item name="description" label="Decision context" className="mb-0!">
            <EwIconField icon={<FileTextOutlined />} align="start">
              <Input.TextArea
                rows={3}
                placeholder="Decision context — one line on why the meeting decided this."
                className="resize-none"
              />
            </EwIconField>
          </Form.Item>

          {/* Deadline & Priority */}
          <Flex gap={12} wrap>
            <Form.Item
              name="deadline"
              label="Deadline"
              rules={[{ required: true, message: 'Please select a deadline' }]}
              className="mb-0! min-w-0 flex-1"
            >
              <EwIconField icon={<CalendarOutlined />}>
                <DatePicker
                  variant="borderless"
                  suffixIcon={null}
                  format="DD-MMM-YYYY"
                  disabledDate={(current) => current.isBefore(dayjs().startOf('day'))}
                  placeholder="Deadline"
                  className="w-full"
                />
              </EwIconField>
            </Form.Item>

            <Form.Item name="priority" label="Priority" className="mb-0! min-w-0 flex-1">
              <EwIconField icon={<FlagOutlined />}>
                <Select
                  variant="borderless"
                  options={[
                    { label: 'Low', value: Priority.Low },
                    { label: 'Medium', value: Priority.Medium },
                    { label: 'High', value: Priority.High },
                  ]}
                  placeholder="Priority"
                  className="w-full"
                />
              </EwIconField>
            </Form.Item>
          </Flex>

          {/* Assignees — project members from the lookup plus typed emails for externals */}
          <Form.Item
            name="attendees"
            label="Assignees"
            rules={[
              {
                required: true,
                message: 'Select at least one assignee — internal or external.',
              },
            ]}
            className="mb-0!"
          >
            <EwIconField icon={<UserOutlined />}>
              <EwCreateMeetingAttendeesSelect
                borderless
                projectUsers={projectUsers}
                loading={loadingUsers}
              />
            </EwIconField>
          </Form.Item>

          {/* Upload Documents Card */}
          <EwActionDocumentsUpload fileList={fileList} onFileListChange={setFileList} />

          {/* Footer Actions */}
          <Flex justify="flex-end" gap={12} style={{ paddingTop: 4 }}>
            <Button color="default" variant="filled" size="large" onClick={onClose}>
              Cancel
            </Button>

            <Button type="primary" size="large" htmlType="submit" loading={isPending}>
              Save
            </Button>
          </Flex>
        </Flex>
      </Form>
    </Modal>
  );
};

export default EwAddMeetingActionModal;
