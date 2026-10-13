import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { COMPENSATION_EVENT_REGISTER_COPY } from '../constants/compensation-event.constants';
import { REGISTER_COLORS } from '../constants/compensation-event-register.theme';

interface CompensationEventRegisterNoteProps {
  reference: string;
  parentEarlyWarningReference?: string;
}

// Shown only when the register was opened from an Early Warning — explains the
// highlighted row.
const CompensationEventRegisterNote = ({
  reference,
  parentEarlyWarningReference,
}: CompensationEventRegisterNoteProps) => (
  <Flex
    align="center"
    gap={8}
    style={{ background: REGISTER_COLORS.noteBg, borderRadius: 6, padding: '15px 32px' }}
  >
    <ExclamationCircleOutlined style={{ color: REGISTER_COLORS.textMuted, fontSize: 28 }} />
    <Flex vertical gap={4}>
      <Typography.Text style={{ color: REGISTER_COLORS.textMuted, fontSize: 12 }}>
        <Typography.Text strong>{reference}</Typography.Text>
        {parentEarlyWarningReference
          ? ` is highlighted because it's the matter we've been following from `
          : ' is highlighted because it was opened from an Early Warning.'}
        {parentEarlyWarningReference && (
          <Typography.Text strong>{`${parentEarlyWarningReference}.`}</Typography.Text>
        )}
      </Typography.Text>
      <Typography.Text style={{ color: REGISTER_COLORS.textMuted, fontSize: 12 }}>
        {COMPENSATION_EVENT_REGISTER_COPY.noteFollowUp}
      </Typography.Text>
    </Flex>
  </Flex>
);

export default CompensationEventRegisterNote;
