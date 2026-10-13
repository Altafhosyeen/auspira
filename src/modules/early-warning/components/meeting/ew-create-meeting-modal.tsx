'use client';

import {
  ArrowRightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
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
  Switch,
  TimePicker,
  Typography,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useCreateMeeting, useGetProjectUsersLookup } from '../../hooks/use-early-warnings';
import EwActionDocumentsUpload from './ew-action-documents-upload';
import EwCreateMeetingAttendeesSelect from './ew-create-meeting-attendees-select';
import EwIconField from './ew-icon-field';
import EwRichTextEditor from './ew-rich-text-editor';

// Lets a host module re-book the same invite flow onto its own endpoint — the payload is
// identical except the entity key (`EarlyWarningId` vs `DefectNoticeId`, …). The hook owns
// the endpoint + cache invalidation; the modal only swaps the field name and submit call.
export interface MeetingBookingOverride {
  // Form field the entity id is appended under — `DefectNoticeId` for the DN booking.
  entityIdField: string;
  // Replaces the default EW `useCreateMeeting` submit.
  createMeeting: (formData: FormData) => Promise<unknown>;
  // Pending state of the host module's mutation — drives the submit button spinner.
  isPending?: boolean;
  // Modal heading — defaults to "New Early Warning Meeting".
  title?: string;
}

