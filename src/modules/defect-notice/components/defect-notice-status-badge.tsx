import { Flex } from 'antd';
import {
  DEFECT_NOTICE_STATUS_LABELS,
  DEFECT_NOTICE_STATUS_TONES,
} from '../constants/defect-notice.constants';
import { REGISTER_SIZES, REGISTER_TONE_STYLES } from '../constants/defect-notice-register.theme';
import type { DefectNoticeStatusValue } from '../types/defect-notice.types';

interface DefectNoticeStatusBadgeProps {
  status: DefectNoticeStatusValue;
  // Raw backend statusName — shown verbatim when supplied, instead of the mapped
  // register label, so the badge reflects exactly what the API sent.
  label?: string;
}

// Presentational — the tinted status pill used by the register table. An unknown status
// code falls back to the neutral tone and the raw number, same rule as the PMI badge.
const DefectNoticeStatusBadge = ({ status, label }: DefectNoticeStatusBadgeProps) => {
  const tone = DEFECT_NOTICE_STATUS_TONES[status] ?? 'neutral';
  const { background, border, color } = REGISTER_TONE_STYLES[tone];

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: REGISTER_SIZES.pillRadius,
        color,
        fontSize: REGISTER_SIZES.badgeFontSize,
        fontWeight: 500,
        lineHeight: 1.2,
        padding: '4px 10px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        width: 'fit-content',
      }}
    >
      {(label ?? DEFECT_NOTICE_STATUS_LABELS[status] ?? String(status)).toUpperCase()}
    </Flex>
  );
};

export default DefectNoticeStatusBadge;
