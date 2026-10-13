'use client';

import { ExportOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import AppPageTitle from '@/components/shared/app-page-title';
import { PROJECT_DAILY_REPORT_COPY } from '../constants/project-daily-report.constants';

const { title, exportLabel } = PROJECT_DAILY_REPORT_COPY;

interface ProjectDailyReportRegisterHeaderProps {
  exporting?: boolean;
  exportDisabled?: boolean;
  onExport: () => void;
}

// Presentational — title bar with the Export action. No "Add" here, unlike the CE/DN
// registers: daily reports are submitted from site, so this screen only ever reads them.
const ProjectDailyReportRegisterHeader = ({
  exporting = false,
  exportDisabled = false,
  onExport,
}: ProjectDailyReportRegisterHeaderProps) => (
  <AppPageTitle
    icon={<FileTextOutlined />}
    title={title}
    actions={
      <Flex align="center" gap={12} wrap>
        <Button
          icon={<ExportOutlined />}
          loading={exporting}
          disabled={exportDisabled}
          onClick={onExport}
        >
          {exportLabel}
        </Button>
      </Flex>
    }
  />
);

export default ProjectDailyReportRegisterHeader;
