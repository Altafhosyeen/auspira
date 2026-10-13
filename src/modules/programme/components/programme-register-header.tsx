'use client';

import { ExportOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import AppPageTitle from '@/components/shared/app-page-title';
import { PROGRAMME_REGISTER_COPY } from '../constants/programme.constants';

interface ProgrammeRegisterHeaderProps {
  exporting?: boolean;
  exportDisabled?: boolean;
  onExport: () => void;
}

// Presentational — title bar with the Export action. No "Add" here, unlike the CE/DN
// registers: a programme enters through an awareness signal and the accept endpoint, so this
// screen only ever reads the register.
const ProgrammeRegisterHeader = ({
  exporting = false,
  exportDisabled = false,
  onExport,
}: ProgrammeRegisterHeaderProps) => (
  <AppPageTitle
    icon={<FileTextOutlined />}
    title={PROGRAMME_REGISTER_COPY.title}
    actions={
      <Flex align="center" gap={12} wrap>
        <Button
          icon={<ExportOutlined />}
          loading={exporting}
          disabled={exportDisabled}
          onClick={onExport}
        >
          {PROGRAMME_REGISTER_COPY.exportLabel}
        </Button>
      </Flex>
    }
  />
);

export default ProgrammeRegisterHeader;
