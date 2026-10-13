'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { DetailHeader } from '@/components/shared/detail-header';
import { PROJECT_DAILY_REPORT_DETAIL_COPY } from '../constants/project-daily-report.constants';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/project-daily-report-register.theme';

// Presentational — the title bar above the detail screen. Renders through the shared
// `DetailHeader`, the same title bar the Compensation Event and Request For Information
// detail screens use, so every detail header reads identically.
//
// The title is the screen's name alone, with no reference appended: CE and RFI both print a
// bare title and carry the record's own identifiers in the summary card below, and a
// suffixed one here would be the only header of the set that reads differently.
const ProjectDailyReportDetailHeader = () => (
  <DetailHeader
    icon={<FileTextOutlined />}
    title={PROJECT_DAILY_REPORT_DETAIL_COPY.title}
    color={REGISTER_COLORS.main}
    iconFontSize={REGISTER_SIZES.headerIconSize}
    titleFontSize={REGISTER_SIZES.titleFontSize}
  />
);

export default ProjectDailyReportDetailHeader;
