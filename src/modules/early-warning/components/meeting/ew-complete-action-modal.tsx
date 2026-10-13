'use client';

import { CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Form, Input, Modal, message, Typography } from 'antd';

import { useEffect } from 'react';
import { APP_THEME, BADGE_COLORS, BRAND_COLORS, SEMANTIC_COLORS } from '@/constants';
import { useCompleteMeetingAction } from '../../hooks/use-early-warnings';
import type { DisplayMeetingAction } from '../../utils/early-warning-meeting.utils';

interface EwCompleteActionModalProps {
  open: boolean;
  onClose: () => void;
  action?: DisplayMeetingAction | null;
  onSuccess?: () => void;
}

export const EwCompleteActionModal = ({
  open,
  onClose,
  action,
  onSuccess,
}: EwCompleteActionModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync: completeAction, isPending } = useCompleteMeetingAction();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = async (values: any) => {
    if (!action?.id) return;
    try {
      await completeAction({
        meetingActionId: action.id,
        payload: {
          completionNotes: values.completionNotes?.trim() || 'This action has been completed.',
        },
      });
      message.success('Action marked as completed');
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Complete action error:', err);
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to complete action';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={false}
      footer={null}
      width={520}
      destroyOnHidden
      styles={{
        container: { padding: 0, overflow: 'hidden' },
        body: { padding: 0 },
      }}
    >
      {/* Modal Header */}
      <Flex justify="space-between" align="center" style={{ padding: '20px 24px' }}>
        <Flex align="center" gap={12}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 40,
              height: 40,
              borderRadius: APP_THEME.radius.lg,
              border: `1px solid ${BRAND_COLORS.accent2}`,
              backgroundColor: BADGE_COLORS.success.bg,
            }}
          >
            <CheckCircleOutlined style={{ fontSize: 16, color: SEMANTIC_COLORS.success }} />
          </Flex>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Complete Meeting Action
          </Typography.Title>
        </Flex>

        <Button onClick={onClose} aria-label="Close" icon={<CloseOutlined />} />
      </Flex>

      <Divider style={{ margin: 0 }} />

      {/* Form Body */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        style={{ padding: '20px 24px 24px' }}
      >
        <Flex vertical gap={16}>
          <Flex
            vertical
            gap={2}
            style={{
              backgroundColor: 'var(--ds-surface-subtle)',
              border: '1px solid var(--theme-border)',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {action?.ref ? `Action ${action.ref}` : 'Action'}
            </Typography.Text>
            <Typography.Text strong>{action?.title || 'Selected Action'}</Typography.Text>
          </Flex>

          <Form.Item
            name="completionNotes"
            label={
              <Flex align="center" gap={6}>
                Completion Notes
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  (Optional)
                </Typography.Text>
              </Flex>
            }
            style={{ margin: 0 }}
          >
            <Input.TextArea
              rows={4}
              placeholder="Add any notes on what was done to complete this action (optional)..."
              style={{ resize: 'none' }}
            />
          </Form.Item>

          {/* Footer Actions */}
          <Flex justify="flex-end" gap={12} style={{ paddingTop: 8 }}>
            <Button color="default" variant="filled" size="large" onClick={onClose}>
              Cancel
            </Button>

            <Button type="primary" size="large" htmlType="submit" loading={isPending}>
              Complete Action
            </Button>
          </Flex>
        </Flex>
      </Form>
    </Modal>
  );
};

export default EwCompleteActionModal;
