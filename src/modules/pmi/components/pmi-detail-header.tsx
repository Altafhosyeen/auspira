'use client';

import { FileTextOutlined } from '@ant-design/icons';
import AppPageTitle, { type ClauseBadge } from '@/components/shared/app-page-title';

interface PmiDetailHeaderProps {
  /** Clause badge for the title bar — number + title straight from the PMI record. */
  clause?: ClauseBadge;
}

// Detail title bar — shared page title with the instruction's clause chip. Pure antd
// components, no module-specific styling.
const PmiDetailHeader = ({ clause }: PmiDetailHeaderProps) => (
  <AppPageTitle
    icon={<FileTextOutlined />}
    title="Project Manager's Instruction Details"
    clause={clause}
  />
);

export default PmiDetailHeader;
