import { FileTextOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { DetailSummaryRows } from '@/components/shared/detail-summary-rows';
import { DEFECT_NOTICE_DETAIL_COPY } from '../constants/defect-notice.constants';
import { REGISTER_COLORS } from '../constants/defect-notice-register.theme';
import type { DefectNotice } from '../types/defect-notice.types';
import DefectNoticeSectionCard from './defect-notice-section-card';

const copy = DEFECT_NOTICE_DETAIL_COPY;

interface DefectNoticeOverviewPanelProps {
  notice: DefectNotice;
}

// Presentational — the Defect Summary card: one label/value line per field the notice
// carries, under a hairline rule, through the shared `DetailSummaryRows` the CE/RFI/PDR
// Overview panels use.
const DefectNoticeOverviewPanel = ({ notice }: DefectNoticeOverviewPanelProps) => {
  const rows = [
    // The notice's own reference is a summary field, not part of the card heading — the same
    // treatment the CE and RFI summaries give theirs.
    { label: copy.referenceNumber, value: notice.reference },
    { label: copy.raisedBy, value: notice.to ?? '-' },
    { label: copy.referenceClause, value: notice.referenceClause ?? '-' },
    { label: copy.defectTitle, value: notice.title },
    { label: copy.defectDescription, value: notice.description ?? '-' },
  ];

  return (
    <DefectNoticeSectionCard icon={<FileTextOutlined />} title={copy.summaryTitle} gap={0}>
      <Divider style={{ margin: '16px 0 0' }} />

      <DetailSummaryRows
        rows={rows}
        mutedColor={REGISTER_COLORS.textMuted}
        dividerColor={REGISTER_COLORS.rowDivider}
      />
    </DefectNoticeSectionCard>
  );
};

export default DefectNoticeOverviewPanel;
