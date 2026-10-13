import { Avatar } from 'antd';
import type { ReactNode } from 'react';
import { NOTICE_COLORS, NOTICE_SIZES } from '../constants/compensation-event-notice.theme';

// Grey chip that wraps each field's leading icon inside the input.
const CompensationEventNoticeFieldIcon = ({ icon }: { icon: ReactNode }) => (
  <Avatar
    shape="square"
    size={NOTICE_SIZES.fieldIconChip}
    icon={icon}
    style={{
      backgroundColor: NOTICE_COLORS.fieldIconBg,
      border: `0.5px solid ${NOTICE_COLORS.border}`,
      color: NOTICE_COLORS.main,
      fontSize: NOTICE_SIZES.fieldIcon,
    }}
  />
);

export default CompensationEventNoticeFieldIcon;
