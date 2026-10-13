import { Avatar } from 'antd';
import type { ReactNode } from 'react';
import { NOTICE_COLORS, NOTICE_SIZES } from '../constants/compensation-event-notice.theme';

// Soft blue chip behind the title bar's glyph, so the heading mark reads as a section
// icon rather than a stray character run against the title.
const CompensationEventPageHeaderIcon = ({ icon }: { icon: ReactNode }) => (
  <Avatar
    shape="square"
    size={NOTICE_SIZES.sectionIconChip}
    icon={icon}
    style={{
      backgroundColor: NOTICE_COLORS.mainSoft,
      border: `1px solid ${NOTICE_COLORS.tagBorder}`,
      color: NOTICE_COLORS.main,
      flex: 'none',
      fontSize: NOTICE_SIZES.fieldIcon,
    }}
  />
);

export default CompensationEventPageHeaderIcon;
