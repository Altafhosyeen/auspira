import { CheckOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Popconfirm, Select, Typography } from 'antd';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { CompensationEventLookupOption } from '../types/compensation-event-api.types';

const { quotation, popconfirm } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventQuotationLinkCardProps {
  /** The reference the extractor read off the mail — a claim, not a link. */
  reference: string;
  options?: CompensationEventLookupOption[];
  optionsLoading?: boolean;
  selectedReferenceId?: string;
  /** Called with no id when the picker is cleared — `allowClear` is on. */
  onReferenceChange?: (compensationEventId?: string) => void;
  onConfirmReference?: () => void;
  confirming?: boolean;
  /** The picked event is already linked to this quotation — the button has nothing left to do. */
  confirmed?: boolean;
  title?: string;
  placeholder?: string;
}

// The mail's own reference names an event nothing on this project has to answer to, so the PM
// picks the real one here and confirms it. It sits in the rail rather than the quotation's
// heading: linking is a decision about the record, not part of reading the priced items.
const CompensationEventQuotationLinkCard = ({
  reference,
  options,
  optionsLoading,
  selectedReferenceId,
  onReferenceChange,
  onConfirmReference,
  confirming = false,
  confirmed = false,
  title,
  placeholder,
}: CompensationEventQuotationLinkCardProps) => {
  // Says what the mail claimed while nothing is picked, so the PM knows what they are being
  // asked to reconcile. Once an event is chosen the picker itself carries the answer.
  const hint = selectedReferenceId
    ? undefined
    : reference.trim()
      ? `${quotation.link.quotedPrefix} "${reference.trim()}" ${quotation.link.quotedSuffix}`
      : quotation.link.missing;
  const selectedLabel = options?.find((option) => option.value === selectedReferenceId)?.label;

  return (
    <Card>
      <Flex vertical gap={12}>
        <Typography.Text strong style={{ color: QUOTATION_COLORS.main, fontSize: 16 }}>
          {title ?? quotation.link.title}
        </Typography.Text>

        {hint && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {hint}
          </Typography.Text>
        )}

        {/* A confirmed link is settled — the actions block below it acts on that exact
            record, so the picker locks rather than letting the link drift underneath. */}
        <Select
          value={selectedReferenceId}
          options={options ?? []}
          allowClear
          disabled={confirmed}
          loading={optionsLoading}
          placeholder={placeholder ?? quotation.link.placeholder}
          showSearch={{ optionFilterProp: 'label' }}
          notFoundContent={optionsLoading ? undefined : quotation.link.empty}
          onChange={onReferenceChange}
          popupMatchSelectWidth={QUOTATION_SIZES.referenceSelectPopupWidth}
          style={{ width: '100%' }}
        />

        {/* Only reached once a reference is picked — a confirmed link needs no button. */}
        {selectedReferenceId && !confirmed && onConfirmReference && (
          <Popconfirm
            title={popconfirm.link.title}
            description={selectedLabel}
            okText={popconfirm.link.okText}
            cancelText={popconfirm.cancel}
            okButtonProps={{ loading: confirming }}
            onConfirm={onConfirmReference}
          >
            <Button block type="primary" icon={<CheckOutlined />} loading={confirming}>
              {quotation.link.confirm}
            </Button>
          </Popconfirm>
        )}
      </Flex>
    </Card>
  );
};

export default CompensationEventQuotationLinkCard;
