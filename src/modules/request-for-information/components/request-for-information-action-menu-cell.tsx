import { EllipsisOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, Typography } from 'antd';
import { REQUEST_FOR_INFORMATION_REGISTER_COPY } from '../constants/request-for-information.constants';
import { REGISTER_COLORS } from '../constants/request-for-information-register.theme';

interface RequestForInformationActionMenuCellProps {
  requestId: string;
  onCreatePmi: (requestId: string) => void;
}

// The row's kebab menu — today just "Create PMI", room to grow the same way the
// Compensation Event quotation menu did.
const RequestForInformationActionMenuCell = ({
  requestId,
  onCreatePmi,
}: RequestForInformationActionMenuCellProps) => {
  const items = [
    {
      key: 'create-pmi',
      label: (
        // The trailing arrow marks the item as navigation — picking it leaves the register
        // for the PMI form — so it sits hard against the right edge, away from the label.
        <Flex align="center" gap={24} justify="space-between">
          <Typography.Text>{REQUEST_FOR_INFORMATION_REGISTER_COPY.createPmiLabel}</Typography.Text>
          <RightOutlined style={{ color: REGISTER_COLORS.link }} />
        </Flex>
      ),
      onClick: ({ domEvent }: { domEvent: { stopPropagation: () => void } }) => {
        domEvent.stopPropagation();
        onCreatePmi(requestId);
      },
    },
  ];

  return (
    <Dropdown trigger={['click']} menu={{ items }} placement="bottomRight">
      <Button
        aria-label={REQUEST_FOR_INFORMATION_REGISTER_COPY.actionMenuAriaLabel}
        icon={<EllipsisOutlined />}
        onClick={(event) => event.stopPropagation()}
      />
    </Dropdown>
  );
};

export default RequestForInformationActionMenuCell;
