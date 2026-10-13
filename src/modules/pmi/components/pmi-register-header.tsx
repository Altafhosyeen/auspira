import { ExportOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import AppPageTitle from '@/components/shared/app-page-title';
import { PMI_REGISTER_COPY } from '../constants/pmi.constants';

interface PmiRegisterHeaderProps {
  exporting?: boolean;
  onExport?: () => void;
  onAdd?: () => void;
  clauseNumber?: string;
  clauseDescription?: string;
}

/** Card header (icon + title + clause badge + actions). */
const PmiRegisterHeader = ({
  exporting,
  onExport,
  onAdd,
  clauseNumber,
  clauseDescription,
}: PmiRegisterHeaderProps) => (
  <AppPageTitle
    icon={<FileTextOutlined />}
    title={PMI_REGISTER_COPY.title}
    clause={{
      number: clauseNumber,
      description: clauseDescription,
    }}
    actions={
      <Flex gap={12}>
        {onExport && (
          <Button icon={<ExportOutlined />} loading={exporting} onClick={onExport}>
            {PMI_REGISTER_COPY.exportLabel}
          </Button>
        )}
        {onAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {PMI_REGISTER_COPY.addLabel}
          </Button>
        )}
      </Flex>
    }
  />
);

export default PmiRegisterHeader;
