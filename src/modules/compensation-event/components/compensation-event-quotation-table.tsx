import { CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import {
  CONTRACTOR_QUOTATION_COPY,
  QUOTATION_SUBMITTED_DATE_FORMAT,
} from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS } from '../constants/compensation-event-quotation.theme';
import type { CompensationEventLookupOption } from '../types/compensation-event-api.types';
import type { QuotationTableRow } from '../types/compensation-event-quotation.types';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';
import CompensationEventQuotationLinesTable from './compensation-event-quotation-lines-table';

const { quotation } = CONTRACTOR_QUOTATION_COPY;

interface CompensationEventQuotationTableProps {
  /** The reference the extractor read off the mail; omit it when the screen already names the event in its own page header. */
  reference?: string;
  submittedOn: string;
  currency: string;
  rows: QuotationTableRow[];
  /** Null when the quotation named no figure at all — rendered as a dash, not as zero. */
  total: number | null;
  expandedRowKeys: string[];
  onToggleRow: (key: string) => void;
  /** The project's compensation events — read only to name the linked one in the heading. */
  referenceOptions?: CompensationEventLookupOption[];
  /** The compensation event the quotation is linked to — unset until one is picked. */
  selectedReferenceId?: string;
  /** Muted line under the title, e.g. "Submitted - Version 2". */
  note?: string;
}

const CompensationEventQuotationTable = ({
  reference,
  submittedOn,
  currency,
  rows,
  total,
  expandedRowKeys,
  onToggleRow,
  referenceOptions,
  selectedReferenceId,
  note,
}: CompensationEventQuotationTableProps) => {
  // Named outright once an event is linked; while nothing is picked the heading stays bare and
  // the rail's link card carries both the mail's claim and the picker.
  const selectedOption = referenceOptions?.find((option) => option.value === selectedReferenceId);

  const headingReference = selectedOption?.reference ?? reference?.trim();

  return (
    <CompensationEventNoticeSectionCard
      icon={<FileTextOutlined />}
      title={quotation.title}
      // The picker lives in the rail's own link card, so the heading just names the event once
      // one is linked — an unlinked quotation shows the reference the mail claimed. Passed as a
      // node rather than a bare string: the card mutes plain text to 12px grey, and the event
      // this quotation prices reads as part of the heading, not as an aside to it.
      titleSuffix={
        headingReference ? (
          <Typography.Text strong style={{ color: QUOTATION_COLORS.main, fontSize: 16 }}>
            {headingReference}
          </Typography.Text>
        ) : undefined
      }
      subtitle={note}
      extra={
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
          {`${quotation.submittedPrefix} ${dayjs(submittedOn).format(QUOTATION_SUBMITTED_DATE_FORMAT)}`}
        </Tag>
      }
      gap={16}
    >
      <CompensationEventQuotationLinesTable
        currency={currency}
        rows={rows}
        total={total}
        expandedRowKeys={expandedRowKeys}
        onToggleRow={onToggleRow}
      />
    </CompensationEventNoticeSectionCard>
  );
};

export default CompensationEventQuotationTable;
