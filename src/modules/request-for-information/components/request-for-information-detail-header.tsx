'use client';

import { FileTextOutlined } from '@ant-design/icons';
import ClauseChip from '@/components/shared/clause-chip';
import { DetailHeader } from '@/components/shared/detail-header';
import { REQUEST_FOR_INFORMATION_DETAIL_COPY } from '../constants/request-for-information.constants';
import {
  REGISTER_COLORS,
  REGISTER_SIZES,
} from '../constants/request-for-information-register.theme';
import type { RequestForInformation } from '../types/request-for-information.types';
import { resolveClauseChip } from '../utils/request-for-information-clause.utils';

interface RequestForInformationDetailHeaderProps {
  rfi: RequestForInformation;
}

// Presentational — the title bar: icon, "Request For Information Details" and the clause
// chip read off the record. Renders through the shared `DetailHeader`, the same title bar
// the Compensation Event detail screen uses, with the same shared `ClauseChip`.
const RequestForInformationDetailHeader = ({ rfi }: RequestForInformationDetailHeaderProps) => (
  <DetailHeader
    icon={<FileTextOutlined />}
    title={REQUEST_FOR_INFORMATION_DETAIL_COPY.titlePrefix}
    color={REGISTER_COLORS.main}
    iconFontSize={REGISTER_SIZES.headerIconSize}
    titleFontSize={REGISTER_SIZES.titleFontSize}
    extra={<ClauseChip chip={resolveClauseChip(rfi)} />}
  />
);

export default RequestForInformationDetailHeader;
