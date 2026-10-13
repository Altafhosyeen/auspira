import { EllipsisOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, Typography } from 'antd';
import { COMPENSATION_EVENT_REGISTER_COPY } from '../constants/compensation-event.constants';
import { REGISTER_COLORS } from '../constants/compensation-event-register.theme';

interface CompensationEventQuotationMenuCellProps {
  quotationId: string;
  onSendFormResponse: (quotationId: string) => void;
}

// The row already carries the quotation id from the register payload, so the menu is
// pure navigation — no fetch on open, just a link keyed off that id.
const CompensationEventQuotationMenuCell = ({
  quotationId,
  onSendFormResponse,
}: CompensationEventQuotationMenuCellProps) => {
  const items = [
    {
      key: 'send-form-response',
      label: (
        <Flex align="center" gap={8}>
          <SendOutlined style={{ color: REGISTER_COLORS.link }} />
          <Typography.Text>
            {COMPENSATION_EVENT_REGISTER_COPY.quotationMenuSendFormResponseLabel}
          </Typography.Text>
        </Flex>
      ),
      onClick: ({ domEvent }: { domEvent: { stopPropagation: () => void } }) => {
        domEvent.stopPropagation();
        onSendFormResponse(quotationId);
      },
    },
  ];

  return (
    <Dropdown trigger={['click']} menu={{ items }} placement="bottomRight">
      {/* Sized to the row-open button rather than the register theme's 40px control, so the
          two action buttons match and line up on every row. */}
      <Button
        aria-label={COMPENSATION_EVENT_REGISTER_COPY.quotationMenuAriaLabel}
        icon={<EllipsisOutlined />}
        onClick={(event) => event.stopPropagation()}
        className="flex h-8! w-8! shrink-0 items-center justify-center rounded-lg"
      />
    </Dropdown>
  );
};

export default CompensationEventQuotationMenuCell;
