'use client';

import {
  DownloadOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileZipOutlined,
} from '@ant-design/icons';
import { Button, Flex, Tag, Tooltip, Typography } from 'antd';
import { type ReactNode, useState } from 'react';
import { COMPENSATION_EVENT_EVIDENCE_COPY } from '../constants/compensation-event-evidence.constants';
import {
  EVIDENCE_COLORS,
  EVIDENCE_KIND_TONES,
  EVIDENCE_PACK_GRID_COLUMNS,
  EVIDENCE_SIZES,
} from '../constants/compensation-event-evidence.theme';
import { REGISTER_COLORS } from '../constants/compensation-event-register.theme';
import type {
  CompensationEventEvidenceFile,
  CompensationEventEvidenceKind,
} from '../types/compensation-event.types';
import { formatFileSize, formatThreadTimestamp } from '../utils/compensation-event.utils';

const { downloadLabel } = COMPENSATION_EVENT_EVIDENCE_COPY;

const KIND_ICONS: Record<CompensationEventEvidenceKind, ReactNode> = {
  PDF: <FilePdfOutlined />,
  XLSX: <FileExcelOutlined />,
  DOCX: <FileTextOutlined />,
  ZIP: <FileZipOutlined />,
  IMAGE: <FileImageOutlined />,
  FILE: <FileOutlined />,
};

// The grid track sets the width; the cell only has to clip inside it.
const META_STYLE = {
  color: REGISTER_COLORS.textMuted,
  display: 'block',
  fontSize: EVIDENCE_SIZES.packFontSize,
  fontWeight: 500,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

interface CompensationEventEvidenceRowProps {
  file: CompensationEventEvidenceFile;
  // The record the file hangs off — tagged beside the name so a file lifted out of the row
  // (downloaded, quoted into a mail) still says which CE it belongs to. Absent where the
  // list is already scoped to one record on screen, e.g. the attachments modal.
  reference?: string;
  onDownload?: (file: CompensationEventEvidenceFile) => void;
}

// Presentational — one attachment row: file chip, name, type, stamp, size and the
// download action, tinted on hover so the whole row reads as one target.
const CompensationEventEvidenceRow = ({
  file,
  reference,
  onDownload,
}: CompensationEventEvidenceRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const tone = EVIDENCE_KIND_TONES[file.kind];

  return (
    <Flex
      align="center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? EVIDENCE_COLORS.rowHoverBg : 'transparent',
        borderRadius: EVIDENCE_SIZES.packRowRadius,
        columnGap: EVIDENCE_SIZES.packColumnGap,
        display: 'grid',
        gridTemplateColumns: EVIDENCE_PACK_GRID_COLUMNS,
        minWidth: EVIDENCE_SIZES.packGridMinWidth,
        padding: `${EVIDENCE_SIZES.packRowPaddingBlock}px ${EVIDENCE_SIZES.packRowPaddingInline}px`,
        transition: 'background 0.2s ease',
      }}
    >
      <Flex
        align="center"
        justify="center"
        style={{
          background: tone.background,
          borderRadius: EVIDENCE_SIZES.packFileChipRadius,
          color: tone.color,
          flex: 'none',
          fontSize: EVIDENCE_SIZES.packFileIconFontSize,
          height: EVIDENCE_SIZES.packFileChip,
          width: EVIDENCE_SIZES.packFileChip,
        }}
      >
        {KIND_ICONS[file.kind]}
      </Flex>

      <Flex vertical style={{ minWidth: 0 }}>
        {/* The name takes the slack and the tag keeps its size — a long file name is
            clipped by its own ellipsis rather than squeezing the reference out. */}
        <Flex align="center" gap={6} style={{ minWidth: 0 }}>
          <Tooltip title={file.name}>
            <Typography.Text
              ellipsis
              style={{
                display: 'block',
                fontSize: EVIDENCE_SIZES.packFontSize,
                fontWeight: 500,
                minWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </Typography.Text>
          </Tooltip>

          {!!reference && (
            <Tag
              bordered={false}
              style={{
                background: REGISTER_COLORS.mainSoft,
                borderRadius: 4,
                color: REGISTER_COLORS.main,
                flex: 'none',
                fontSize: EVIDENCE_SIZES.packColumnFontSize,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {reference}
            </Tag>
          )}
        </Flex>

        {file.uploadedByName && (
          <Tooltip title={file.uploadedByName}>
            <Typography.Text
              ellipsis
              style={{
                color: REGISTER_COLORS.textMuted,
                display: 'block',
                fontSize: EVIDENCE_SIZES.packColumnFontSize,
                maxWidth: '100%',
                minWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {file.uploadedByName}
            </Typography.Text>
          </Tooltip>
        )}
      </Flex>

      <div>
        <Tag
          style={{
            background: tone.background,
            border: 'none',
            borderRadius: 4,
            color: tone.color,
            fontSize: EVIDENCE_SIZES.packColumnFontSize,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {file.kind}
        </Tag>
      </div>

      <Tooltip title={formatThreadTimestamp(file.uploadedAt)}>
        <Typography.Text ellipsis style={META_STYLE}>
          {formatThreadTimestamp(file.uploadedAt)}
        </Typography.Text>
      </Tooltip>

      <Tooltip title={formatFileSize(file.sizeBytes)}>
        <Typography.Text ellipsis style={META_STYLE}>
          {formatFileSize(file.sizeBytes)}
        </Typography.Text>
      </Tooltip>

      <Tooltip title={downloadLabel}>
        <Button
          type="text"
          aria-label={`${downloadLabel} ${file.name}`}
          icon={<DownloadOutlined />}
          onClick={() => onDownload?.(file)}
          style={{
            background: isHovered ? REGISTER_COLORS.mainSoft : 'transparent',
            color: REGISTER_COLORS.main,
            flex: 'none',
            fontSize: EVIDENCE_SIZES.packDownloadFontSize,
            height: EVIDENCE_SIZES.packDownloadButton,
            width: EVIDENCE_SIZES.packDownloadButton,
          }}
        />
      </Tooltip>
    </Flex>
  );
};

export default CompensationEventEvidenceRow;
