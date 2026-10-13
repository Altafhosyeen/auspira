import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Input, Modal, notification, Row, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import {
  COMPOSE_EMAIL_COPY,
  COMPOSE_EMAIL_DEFAULTS,
  COMPOSE_EMAIL_LIMITS,
  COMPOSE_EMAIL_SIZES,
} from '../constants/compensation-event-email.constants';
import { QUOTATION_COLORS } from '../constants/compensation-event-quotation.theme';
import type {
  ComposeEmailDefaults,
  ComposeEmailValues,
} from '../types/compensation-event-email.types';
import { splitRecipients } from '../utils/compensation-event-email.utils';
import CompensationEventEmailEditor from './compensation-event-email-editor';
import CompensationEventRecipientSelect from './compensation-event-recipient-select';

const copy = COMPOSE_EMAIL_COPY;

interface CompensationEventComposeEmailModalProps {
  open: boolean;
  defaults?: ComposeEmailDefaults;
  // Names what this mail is for — the modal is shared, so a caller opening it for a specific
  // errand says so instead of the generic `Compose Email`.
  title?: string;
  // Drives the To/Cc/Bcc suggestions — the project's contact persons.
  projectId?: string;
  sending?: boolean;
  onCancel: () => void;
  onSend: (values: ComposeEmailValues) => void;
  onSaveDraft?: (values: ComposeEmailValues) => void;
}

const RequiredLabel = ({ text }: { text: string }) => (
  <Typography.Text>
    {text}
    <Typography.Text style={{ color: QUOTATION_COLORS.required }}>*</Typography.Text>
  </Typography.Text>
);

const CompensationEventComposeEmailModal = ({
  open,
  defaults,
  title,
  projectId,
  sending,
  onCancel,
  onSend,
  onSaveDraft,
}: CompensationEventComposeEmailModalProps) => {
  const [values, setValues] = useState<ComposeEmailValues>({
    ...COMPOSE_EMAIL_DEFAULTS,
    ...defaults,
  });

  const { options, isLoading, noRecipientsHint } = useRecipientOptions(projectId);

  // Held in a ref so the seeding below can read the latest draft without re-running on it.
  const latestDefaults = useRef(defaults);
  useEffect(() => {
    latestDefaults.current = defaults;
  }, [defaults]);

  // Re-seed each time the modal opens so a reopened draft is not the previous edit — and
  // only then, so a background refetch behind the modal cannot wipe an edit in progress.
  useEffect(() => {
    if (open) setValues({ ...COMPOSE_EMAIL_DEFAULTS, ...latestDefaults.current });
  }, [open]);

  const set = <K extends keyof ComposeEmailValues>(key: K, value: ComposeEmailValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const { valid, invalid } = splitRecipients([...values.to, ...values.cc, ...values.bcc]);

    if (!splitRecipients(values.to).valid.length) {
      notification.error({ message: copy.messages.recipientRequired });
      return false;
    }
    // The tags fields accept free text, so a typo would otherwise reach the send endpoint.
    if (invalid.length || !valid.length) {
      notification.error({ message: copy.messages.recipientInvalid });
      return false;
    }
    if (!values.subject.trim()) {
      notification.error({ message: copy.messages.subjectRequired });
      return false;
    }
    return true;
  };

  const handleSend = () => {
    if (validate()) onSend(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={1000}
      centered
      // The form scrolls inside the modal; the title and the footer actions stay put.
      styles={{
        body: {
          maxHeight: COMPOSE_EMAIL_SIZES.bodyMaxHeight,
          overflowY: 'auto',
          overflowX: 'hidden',
        },
      }}
      title={
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title ?? copy.title}
        </Typography.Title>
      }
      footer={
        <Flex align="center" justify="end" gap={12} wrap>
          <Flex gap={12}>
            <Button onClick={onCancel}>{copy.actions.cancel}</Button>
            <Button
              type="primary"
              iconPosition="end"
              icon={<ArrowRightOutlined />}
              loading={sending}
              onClick={handleSend}
            >
              {copy.actions.send}
            </Button>
          </Flex>
        </Flex>
      }
    >
      <Flex vertical gap={18} style={{ paddingBlock: 12 }}>
        <Flex vertical gap={8}>
          <RequiredLabel text={copy.labels.to} />
          <CompensationEventRecipientSelect
            value={values.to}
            onChange={(recipients) => set('to', recipients)}
            placeholder={copy.placeholders.to}
            options={options}
            loading={isLoading}
            notFoundContent={noRecipientsHint}
          />
        </Flex>

        <Row gutter={18}>
          <Col xs={24} md={12}>
            <Flex vertical gap={8}>
              <Typography.Text>{copy.labels.cc}</Typography.Text>
              <CompensationEventRecipientSelect
                value={values.cc}
                onChange={(recipients) => set('cc', recipients)}
                placeholder={copy.placeholders.cc}
                options={options}
                loading={isLoading}
                notFoundContent={noRecipientsHint}
              />
            </Flex>
          </Col>
          <Col xs={24} md={12}>
            <Flex vertical gap={8}>
              <Typography.Text>{copy.labels.bcc}</Typography.Text>
              <CompensationEventRecipientSelect
                value={values.bcc}
                onChange={(recipients) => set('bcc', recipients)}
                placeholder={copy.placeholders.bcc}
                options={options}
                loading={isLoading}
                notFoundContent={noRecipientsHint}
              />
            </Flex>
          </Col>
        </Row>

        <Flex vertical gap={8}>
          <RequiredLabel text={copy.labels.subject} />
          <Input
            showCount
            maxLength={COMPOSE_EMAIL_LIMITS.subjectMaxLength}
            value={values.subject}
            placeholder={copy.placeholders.subject}
            onChange={(event) => set('subject', event.target.value)}
          />
        </Flex>

        <Flex vertical gap={8}>
          <RequiredLabel text={copy.labels.body} />
          <CompensationEventEmailEditor
            value={values.body}
            onChange={(body) => set('body', body)}
          />
        </Flex>
      </Flex>
    </Modal>
  );
};

export default CompensationEventComposeEmailModal;
