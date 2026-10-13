'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import type { ReactNode } from 'react';
import AppPageTitle, { stripClausePrefix } from '@/components/shared/app-page-title';
import NoticeBanner from '@/components/shared/notice-banner';
import {
  DEFECT_NOTICE_CLAUSE_DESCRIPTIONS,
  DEFECT_NOTICE_DETAIL_COPY,
} from '../constants/defect-notice.constants';
import type { DefectNotice } from '../types/defect-notice.types';

interface DefectNoticeDetailHeaderProps {
  notice: DefectNotice;
  /** Rendered at the title bar's right edge — the Mark as Closed action. */
  actions?: ReactNode;
}

// Detail title bar — shared page title + clause tag (tooltip) + optional actions, then the
// notice summary as the banner, the same two-block header the Early Warning detail renders.
const DefectNoticeDetailHeader = ({ notice, actions }: DefectNoticeDetailHeaderProps) => {
  const clauseNumber = stripClausePrefix(notice.referenceClause);

  return (
    <Flex vertical gap={16}>
      <AppPageTitle
        icon={<FileTextOutlined />}
        title={notice.title?.trim() || DEFECT_NOTICE_DETAIL_COPY.titlePrefix}
        clause={{
          number: notice.referenceClause ?? '',
          reference: notice.reference,
          description: clauseNumber
            ? DEFECT_NOTICE_CLAUSE_DESCRIPTIONS[clauseNumber]
            : (notice.summary ?? ''),
        }}
        actions={actions}
      />
      <NoticeBanner message={notice.summary ?? notice.description ?? ''} />
    </Flex>
  );
};

export default DefectNoticeDetailHeader;
