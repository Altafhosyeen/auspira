'use client';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Table, type TableProps, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileTextIcon } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { ROW_OPEN_BUTTON, ROW_OPEN_ICON } from '@/constants/list-page.constants';
import {
  PROJECT_DAILY_REPORT_COLUMNS,
  projectDailyReportStatusLabel,
  projectDailyReportStatusTone,
} from '../constants/project-daily-report.constants';
import { REGISTER_COLORS, REGISTER_SIZES } from '../constants/project-daily-report-register.theme';
import type { ProjectDailyReport } from '../types/project-daily-report.types';
import { formatProgress, getProgressColor } from '../utils/project-daily-report.utils';
import ProjectDailyReportStatusBadge from './project-daily-report-status-badge';

interface ProjectDailyReportTableProps {
  data?: ProjectDailyReport[];
  loading?: boolean;
  pagination?: TableProps<ProjectDailyReport>['pagination'];
  onChange?: TableProps<ProjectDailyReport>['onChange'];
  onOpen?: (report: ProjectDailyReport) => void;
}

// Row-end shortcut into the report, drawn from the shared row-open token so this register
// stays visually identical to the CE/DN/RFI registers. `group-hover` fires it from the row.
const ProjectDailyReportOpenButton = ({
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
const ProjectDailyReportTable = ({
  data = [],
  loading = false,
  pagination,
  onChange,
  onOpen,
}: ProjectDailyReportTableProps) => {
  const columns: ColumnsType<ProjectDailyReport> = [
    {
      title: PROJECT_DAILY_REPORT_COLUMNS.reference,
      dataIndex: 'reference',
      width: 110,
      render: (reference: string) => (
        <Typography.Text style={{ fontSize: REGISTER_SIZES.refFontSize, fontWeight: 600 }}>
          {reference}
        </Typography.Text>
      ),
    },
    {
      title: PROJECT_DAILY_REPORT_COLUMNS.title,
      dataIndex: 'title',
      render: (title: string, record) => (
        <Flex align="center" gap={4}>
          {/* Blue only when the row actually opens something — the colour reads as "this is
              a link", so it would be a promise the register could not keep without `onOpen`. */}
          <Typography.Text
            style={{
              fontSize: REGISTER_SIZES.cellFontSize,
              color: onOpen ? REGISTER_COLORS.link : REGISTER_COLORS.text,
            }}
          >
            {title}
          </Typography.Text>
          {/* Reference + the day's narrative are far too long for the cell, so the info
              icon carries both as a tooltip rather than truncating a second line of text. */}
          <Tooltip
            title={
              <>
                <div style={{ fontWeight: 600 }}>{record.reference}</div>
                <div>{record.description || title}</div>
              </>
            }
          >
            <InfoCircleOutlined
              style={{ color: '#98A2B3', cursor: 'pointer', flexShrink: 0 }}
              onClick={(event) => event.stopPropagation()}
            />
          </Tooltip>
        </Flex>
      ),
    },
    {
      title: PROJECT_DAILY_REPORT_COLUMNS.submittedBy,
      dataIndex: 'submittedByName',
      width: 190,
      // The API carries no role for the submitter, so the cell prints the name alone rather
      // than reserving a second line nothing can fill.
      render: (submittedByName: string) => (
        <Typography.Text style={{ fontSize: REGISTER_SIZES.cellFontSize, fontWeight: 500 }}>
          {submittedByName || '—'}
        </Typography.Text>
      ),
    },
    {
      title: PROJECT_DAILY_REPORT_COLUMNS.raisedAt,
      dataIndex: 'raisedAt',
      width: 140,
    },
    {
      title: PROJECT_DAILY_REPORT_COLUMNS.progress,
      dataIndex: 'progress',
      width: 120,
      render: (progress: number) => (
        // Colour is the only thing separating an on-track day from a slipping one here, so the
        // percentage is also written out — the cell never relies on the colour alone.
        <Typography.Text
          style={{
            fontSize: REGISTER_SIZES.cellFontSize,
            fontWeight: 500,
            color: getProgressColor(progress),
          }}
        >
          {formatProgress(progress)}
        </Typography.Text>
      ),
    },
    {
      title: PROJECT_DAILY_REPORT_COLUMNS.status,
      dataIndex: 'statusCode',
      width: 120,
      // The API's status value shown as it arrived — no enum is published yet, so the badge
      // names the code rather than assigning it an Open/Closed meaning the backend has not
      // confirmed. A row the API gives no status for shows a dash.
      render: (_: unknown, record) =>
        record.statusCode === undefined ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : (
          <ProjectDailyReportStatusBadge
            label={projectDailyReportStatusLabel(record.statusCode)}
            tone={projectDailyReportStatusTone(record.statusCode)}
          />
        ),
    },
    {
      title: PROJECT_DAILY_REPORT_COLUMNS.action,
      key: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Flex justify="center" align="center">
          <ProjectDailyReportOpenButton
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
      locale={{
        emptyText: (
          <EmptyState
            title="No daily site reports yet"
            description="Daily site reports submitted from site will appear here once raised."
          />
        ),
      }}
      onRow={(record) => ({
        onClick: (event) => {
          if ((event.target as HTMLElement).closest('button')) return;
          onOpen?.(record);
        },
        className: onOpen ? 'group cursor-pointer' : undefined,
      })}
    />
  );
};

export default ProjectDailyReportTable;
