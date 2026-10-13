'use client';

import { Button, Flex, Table, type TableProps, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileTextIcon, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ROW_OPEN_BUTTON, ROW_OPEN_ICON } from '@/constants/list-page.constants';
import { COMPENSATION_EVENT_REGISTER_COLUMNS } from '../constants/compensation-event.constants';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/compensation-event-register.theme';
import type { CompensationEvent } from '../types/compensation-event.types';
import {
  formatClockTime,
  formatLocalDate,
  formatQuoteValue,
  formatTimeImpact,
  getReplyCountdown,
  resolveRegisterState,
} from '../utils/compensation-event.utils';
import CompensationEventDirectionChip from './compensation-event-direction-chip';
import CompensationEventQuotationMenuCell from './compensation-event-quotation-menu-cell';
import CompensationEventStateBadge from './compensation-event-state-badge';

interface CompensationEventTableProps {
  data?: CompensationEvent[];
  loading?: boolean;
  highlightedId?: string;
  pagination?: TableProps<CompensationEvent>['pagination'];
  onChange?: TableProps<CompensationEvent>['onChange'];
  onOpen?: (event: CompensationEvent) => void;
  onSendFormResponse?: (quotationId: string) => void;
}

const EMPTY_CELL = (
  <Typography.Text style={{ color: REGISTER_COLORS.textMuted }}>-</Typography.Text>
);

const valueTextStyle = { fontSize: REGISTER_SIZES.cellFontSize, fontWeight: 600 };

// Typography only — the two-line clamp comes from Typography.Paragraph's own
// `ellipsis`, so repeating a -webkit-box clamp here would fight it.
const subjectTextStyle: CSSProperties = {
  margin: 0,
  color: REGISTER_COLORS.subjectText,
  fontSize: REGISTER_SIZES.subjectFontSize,
  fontWeight: 500,
  wordBreak: 'break-word',
};

// Row-end shortcut into the CE, drawn from the shared row-open token so this register,
// the EW register and the queues stay identical. `group-hover` fires it from the row.
const CompensationEventOpenButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <Button
    aria-label={label}
    icon={<FileTextIcon className={ROW_OPEN_ICON} />}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className={ROW_OPEN_BUTTON}
  />
);

