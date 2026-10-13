import { FileTextOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { DetailSummaryRows } from '@/components/shared/detail-summary-rows';
import {
  PROJECT_DAILY_REPORT_DETAIL_COPY,
  projectDailyReportStatusLabel,
} from '../constants/project-daily-report.constants';
import { REGISTER_COLORS } from '../constants/project-daily-report-register.theme';
import type { ProjectDailyReport } from '../types/project-daily-report.types';
import ProjectDailyReportSectionCard from './project-daily-report-section-card';

const copy = PROJECT_DAILY_REPORT_DETAIL_COPY;

interface ProjectDailyReportOverviewPanelProps {
  report: ProjectDailyReport;
}

// Presentational — the DSR Summary card: one label/value line per field, under a hairline
// rule, through the shared `DetailSummaryRows` the CE/RFI/DN Overview panels use. Every row
// is a field the report endpoint actually serves — the contractor that used to sit here was
// invented by the mock rows and has no API source, so it is gone rather than rendered as a
// permanent dash.
const ProjectDailyReportOverviewPanel = ({ report }: ProjectDailyReportOverviewPanelProps) => {
  const rows = [
    { label: copy.reportReference, value: report.reference },
    { label: copy.submittedBy, value: report.submittedByName || '-' },
    {
      label: copy.status,
      value:
        report.statusCode === undefined ? '-' : projectDailyReportStatusLabel(report.statusCode),
    },
  ];

  return (
    <ProjectDailyReportSectionCard
      icon={<FileTextOutlined />}
      title={copy.summaryTitle}
      // No reference in the heading — the Report Reference row below states the same
      // value under its own label, as on the CE Summary card.
      gap={0}
    >
      <Divider style={{ margin: '16px 0 0' }} />

      <DetailSummaryRows
        rows={rows}
        mutedColor={REGISTER_COLORS.textMuted}
        dividerColor={REGISTER_COLORS.rowDivider}
      />
    </ProjectDailyReportSectionCard>
  );
};

export default ProjectDailyReportOverviewPanel;
