import { FileTextOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { DetailSummaryRows } from '@/components/shared/detail-summary-rows';
import { REQUEST_FOR_INFORMATION_DETAIL_COPY } from '../constants/request-for-information.constants';
import { REGISTER_COLORS } from '../constants/request-for-information-register.theme';
import type { RequestForInformation } from '../types/request-for-information.types';
import RequestForInformationSectionCard from './request-for-information-section-card';

const copy = REQUEST_FOR_INFORMATION_DETAIL_COPY;

interface RequestForInformationOverviewPanelProps {
  rfi: RequestForInformation;
}

// Presentational — the Event Summary card: the record's identity in the header, then one
// label/value line per field the record carries, under a hairline rule, through the
// shared `DetailSummaryRows` the CE/PDR/DN Overview panels use.
const RequestForInformationOverviewPanel = ({ rfi }: RequestForInformationOverviewPanelProps) => {
  const rows = [
    { label: copy.referenceNumber, value: rfi.reference },
    { label: copy.raisedBy, value: rfi.raisedByName },
    { label: copy.raisedTo, value: rfi.raisedToName ?? '-' },
  ];

  return (
    <RequestForInformationSectionCard
      icon={<FileTextOutlined />}
      title={copy.summaryTitle}
      // No reference in the heading — the Reference Number row below states the same
      // value under its own label, as on the CE Summary card.
      gap={0}
    >
      <Divider style={{ margin: '16px 0 0' }} />

      <DetailSummaryRows
        rows={rows}
        mutedColor={REGISTER_COLORS.textMuted}
        dividerColor={REGISTER_COLORS.rowDivider}
      />
    </RequestForInformationSectionCard>
  );
};

export default RequestForInformationOverviewPanel;
