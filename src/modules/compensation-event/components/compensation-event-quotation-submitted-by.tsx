import { UserOutlined } from '@ant-design/icons';
import { Avatar, Flex, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import { QUOTATION_COLORS, QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';
import type { QuotationSubmission } from '../types/compensation-event-quotation.types';
import { getPersonInitials } from '../utils/compensation-event.utils';
import {
  getMemberTint,
  QUOTATION_HEADER_CELL_STYLE,
} from '../utils/compensation-event-quotation.utils';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { submittedBy: copy } = CONTRACTOR_QUOTATION_COPY;

const headerCellProps = () => ({ style: QUOTATION_HEADER_CELL_STYLE });

// Who put the quotation together — the same tinted initials the quotation lines use,
// so a person reads the same in both tables.
const columns: ColumnsType<QuotationSubmission> = [
  {
    title: copy.columns.name,
    dataIndex: 'name',
    key: 'name',
    width: '40%',
    onHeaderCell: headerCellProps,
    render: (name: string) => {
      const tint = getMemberTint(name);

      return (
        <Flex align="center" gap={8}>
          <Avatar
            size={QUOTATION_SIZES.categoryAvatar}
            style={{
              backgroundColor: tint.background,
              color: tint.color,
              flex: 'none',
              fontSize: 9,
              fontWeight: 600,
            }}
          >
            {getPersonInitials(name)}
          </Avatar>
          <Typography.Text
            style={{ color: QUOTATION_COLORS.memberName, fontSize: QUOTATION_SIZES.cellFontSize }}
          >
            {name}
          </Typography.Text>
        </Flex>
      );
    },
  },
  {
    title: copy.columns.role,
    dataIndex: 'role',
    key: 'role',
    onHeaderCell: headerCellProps,
    render: (role: string) => (
      <Typography.Text type="secondary" style={{ fontSize: QUOTATION_SIZES.cellFontSize }}>
        {role}
      </Typography.Text>
    ),
  },
];

interface CompensationEventQuotationSubmittedByProps {
  submissions: QuotationSubmission[];
}

const CompensationEventQuotationSubmittedBy = ({
  submissions,
}: CompensationEventQuotationSubmittedByProps) => (
  <CompensationEventNoticeSectionCard icon={<UserOutlined />} title={copy.title} gap={16}>
    <Table<QuotationSubmission>
      columns={columns}
      dataSource={submissions}
      rowKey="id"
      pagination={false}
      size="small"
      locale={{ emptyText: copy.noPreparers }}
    />
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventQuotationSubmittedBy;
