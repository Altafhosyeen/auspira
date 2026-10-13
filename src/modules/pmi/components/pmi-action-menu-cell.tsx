import {
  EllipsisOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown } from 'antd';
import type { ProjectManagerInstruction } from '../types/pmi.types';

interface PmiActionMenuCellProps {
  pmi: ProjectManagerInstruction;
  onViewQuotation?: (pmi: ProjectManagerInstruction) => void;
  onOpenCompensationEvent?: (pmi: ProjectManagerInstruction) => void;
  onViewCrossReference?: (pmi: ProjectManagerInstruction) => void;
}

type MenuClickInfo = Parameters<NonNullable<MenuProps['onClick']>>[0];

// Menu clicks bubble through the portal to the row, which would open the PMI instead.
const stopRowClick =
  (handler: () => void) =>
  ({ domEvent }: MenuClickInfo) => {
    domEvent.stopPropagation();
    handler();
  };

// The row's kebab menu — opens on hover and lists only the jumps this PMI actually has.
const PmiActionMenuCell = ({
  pmi,
  onViewQuotation,
  onOpenCompensationEvent,
  onViewCrossReference,
}: PmiActionMenuCellProps) => {
  const items: NonNullable<MenuProps['items']> = [];

  // A PMI carries at most one follow-on record: the quotation awaiting review, or the
  // compensation event raised from it.
  if (pmi.quotationId) {
    items.push({
      key: 'quotation',
      icon: <FileTextOutlined />,
      label: 'View Quotation',
      onClick: stopRowClick(() => onViewQuotation?.(pmi)),
    });
  } else if (pmi.compensationEventId) {
    items.push({
      key: 'compensation-event',
      icon: <LinkOutlined />,
      label: 'View Compensation Event',
      onClick: stopRowClick(() => onOpenCompensationEvent?.(pmi)),
    });
  }

  if (pmi.projectCrossReferenceId) {
    items.push({
      key: 'cross-reference',
      icon: <FileSearchOutlined />,
      label: 'View Cross Reference',
      onClick: stopRowClick(() => onViewCrossReference?.(pmi)),
    });
  }

  if (items.length === 0) return null;

  return (
    <Dropdown trigger={['hover']} menu={{ items }} placement="bottomRight">
      <Button
        aria-label="PMI actions"
        icon={<EllipsisOutlined />}
        onClick={(event) => event.stopPropagation()}
      />
    </Dropdown>
  );
};

export default PmiActionMenuCell;
