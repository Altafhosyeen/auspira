import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Modal, notification, Select, Typography } from 'antd';
import PopconfirmButton from '@/components/shared/popconfirm-button';
import { EARLY_WARNING_CLOSE_OR_LINK_COPY } from '../constants/early-warning.constants';
import { useCloseEarlyWarning } from '../hooks/use-early-warnings';

const { close: CLOSE } = EARLY_WARNING_CLOSE_OR_LINK_COPY;

interface CloseFormValues {
  closingReason?: string;
  closingNotes?: string;
}

export interface EarlyWarningCloseModalProps {
  open: boolean;
  onClose: () => void;
  earlyWarningId: string;
  reference: string;
  onSuccess?: () => void;
}

const EarlyWarningCloseModal = ({
  open,
  onClose,
  earlyWarningId,
  reference,
  onSuccess,
}: EarlyWarningCloseModalProps) => {
  const [form] = Form.useForm<CloseFormValues>();
  const { mutateAsync: closeEarlyWarning, isPending } = useCloseEarlyWarning();
  const closingReason = Form.useWatch('closingReason', form);

  const handleFinish = async (values: CloseFormValues) => {
    try {
      await closeEarlyWarning({
        earlyWarningId,
        closingReason: values.closingReason ?? '',
        closingNotes: values.closingNotes ?? '',
      });
      notification.success({ message: 'Early warning closed successfully' });
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch {
      // Handled globally
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <Flex align="center" gap={8}>
          <CheckCircleOutlined style={{ color: '#0284C7', fontSize: 18 }} />
          <span>{CLOSE.title}</span>
        </Flex>
      }
      footer={
        <Flex justify="flex-end" gap={12}>
          <Button onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <PopconfirmButton
            type="primary"
            loading={isPending}
            confirmTitle={`${CLOSE.submit(reference)}?`}
            confirmDescription={closingReason}
            okText={CLOSE.submit(reference)}
            beforeOpen={() => form.validateFields()}
            onConfirm={() => form.submit()}
          >
            {CLOSE.submit(reference)}
          </PopconfirmButton>
        </Flex>
      }
      destroyOnHidden
    >
      <Flex vertical gap={12} style={{ marginTop: 12 }}>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          {CLOSE.body(reference)}
        </Typography.Paragraph>

        <Form<CloseFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ closingReason: CLOSE.reasonOptions[0] }}
        >
          <Form.Item
            name="closingReason"
            label={CLOSE.reason}
            rules={[{ required: true, message: 'Please select a closure reason' }]}
          >
            <Select options={CLOSE.reasonOptions.map((o) => ({ label: o, value: o }))} />
          </Form.Item>

          <Form.Item name="closingNotes" label={CLOSE.notes}>
            <Input.TextArea rows={4} placeholder={CLOSE.notesPlaceholder} />
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  );
};

export default EarlyWarningCloseModal;
