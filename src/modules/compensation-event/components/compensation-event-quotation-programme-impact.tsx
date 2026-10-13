import { UserOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { ProgrammeImpactEntry } from '../types/compensation-event-quotation.types';
import CompensationEventLabelValueRow from './compensation-event-label-value-row';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

interface CompensationEventQuotationProgrammeImpactProps {
  entries: ProgrammeImpactEntry[];
}

// The frame rules once under the heading and then separates the claim lines by spacing
// alone, so the rows carry no dividers of their own.
const CompensationEventQuotationProgrammeImpact = ({
  entries,
}: CompensationEventQuotationProgrammeImpactProps) => (
  <CompensationEventNoticeSectionCard
    icon={<UserOutlined />}
    title={CONTRACTOR_QUOTATION_COPY.programmeImpact.title}
    headerDivider
    gap={16}
  >
    <Flex vertical gap={QUOTATION_SIZES.programmeRowGap}>
      {entries.map((entry) => (
        <CompensationEventLabelValueRow
          key={entry.label}
          label={entry.label}
          value={entry.value}
          labelSpan={QUOTATION_SIZES.programmeLabelSpan}
          fontSize={QUOTATION_SIZES.programmeFontSize}
        />
      ))}
    </Flex>
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventQuotationProgrammeImpact;
