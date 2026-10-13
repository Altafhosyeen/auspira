'use client';

import { ExportOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import AppPageTitle from '@/components/shared/app-page-title';
import { DEFECT_NOTICE_REGISTER_COPY } from '../constants/defect-notice.constants';

const { title, addLabel, exportLabel } = DEFECT_NOTICE_REGISTER_COPY;

interface DefectNoticeRegisterHeaderProps {
  exporting?: boolean;
  exportDisabled?: boolean;
  onAdd: () => void;
  onExport: () => void;
}

// Presentational — title bar with the Add DN / Export actions.
const DefectNoticeRegisterHeader = ({
  exporting = false,
  exportDisabled = false,
  onAdd,
  onExport,
}: DefectNoticeRegisterHeaderProps) => (
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

        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {addLabel}
        </Button>
      </Flex>
    }
  />
);

export default DefectNoticeRegisterHeader;