// Presentational — props in, callbacks out; the parent owns the logic.
const CompensationEventTable = ({
  data = [],
  loading = false,
  highlightedId,
  pagination,
  onChange,
  onOpen,
  onSendFormResponse,
}: CompensationEventTableProps) => {
  const router = useRouter();
  const columns: ColumnsType<CompensationEvent> = [
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.refAndSubject,
      dataIndex: 'reference',
      width: REGISTER_SIZES.refColumnWidth,
      render: (reference: string, record) => (
        // `nowrap` on the row and the ref: the chip is a fixed lozenge and the reference
        // is a single token, so neither may be broken across lines to fit the column.
        <Flex align="center" gap={10} wrap={false}>
          {/* Only an event the response actually gave a direction carries the chip —
              defaulting an unstated direction to OUT labelled every row on the register
              as outgoing whether or not it was. */}
          {!!record.direction && <CompensationEventDirectionChip direction={record.direction} />}
          <Typography.Text
            style={{
              fontSize: REGISTER_SIZES.refFontSize,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {reference}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.subject,
      dataIndex: 'title',
      // The one column without a declared width, so it soaks up whatever the card has
      // left over once the fixed columns are laid out. That is what lets the table fit
      // the card at any viewport instead of overflowing into a horizontal scrollbar.
      // Free text of any length — clamped to two lines so the row height stays uniform,
      // with the full string in a tooltip. Wrapping the inner text rather than the cell
      // keeps the tooltip from collapsing the clamped block.
      render: (title: string) => (
        <Tooltip title={title}>
          <Typography.Paragraph style={subjectTextStyle} ellipsis={{ rows: 2 }}>
            {title}
          </Typography.Paragraph>
        </Tooltip>
      ),
    },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.parentEarlyWarning,
      dataIndex: 'parentEarlyWarningReference',
      align: 'center',
      // Holds an "EWN-0000" reference or a dash — the wrapped header sets the floor here,
      // not the cells. Every width on this table is kept to what its content needs so the
      // subject column, which has no width of its own, keeps the remainder.
      width: 100,
      // Only an Early Warning the register can actually open is named here. A reference with no
      // id behind it is a dead end — it reads as a link to a record the table cannot reach — so
      // the cell falls back to the empty dash instead.
      render: (parentReference?: string, record?) =>
        parentReference && record?.parentEarlyWarningId ? (
          <Typography.Link
            style={{
              ...valueTextStyle,
              color: record?.id === highlightedId ? REGISTER_COLORS.link : undefined,
            }}
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/contract-control-agent/early-warning/${record.parentEarlyWarningId}`);
            }}
          >
            {parentReference}
          </Typography.Link>
        ) : (
          EMPTY_CELL
        ),
    },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.quoteValue,
      dataIndex: 'quotedValue',
      align: 'center',
      width: 100,
      // The contractor's own quote once one has been submitted; the PM's estimate until then.
      render: (_, record) => (
        <Typography.Text style={valueTextStyle}>
          {formatQuoteValue(record.quotedValue ?? record.amount, record.currency)}
        </Typography.Text>
      ),
    },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.timeImpact,
      dataIndex: 'quotedDays',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Typography.Text style={valueTextStyle}>
          {formatTimeImpact(record.quotedDays ?? record.timeImpactDays)}
        </Typography.Text>
      ),
    },
    // {
    //   title: COMPENSATION_EVENT_REGISTER_COLUMNS.reply,
    //   dataIndex: 'replyDueDate',
    //   align: 'center',
    //   width: 110,
    //   render: (replyDueDate?: string | null) => {
    //     const countdown = getReplyCountdown(replyDueDate);
    //     if (!countdown) return EMPTY_CELL;

    //     return (
    //       <Flex justify="center">
    //         <CompensationEventToneBadge tone={countdown.tone}>
    //           {countdown.label}
    //         </CompensationEventToneBadge>
    //       </Flex>
    //     );
    //   },
    // },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.clauses,
      dataIndex: 'clauses',
      align: 'center',
      width: 90,
      render: (clauses?: string[]) =>
        clauses?.length ? (
          <Flex vertical align="center" gap={5}>
            {clauses.map((clause) => (
              <Tag
                key={clause}
                bordered={false}
                style={{ margin: 0, fontSize: REGISTER_SIZES.badgeFontSize }}
              >
                {clause}
              </Tag>
            ))}
          </Flex>
        ) : (
          EMPTY_CELL
        ),
    },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.raisedAt,
      dataIndex: 'createdAt',
      align: 'center',
      width: 120,
      // createdOn is a real instant (the moment the CE was raised), not a calendar date, so
      // both halves read in the viewer's own timezone rather than UTC. The clock sits under
      // the date instead of beside it — one line would wrap at this column width.
      render: (createdAt?: string) =>
        createdAt ? (
          <Flex vertical align="center">
            <Typography.Text style={valueTextStyle}>{formatLocalDate(createdAt)}</Typography.Text>
            <Typography.Text
              style={{ fontSize: REGISTER_SIZES.subjectFontSize, color: REGISTER_COLORS.textMuted }}
            >
              {formatClockTime(createdAt)}
            </Typography.Text>
          </Flex>
        ) : (
          EMPTY_CELL
        ),
    },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.state,
      dataIndex: 'status',
      align: 'center',
      // Holds the longest status the backend sends ("REVISED QUOTATION TO BE SUBMITTED")
      // on one line at the badge's 9px, icon and padding included — the badge does not
      // wrap, so a narrower column clipped it. Funded by the ref column, which no longer
      // carries the direction chip.
      width: 220,
      render: (_, record) => (
        <Flex justify="center">
          <CompensationEventStateBadge
            state={resolveRegisterState(record.status)}
            label={record.statusName}
            overdue={getReplyCountdown(record.replyDueDate)?.tone === 'danger'}
          />
        </Flex>
      ),
    },
    {
      title: COMPENSATION_EVENT_REGISTER_COLUMNS.action,
      key: 'action',
      align: 'center',
      width: 110,
      // Only events the backend has a quotation for get the menu; the open button
      // always shows since the row itself opens the CE regardless.
      render: (_, record) => (
        <Flex justify="center" align="center" gap={12}>
          {/* Reserves the menu button's slot even on rows without a quotation, so the open
              button lands in the same spot on every row. The placeholder has to carry the
              menu button's own 32px footprint — an empty div collapses to zero width and lets
              the open button slide left. */}
          <div className="h-8 w-8 shrink-0">
            {record.quotationId && (
              <CompensationEventQuotationMenuCell
                quotationId={record.quotationId}
                onSendFormResponse={(quotationId) => onSendFormResponse?.(quotationId)}
              />
            )}
          </div>
          <CompensationEventOpenButton
            label={`Open ${record.reference}`}
            onClick={() => onOpen?.(record)}
          />
        </Flex>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      // No `scroll.x`: every column but the subject carries a fixed width, so the table
      // lays those out at their intended size and gives the rest to the subject. The
      // register fits the card at any width and never grows a horizontal scrollbar.
      tableLayout="fixed"
      locale={{
        emptyText: (
          <EmptyState
            tone="success"
            icon={<ShieldCheck className="text-emerald-500" size={22} />}
            title="No compensation events yet"
            description="Compensation events raised on this project will appear here once notified."
          />
        ),
      }}
      onRow={(record) => ({
        onClick: () => onOpen?.(record),
        // `group` lets the row-end open button light up with the rest of the row on hover.
        className: 'group',
        style: {
          cursor: 'pointer',
          ...(record.id === highlightedId
            ? {
                background: REGISTER_COLORS.mainSoft,
                boxShadow: `inset 3px 0 0 ${REGISTER_COLORS.main}`,
              }
            : {}),
        },
      })}
    />
  );
};

export default CompensationEventTable;
