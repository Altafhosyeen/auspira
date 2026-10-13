import { DetailBanner } from '@/components/shared/detail-banner';
import { PROJECT_DAILY_REPORT_DETAIL_COPY } from '../constants/project-daily-report.constants';
import { REGISTER_COLORS } from '../constants/project-daily-report-register.theme';

interface ProjectDailyReportDetailBannerProps {
  text?: string;
}

// Presentational — the soft-blue explainer strip under the header. Renders through the
// shared `DetailBanner`, the same strip the Defect Notice/CE/RFI detail screens use.
const ProjectDailyReportDetailBanner = ({ text }: ProjectDailyReportDetailBannerProps) => (
  <DetailBanner
    text={text}
    fallback={PROJECT_DAILY_REPORT_DETAIL_COPY.overviewBanner}
    color={REGISTER_COLORS.main}
    background={REGISTER_COLORS.mainSoft}
    borderColor={REGISTER_COLORS.tagBorder}
    padding="18px 24px"
  />
);

export default ProjectDailyReportDetailBanner;
