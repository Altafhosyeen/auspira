import { Flex } from 'antd';
import {
  REGISTER_SIZES,
  REGISTER_TONE_STYLES,
} from '../constants/project-daily-report-register.theme';
import type { ProjectDailyReportTone } from '../types/project-daily-report.types';

interface ProjectDailyReportStatusBadgeProps {
  // The label the register resolved for the row, so the badge never has to know how a backend
  // status code maps onto a name.
  label: string;
  tone?: ProjectDailyReportTone;
}

// Presentational — the tinted status pill used by the register table.
const ProjectDailyReportStatusBadge = ({
  label,
  tone = 'neutral',
}: ProjectDailyReportStatusBadgeProps) => {
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
      {label.toUpperCase()}
    </Flex>
  );
};

export default ProjectDailyReportStatusBadge;
