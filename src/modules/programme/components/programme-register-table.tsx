'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Flex, Table, type TableProps, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  PROGRAMME_REGISTER_COPY,
  programmeHealthLabel,
  programmeHealthTone,
  programmeStatusLabel,
  programmeStatusTone,
  programmeVarianceTone,
} from '../constants/programme.constants';
import {
  HEALTH_DOT_COLORS,
  REGISTER_COLORS,
  REGISTER_SIZES,
  REGISTER_TONE_STYLES,
} from '../constants/programme-register.theme';
import type { ProgrammeRegisterRow } from '../types/programme.types';
import ProgrammeStatusBadge from './programme-status-badge';

const { columns: COLUMN_LABELS } = PROGRAMME_REGISTER_COPY;

interface ProgrammeRegisterTableProps {
  data?: ProgrammeRegisterRow[];
  loading?: boolean;
  pagination?: TableProps<ProgrammeRegisterRow>['pagination'];
  onChange?: TableProps<ProgrammeRegisterRow>['onChange'];
  /** Opens one stored record. The row id is the programme health id the detail route takes. */
  onOpen?: (row: ProgrammeRegisterRow) => void;
  /** Fetches the row's source file — the stored URL is private, so it cannot be opened directly. */
  onDownload?: (row: ProgrammeRegisterRow) => void;
  /** The row whose file is in flight, so only that row's action spins. */
  downloadingId?: string;
}

// Health uses the confirmed ProgrammeHealthCheck enum; unknown future codes remain neutral.
const HealthCell = ({ code }: { code?: number }) => {
  if (code === undefined) {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }

  const tone = programmeHealthTone(code);

  return (
    <Flex align="center" gap={8}>
      <span
        style={{
          background: HEALTH_DOT_COLORS[tone],
          borderRadius: '50%',
          flexShrink: 0,
          height: REGISTER_SIZES.healthDotSize,
          width: REGISTER_SIZES.healthDotSize,
        }}
      />
      <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize }}>
        {programmeHealthLabel(code)}
      </Typography.Text>
    </Flex>
  );
};

// The variance arrives as a signed string, so the sign it carries is what tints the pill —
// the same green/red pair the other registers use for a favourable or adverse movement.
const VarianceCell = ({ variance }: { variance: string }) => {
  if (!variance) return <Typography.Text type="secondary">—</Typography.Text>;

  const { background, color } = REGISTER_TONE_STYLES[programmeVarianceTone(variance)];

  return (
    <Typography.Text
      style={{
        background,
        borderRadius: REGISTER_SIZES.pillRadius,
        color,
        fontSize: REGISTER_SIZES.cellFontSize,
        fontWeight: 500,
        padding: '3px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {variance}
    </Typography.Text>
  );
};

// Presentational — props in, callbacks out; the parent owns the logic.
const ProgrammeRegisterTable = ({
  data = [],
  loading = false,
  pagination,
  onChange,
  onOpen,
  onDownload,
  downloadingId,
}: ProgrammeRegisterTableProps) => {
  const columns: ColumnsType<ProgrammeRegisterRow> = [
    {
      title: COLUMN_LABELS.reference,
      dataIndex: 'reference',
      width: 140,
      // Plain text: the whole row is the way into the record, advertised by the row's pointer
      // cursor — the same affordance the PMI, Defect Notice and Daily Site Report registers use.
      render: (reference: string) => (
        <Typography.Text style={{ fontSize: REGISTER_SIZES.refFontSize, fontWeight: 600 }}>
          {reference || '—'}
        </Typography.Text>
      ),
    },
    {
      title: COLUMN_LABELS.completionDate,
      dataIndex: 'completionDate',
      width: 160,
      render: (completionDate: string) => (
        <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize }}>
          {completionDate || '—'}
        </Typography.Text>
      ),
    },
    {
      title: COLUMN_LABELS.variance,
      dataIndex: 'variance',
      width: 130,
      render: (variance: string) => <VarianceCell variance={variance} />,
    },
    {
      title: COLUMN_LABELS.health,
      dataIndex: 'healthCode',
      width: 140,
      render: (_: unknown, record) => <HealthCell code={record.healthCode} />,
    },
    {
      title: COLUMN_LABELS.raisedBy,
      dataIndex: 'raisedBy',
      width: 190,
      render: (raisedBy: string) => (
        <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize, fontWeight: 500 }}>
          {raisedBy || '—'}
        </Typography.Text>
      ),
    },
    {
      title: COLUMN_LABELS.raisedAt,
      dataIndex: 'raisedAt',
      width: 150,
      render: (raisedAt: string) => (
        <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize }}>
          {raisedAt || '—'}
        </Typography.Text>
      ),
    },
    {
      title: COLUMN_LABELS.status,
      dataIndex: 'statusCode',
      width: 140,
      render: (statusCode: number | undefined) =>
        statusCode === undefined ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : (
          <ProgrammeStatusBadge
            label={programmeStatusLabel(statusCode)}
            tone={programmeStatusTone(statusCode)}
          />
        ),
    },
    {
      title: COLUMN_LABELS.action,
      key: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => (
        // A row the API returns without a file disables the action rather than offering a
        // download that would fail; the shared wrapper carries the reason, since a disabled
        // button swallows its own hover events. The column's `align: center` centres it.
        <DisabledTooltip disabled={!record.fileUrl} reason={PROGRAMME_REGISTER_COPY.noFile}>
          <Tooltip title={record.fileUrl ? PROGRAMME_REGISTER_COPY.download : undefined}>
            <Button
              type="text"
              icon={<DownloadOutlined />}
              loading={downloadingId === record.id}
              disabled={!record.fileUrl}
              onClick={() => onDownload?.(record)}
              aria-label={`Download ${record.reference}`}
            />
          </Tooltip>
        </DisabledTooltip>
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
      scroll={{ x: 'max-content' }}
      locale={{
        emptyText: (
          <EmptyState
            title={PROGRAMME_REGISTER_COPY.emptyStateTitle}
            description={PROGRAMME_REGISTER_COPY.emptyStateDescription}
          />
        ),
      }}
      style={{ color: REGISTER_COLORS.text }}
      // A row opens the record; the action button inside it keeps its own click, so a download
      // never also navigates away — the guard the Daily Site Report register uses.
      onRow={(record) => ({
        onClick: (event) => {
          if ((event.target as HTMLElement).closest('button')) return;
          onOpen?.(record);
        },
        className: onOpen ? 'cursor-pointer' : undefined,
      })}
    />
  );
};

export default ProgrammeRegisterTable;