interface EwCreateMeetingModalProps {
  open: boolean;
  onClose: () => void;
  earlyWarningId: string;
  projectId?: string;
  onSuccess?: () => void;
  /** When set, the invite books through the host module's endpoint instead of EW's. */
  booking?: MeetingBookingOverride;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EwCreateMeetingModal = ({
  open,
  onClose,
  earlyWarningId,
  projectId = '',
  onSuccess,
  booking,
}: EwCreateMeetingModalProps) => {
  const [form] = Form.useForm();
  const ewCreate = useCreateMeeting();
  // With a booking override the host module owns the mutation (and its pending state);
  // without one, the EW booking is used as before.
  const createMeeting = booking?.createMeeting ?? ewCreate.mutateAsync;
  const isPending = booking ? (booking.isPending ?? false) : ewCreate.isPending;
  const [agendaHtml, setAgendaHtml] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { data: projectUsers = [], isLoading: loadingUsers } = useGetProjectUsersLookup({
    projectId,
    enabled: open && !!projectId,
  });

  const isOnline = Form.useWatch('onlineMeeting', form) ?? true;

  // Combines the selected date + time fields into a real Date for validation.
  const combineDateTime = (date?: Dayjs | null, time?: Dayjs | null): Dayjs | null => {
    if (!date || !time) return null;
    return dayjs(date).hour(time.hour()).minute(time.minute()).second(0).millisecond(0);
  };

  useEffect(() => {
    if (open) {
      const now = dayjs();
      // Round up to the next 5-min mark so the default start is never in the past.
      const start = now
        .add(5 - (now.minute() % 5), 'minute')
        .second(0)
        .millisecond(0);
      const end = start.add(30, 'minute');
      form.setFieldsValue({
        meetingDate: start,
        startTime: start,
        endTime: end,
        onlineMeeting: true,
        location: '',
        attendees: [],
      });
      setAgendaHtml('');
      setFileList([]);
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
        // External attendee from a typed email — name derived from the prefix.
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
        `Remove the invalid attendee(s): ${invalidEntries.join(', ')}. Pick a project member or enter an email address.`
      );
      return;
    }

    if (userIds.length === 0 && externalAttendees.length === 0) {
      message.error('Please invite at least one attendee — internal or external.');
      return;
    }

    const now = dayjs();
    const meetingDate = values.meetingDate || now;
    const startTimeVal = values.startTime || now;
    const endTimeVal = values.endTime || startTimeVal.add(30, 'minute');

    const startDateTime = dayjs(meetingDate)
      .hour(startTimeVal.hour())
      .minute(startTimeVal.minute())
      .second(0);

    const endDateTime = dayjs(meetingDate)
      .hour(endTimeVal.hour())
      .minute(endTimeVal.minute())
      .second(0);

    if (endDateTime.isBefore(startDateTime)) {
      message.error('End time must be after start time.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append(booking?.entityIdField ?? 'EarlyWarningId', earlyWarningId);
      formData.append('Subject', values.subject);
      formData.append('Agenda', agendaHtml || '');
      formData.append('StartTime', startDateTime.format('YYYY-MM-DDTHH:mm:ss'));
      formData.append('EndTime', endDateTime.format('YYYY-MM-DDTHH:mm:ss'));
      formData.append('TimeZone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      const online = values.onlineMeeting ?? true;
      formData.append(
        'Location',
        values.location?.trim() ||
          (online ? 'Online Meeting (Microsoft Teams)' : 'In-Person Meeting')
      );
      formData.append('IsOnlineMeeting', String(online));

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

      await createMeeting(formData);
      message.success('Meeting invite sent successfully');
      form.resetFields();
      setFileList([]);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to schedule meeting:', err);
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to schedule meeting';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={false}
      footer={null}
      width={720}
      centered
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
            <FileTextOutlined className="text-lg" />
          </div>
          <Typography.Title level={4} className="!m-0">
            {booking?.title ?? 'New Early Warning Meeting'}
          </Typography.Title>
        </Flex>

        <Button onClick={onClose} aria-label="Close" icon={<CloseOutlined />} />
      </Flex>

      <Divider style={{ margin: 0 }} />

      {/* Form Content */}
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Flex vertical gap={8} style={{ padding: '16px 30px' }}>
          {/* Meeting Title */}
          <Form.Item
            name="subject"
            label="Meeting Title"
            rules={[{ required: true, message: 'Please enter meeting title' }]}
            className="mb-0!"
          >
            <EwIconField icon={<TagOutlined />}>
              <Input
                variant="borderless"
                placeholder="e.g. Ground Conditions Review – Zone A"
                maxLength={200}
              />
            </EwIconField>
          </Form.Item>

          {/* Invite Attendees */}
          <Form.Item
            name="attendees"
            label="Invite Attendees"
            rules={[
              {
                required: true,
                message: 'Invite at least one attendee — internal or external.',
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

          {/* Schedule — date + start + end in one row */}
          <Flex gap={12} wrap>
            <Form.Item
              name="meetingDate"
              label="Date"
              dependencies={['startTime']}
              rules={[
                { required: true, message: 'Date required' },
                {
                  validator: (_, value?: Dayjs) =>
                    !value?.isBefore(dayjs().startOf('day'))
                      ? Promise.resolve()
                      : Promise.reject(new Error('Date cannot be in the past')),
                },
              ]}
              className="mb-0! min-w-0 flex-1"
            >
              <EwIconField icon={<CalendarOutlined />}>
                <DatePicker
                  variant="borderless"
                  suffixIcon={null}
                  format="DD MMM YYYY"
                  disabledDate={(current) => current.isBefore(dayjs().startOf('day'))}
                  className="w-full"
                />
              </EwIconField>
            </Form.Item>

            <Form.Item
              name="startTime"
              label="Start Time"
              dependencies={['meetingDate']}
              rules={[
                { required: true, message: 'Start time required' },
                ({ getFieldValue }) => ({
                  validator: (_, value?: Dayjs) => {
                    if (!value) return Promise.resolve();
                    const start = combineDateTime(getFieldValue('meetingDate'), value);
                    if (!start) return Promise.resolve();
                    return start.isBefore(dayjs())
                      ? Promise.reject(new Error('Start time cannot be in the past'))
                      : Promise.resolve();
                  },
                }),
              ]}
              className="mb-0! min-w-0 flex-1"
            >
              <EwIconField icon={<ClockCircleOutlined />}>
                <TimePicker
                  variant="borderless"
                  suffixIcon={null}
                  format="hh:mm A"
                  use12Hours
                  needConfirm={false}
                  onChange={(val) => form.setFieldValue('startTime', val)}
                  onSelect={(val) => form.setFieldValue('startTime', val)}
                  className="w-full"
                />
              </EwIconField>
            </Form.Item>

            <Form.Item
              name="endTime"
              label="End Time"
              dependencies={['meetingDate', 'startTime']}
              rules={[
                { required: true, message: 'End time required' },
                ({ getFieldValue }) => ({
                  validator: (_, value?: Dayjs) => {
                    if (!value) return Promise.resolve();
                    const start = combineDateTime(
                      getFieldValue('meetingDate'),
                      getFieldValue('startTime')
                    );
                    const end = combineDateTime(getFieldValue('meetingDate'), value);
                    if (!start || !end) return Promise.resolve();
                    return end.isSame(start) || end.isBefore(start)
                      ? Promise.reject(new Error('End time must be after start time'))
                      : Promise.resolve();
                  },
                }),
              ]}
              className="mb-0! min-w-0 flex-1"
            >
              <EwIconField icon={<ClockCircleOutlined />}>
                <TimePicker
                  variant="borderless"
                  suffixIcon={null}
                  format="hh:mm A"
                  use12Hours
                  needConfirm={false}
                  onChange={(val) => form.setFieldValue('endTime', val)}
                  onSelect={(val) => form.setFieldValue('endTime', val)}
                  className="w-full"
                />
              </EwIconField>
            </Form.Item>
          </Flex>

          {/* Online meeting switch + optional location — side by side */}
          <Flex align="flex-start" gap={12} wrap>
            <Form.Item
              name="onlineMeeting"
              valuePropName="checked"
              label="Online meeting"
              className="mb-0!"
            >
              <div
                className="flex items-center justify-center"
                style={{ height: 42, padding: '0 8px' }}
              >
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="location" label="Location" className="mb-0! min-w-0 flex-1">
              <EwIconField icon={<EnvironmentOutlined />}>
                <Input
                  variant="borderless"
                  placeholder={
                    isOnline ? 'Teams link or room (optional)' : 'Site or room address (optional)'
                  }
                  maxLength={200}
                />
              </EwIconField>
            </Form.Item>
          </Flex>

          {/* Meeting Agenda */}
          <Flex vertical gap={8} style={{ paddingTop: 8 }}>
            <Typography.Text strong>Meeting Agenda</Typography.Text>
            <EwRichTextEditor
              value={agendaHtml}
              onChange={setAgendaHtml}
              placeholder="Add the meeting agenda — use the toolbar for headings, lists and links..."
              minHeight={130}
            />
          </Flex>

          {/* Upload Documents */}
          <EwActionDocumentsUpload fileList={fileList} onFileListChange={setFileList} />

          {/* Footer Actions */}
          <Flex justify="flex-end" gap={12} style={{ paddingTop: 8 }}>
            <Button onClick={onClose}>Cancel</Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              Send Meeting Invite
            </Button>
          </Flex>
        </Flex>
      </Form>
    </Modal>
  );
};

export default EwCreateMeetingModal;
