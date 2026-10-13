'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import type { ReactNode } from 'react';
import AppPageTitle from '@/components/shared/app-page-title';
import NoticeBanner from '@/components/shared/notice-banner';

interface EarlyWarningDetailHeaderProps {
  header: {
    summary: string | undefined;
    title: string;
    clauseNumber: string;
    clauseDescription: string;
  };
  actions?: ReactNode;
}

// Detail title bar — shared page title + clause tag (tooltip) + optional actions.
const EarlyWarningDetailHeader = ({
  header: { summary, title, clauseNumber, clauseDescription },
  actions,
}: EarlyWarningDetailHeaderProps) => (
  <Flex vertical gap={16}>
    <AppPageTitle
      icon={<FileTextOutlined />}
      title={title}
      clause={{
        number: clauseNumber || '',
        description: clauseDescription ?? '',
      }}
      actions={actions}
    />
    <NoticeBanner message={summary ?? ''} />
  </Flex>
);

export default EarlyWarningDetailHeader;
