'use client';

import { CheckCircleOutlined, FileOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Collapse,
  ConfigProvider,
  Flex,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DETAIL_COLORS, PANEL_SIZES } from '../constants/compensation-event-detail.theme';
import { COMPENSATION_EVENT_FINANCIALS_COPY } from '../constants/compensation-event-financials.constants';
import {
  CONTRACTOR_QUOTATION_COPY,
  QUOTATION_SUBMITTED_DATE_FORMAT,
} from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS, QUOTATION_THEME } from '../constants/compensation-event-quotation.theme';
import { useGetQuotationsByCompensationEvent } from '../hooks/use-quotations';
import {
  buildQuotationRows,
  formatQuotationAmount,
  getQuotationGroupKeys,
  getQuotationSummary,
  toContractorQuotation,
} from '../utils/compensation-event-quotation.utils';
import CompensationEventQuotationAmountRow from './compensation-event-quotation-amount-row';
import CompensationEventQuotationLinesTable from './compensation-event-quotation-lines-table';

const { quotation, riskAllowance: riskAllowanceCopy } = CONTRACTOR_QUOTATION_COPY;

// Container + presentational — the collapsed Quotation row closing the Financials tab,
// read off the latest quotation the event actually has. The header carries what the row
// is worth; expanding prices it out line by line, and the link still leads to the full
// Quotation page for everything the breakdown leaves out. No quotation yet — the row
// simply does not render.
const CompensationEventFinancialQuotationSummary = ({ eventId }: { eventId: string }) => {
  const router = useRouter();
  const { data: quotations, isLoading } = useGetQuotationsByCompensationEvent({
    compensationEventId: eventId,
  });

  const latest = quotations?.find((entry) => entry.isLatest) ?? quotations?.[0];
  const contractorQuotation = useMemo(
    () => (latest ? toContractorQuotation(latest) : undefined),
    [latest]
  );
  const rows = useMemo(
    () => buildQuotationRows(contractorQuotation?.lines ?? []),
    [contractorQuotation]
  );

  // Groups the contractor broke down open with the row, the way the Quotation page shows
  // them; a group the PM closes stays closed for as long as the row is open.
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<string[]>([]);
  const expandedRowKeys = useMemo(
    () =>
      getQuotationGroupKeys(contractorQuotation?.lines ?? []).filter(
        (key) => !collapsedGroupKeys.includes(key)
      ),
    [contractorQuotation, collapsedGroupKeys]
  );

  const handleToggleRow = (key: string) =>
    setCollapsedGroupKeys((current) =>
      current.includes(key) ? current.filter((rowKey) => rowKey !== key) : [...current, key]
    );

  if (isLoading) return <Skeleton active paragraph={{ rows: 1 }} />;
  if (!latest || !contractorQuotation) return null;

  const summary = getQuotationSummary(contractorQuotation, contractorQuotation.riskAllowance);

  return (
    <ConfigProvider theme={QUOTATION_THEME}>
      <Card styles={{ body: { padding: 0 } }}>
        <Collapse
          ghost
          defaultActiveKey={['quotation']}
          expandIconPosition="end"
          items={[
            {
              key: 'quotation',
              label: (
                <Flex align="center" gap={PANEL_SIZES.headerGap}>
                  <Avatar
                    shape="square"
                    size={PANEL_SIZES.headerChip}
                    icon={<FileOutlined />}
                    style={{
                      backgroundColor: DETAIL_COLORS.mainSoft,
                      border: `1px solid ${DETAIL_COLORS.mainBorder}`,
                      color: DETAIL_COLORS.main,
                    }}
                  />
                  <Typography.Text style={{ fontSize: PANEL_SIZES.titleFontSize, fontWeight: 600 }}>
                    {quotation.title}
                  </Typography.Text>
                </Flex>
              ),
              // The total is left to the table inside: repeating it in the header only
              // restated a figure the opened row already spells out.
              extra: (
                <Tag
                  bordered
                  icon={<CheckCircleOutlined />}
                  style={{
                    margin: 0,
                    borderRadius: 20,
                    padding: '2px 8px',
                    backgroundColor: QUOTATION_COLORS.submittedBg,
                    borderColor: QUOTATION_COLORS.submittedBorder,
                    color: QUOTATION_COLORS.submittedText,
                  }}
                >
                  {`${quotation.submittedPrefix} ${dayjs(contractorQuotation.submittedOn).format(QUOTATION_SUBMITTED_DATE_FORMAT)}`}
                </Tag>
              ),
              children: (
                <Flex vertical gap={12}>
                  <CompensationEventQuotationLinesTable
                    currency={contractorQuotation.currency}
                    rows={rows}
                    total={summary.quotationTotal}
                    expandedRowKeys={expandedRowKeys}
                    onToggleRow={handleToggleRow}
                  />
                  {/* The header figure is the quotation plus its allowance, so a priced
                      allowance is spelled out here rather than leaving the table total
                      looking like it disagrees with the row above it. */}
                  {!!summary.riskAllowance && (
                    <Flex vertical gap={8} style={{ paddingInline: 8 }}>
                      <CompensationEventQuotationAmountRow
                        label={riskAllowanceCopy.title}
                        amount={formatQuotationAmount(
                          summary.riskAllowance,
                          contractorQuotation.currency
                        )}
                      />
                      <CompensationEventQuotationAmountRow
                        emphasis
                        label={riskAllowanceCopy.totalWithAllowance}
                        amount={formatQuotationAmount(
                          summary.grandTotal,
                          contractorQuotation.currency
                        )}
                      />
                    </Flex>
                  )}
                  <Flex justify="flex-end">
                    <Button
                      type="link"
                      onClick={() =>
                        router.push(
                          `/contract-control-agent/compensation-event/quotation/detail/${latest.id}`
                        )
                      }
                    >
                      {COMPENSATION_EVENT_FINANCIALS_COPY.viewFullQuotationLabel}
                    </Button>
                  </Flex>
                </Flex>
              ),
            },
          ]}
        />
      </Card>
    </ConfigProvider>
  );
};

export default CompensationEventFinancialQuotationSummary;
