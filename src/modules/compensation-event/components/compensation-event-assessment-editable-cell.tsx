import { EditOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { ASSESSMENT_SIZES } from '../constants/compensation-event-assessment.theme';

interface CompensationEventAssessmentEditableCellProps {
  /** The editor to show in place of the value, or null while the cell is read-only. */
  editor: ReactNode | null;
  label: string;
  children: ReactNode;
  align?: 'flex-start' | 'flex-end';
  onEdit: () => void;
}

// A read-only cell with a pencil that swaps it for the caller's editor — the editing
// state lives with the lines table, which owns the draft it commits.
const CompensationEventAssessmentEditableCell = ({
  editor,
  label,
  children,
  align = 'flex-start',
  onEdit,
}: CompensationEventAssessmentEditableCellProps) =>
  editor ?? (
    <Flex align="center" justify={align} gap={6}>
      {children}
      <Typography.Link aria-label={label} onClick={onEdit} style={{ flex: 'none', lineHeight: 1 }}>
        <EditOutlined style={{ fontSize: ASSESSMENT_SIZES.editIconFontSize }} />
      </Typography.Link>
    </Flex>
  );

export default CompensationEventAssessmentEditableCell;
