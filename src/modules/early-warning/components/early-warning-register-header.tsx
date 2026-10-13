import { ExportOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import AppPageTitle from '@/components/shared/app-page-title';
import { EARLY_WARNING_REGISTER_COPY } from '../constants/early-warning.constants';

interface EarlyWarningRegisterHeaderProps {
  exporting?: boolean;
  onExport?: () => void;
  onRaise?: () => void;
  clauseNumber: string;
  clauseDescription: string;
}

/** Card header (icon + title + clause badge + actions) with the design's info banner beneath. */
const EarlyWarningRegisterHeader = ({
  exporting,
  onExport,
  onRaise,
  clauseNumber,
  clauseDescription,
}: EarlyWarningRegisterHeaderProps) => (
  <Flex vertical gap={16}>
    <AppPageTitle
      icon={<FileTextOutlined />}
      title={EARLY_WARNING_REGISTER_COPY.title}
      clause={{
        number: clauseNumber,
        description: clauseDescription,
      }}
      actions={
        <Flex gap={12}>
          {onExport && (
            <Button icon={<ExportOutlined />} loading={exporting} onClick={onExport}>
              Export
            </Button>
          )}
          {onRaise && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onRaise}>
              Add EW
            </Button>
          )}
        </Flex>
      }
    />
  </Flex>
);

export default EarlyWarningRegisterHeader;
