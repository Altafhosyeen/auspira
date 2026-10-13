import { ThunderboltOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Form, Input, Modal, Select, Typography } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { EARLY_WARNING_CLOSE_OR_LINK_COPY } from '../constants/early-warning.constants';

const { link: LINK } = EARLY_WARNING_CLOSE_OR_LINK_COPY;

export interface EarlyWarningLinkCeModalProps {
  open: boolean;
  onClose: () => void;
  earlyWarningId: string;
  reference: string;
}

const EarlyWarningLinkCeModal = ({
  open,
  onClose,
  earlyWarningId,
  reference,
}: EarlyWarningLinkCeModalProps) => {
  const router = useRouter();

  const handleCreateCe = () => {
    onClose();
    router.push(`/contract-control-agent/compensation-event/new?earlyWarningId=${earlyWarningId}`);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Flex align="center" gap={8}>
          <ThunderboltOutlined style={{ color: '#D97706', fontSize: 18 }} />
          <span>{LINK.title}</span>
        </Flex>
      }
      footer={
        <Flex justify="flex-end" gap={12}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleCreateCe}>
            {LINK.submit(reference)}
          </Button>
        </Flex>
      }
      destroyOnHidden
    >
      <Flex vertical gap={12} style={{ marginTop: 12 }}>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          {LINK.body(reference)}
        </Typography.Paragraph>

        <Alert type="info" message={LINK.rule(reference)} />

        <Form layout="vertical">
          <Form.Item label={LINK.triggerType} required>
            <Select
              defaultValue={LINK.triggerOptions[0]}
              options={LINK.triggerOptions.map((o) => ({ label: o, value: o }))}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label={LINK.reference}>
            <Input disabled value={LINK.referencePlaceholder} />
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  );
};

export default EarlyWarningLinkCeModal;
