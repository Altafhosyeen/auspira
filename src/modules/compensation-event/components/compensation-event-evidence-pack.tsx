'use client';

import { DownOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Flex, Skeleton, Typography } from 'antd';
import { Fragment, useMemo, useState } from 'react';
import {
  COMPENSATION_EVENT_EVIDENCE_COPY,
  EVIDENCE_LIST_PAGE_SIZE,
} from '../constants/compensation-event-evidence.constants';
import {
  EVIDENCE_COLORS,
  EVIDENCE_PACK_GRID_COLUMNS,
  EVIDENCE_SIZES,
} from '../constants/compensation-event-evidence.theme';
import { REGISTER_COLORS } from '../constants/compensation-event-register.theme';
import type {
  CompensationEventEvidenceFile,
  CompensationEventEvidenceKind,
} from '../types/compensation-event.types';
import CompensationEventDetailPanel from './compensation-event-detail-panel';
import CompensationEventEvidenceRow from './compensation-event-evidence-row';
import CompensationEventListToolbar from './compensation-event-list-toolbar';

const {
  packTitle,
  noEvidence,
  noSearchResults,
  searchPlaceholder,
  loadMore,
  documentsUnit,
  columnName,
  columnType,
  columnUploaded,
  columnSize,
} = COMPENSATION_EVENT_EVIDENCE_COPY;

const COLUMN_LABEL_STYLE = {
  color: EVIDENCE_COLORS.columnLabel,
  fontSize: EVIDENCE_SIZES.packColumnFontSize,
  fontWeight: 600,
  letterSpacing: 0.4,
  // The label sits in a fixed track and must never stretch it, or it would push the
  // columns out of line with the values below.
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
} as const;

// The search matches on everything the row shows as text — file name, type, and the
// reference tag where the list carries one.
const matchesTerm = (file: CompensationEventEvidenceFile, needle: string, reference?: string) =>
  file.name.toLowerCase().includes(needle) ||
  file.kind.toLowerCase().includes(needle) ||
  !!reference?.toLowerCase().includes(needle);

interface CompensationEventEvidencePackProps {
  files: CompensationEventEvidenceFile[];
  loading?: boolean;
  // Supplied where the owner searches through the endpoint (the CE Documents tab): the
  // term is then controlled from there and the rows arrive already narrowed. Left out,
  // the pack keeps its own term and matches locally, for the lists with no search endpoint.
  term?: string;
  onTermChange?: (term: string) => void;
  /** Overridden where the same list is shown outside the Documents tab. */
  title?: string;
  // Tagged on every row beside the file name; omitted where the list is already scoped
  // to one record on screen.
  reference?: string;
  // The attachments modal shows a short, already-scoped list, so it opts out of the search
  // affordance the Documents tab needs.
  searchable?: boolean;
  onDownload?: (file: CompensationEventEvidenceFile) => void;
}

// Presentational — the Documents tab: a searchable, labelled column header over one
// row per attachment, paged with Load More.
const CompensationEventEvidencePack = ({
  files,
  loading = false,
  title = packTitle,
  reference,
  searchable = true,
  term: controlledTerm,
  onTermChange,
  onDownload,
}: CompensationEventEvidencePackProps) => {
  const [visibleCount, setVisibleCount] = useState(EVIDENCE_LIST_PAGE_SIZE);
  const [localTerm, setLocalTerm] = useState('');
  const [kinds, setKinds] = useState<CompensationEventEvidenceKind[]>([]);

  // Controlled once the owner passes a term — the rows are then the endpoint's answer
  // and must not be filtered again here.
  const isControlled = controlledTerm !== undefined;
  const searchTerm = isControlled ? controlledTerm : localTerm;

  // Only the file types actually present are offered, so the dropdown never lists a
  // filter that would empty the list.
  const kindOptions = useMemo(
    () =>
      Array.from(new Set(files.map((file) => file.kind))).map((kind) => ({
        value: kind,
        label: kind,
      })),
    [files]
  );

  const needle = searchTerm.trim().toLowerCase();
  const matchedFiles = files.filter(
    (file) =>
      (isControlled || !needle || matchesTerm(file, needle, reference)) &&
      (kinds.length === 0 || kinds.includes(file.kind))
  );
  const visibleFiles = matchedFiles.slice(0, visibleCount);
  const hasMore = visibleCount < matchedFiles.length;

  // A new term re-pages from the top, so the count under the list always matches.
  const handleSearch = (value: string) => {
    if (isControlled) onTermChange?.(value);
    else setLocalTerm(value);
    setVisibleCount(EVIDENCE_LIST_PAGE_SIZE);
  };

  const handleKinds = (next: CompensationEventEvidenceKind[]) => {
    setKinds(next);
    setVisibleCount(EVIDENCE_LIST_PAGE_SIZE);
  };

  const clearAll = () => {
    if (isControlled) onTermChange?.('');
    else setLocalTerm('');
    setKinds([]);
    setVisibleCount(EVIDENCE_LIST_PAGE_SIZE);
  };

  return (
    <CompensationEventDetailPanel
      icon={<LinkOutlined />}
      title={title}
      padding={EVIDENCE_SIZES.packPadding}
      bodyGap={EVIDENCE_SIZES.packBodyGap}
      headerExtra={
        searchable && (
          <CompensationEventListToolbar
            term={searchTerm}
            onTermChange={handleSearch}
            searchPlaceholder={searchPlaceholder}
            filterOptions={kindOptions}
            selected={kinds}
            onSelectedChange={handleKinds}
            onClearAll={clearAll}
            searchWidth={EVIDENCE_SIZES.toolbarSearchWidth}
          />
        )
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : matchedFiles.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          // Searching server-side, an empty response means nothing matched — `files` is
          // empty then too, so the term decides the copy rather than the row count.
          description={needle || kinds.length ? noSearchResults : noEvidence}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Flex
            vertical
            gap={EVIDENCE_SIZES.packRowGap}
            style={{ minWidth: EVIDENCE_SIZES.packGridMinWidth }}
          >
            <Flex
              align="center"
              style={{
                background: REGISTER_COLORS.mainSoft,
                borderRadius: 6,
                columnGap: EVIDENCE_SIZES.packColumnGap,
                display: 'grid',
                gridTemplateColumns: EVIDENCE_PACK_GRID_COLUMNS,
                marginBottom: EVIDENCE_SIZES.packRowPaddingBlock,
                paddingBlock: 12,
                paddingInline: EVIDENCE_SIZES.packRowPaddingInline,
              }}
            >
              <div />
              <Typography.Text style={COLUMN_LABEL_STYLE}>{columnName}</Typography.Text>
              <Typography.Text style={COLUMN_LABEL_STYLE}>{columnType}</Typography.Text>
              <Typography.Text style={COLUMN_LABEL_STYLE}>{columnUploaded}</Typography.Text>
              <Typography.Text style={COLUMN_LABEL_STYLE}>{columnSize}</Typography.Text>
            </Flex>

            {visibleFiles.map((file, index) => (
              <Fragment key={file.id}>
                {index > 0 && (
                  <Divider style={{ borderColor: EVIDENCE_COLORS.divider, margin: 0 }} />
                )}
                <CompensationEventEvidenceRow
                  file={file}
                  reference={reference}
                  onDownload={onDownload}
                />
              </Fragment>
            ))}

            <Flex align="center" justify="center" gap={16} wrap style={{ marginTop: 8 }}>
              <Typography.Text
                style={{ color: REGISTER_COLORS.textMuted, fontSize: EVIDENCE_SIZES.packFontSize }}
              >
                {`Showing 1 to ${visibleFiles.length} of ${matchedFiles.length} ${documentsUnit}`}
              </Typography.Text>

              {hasMore && (
                <Button
                  type="primary"
                  icon={<DownOutlined />}
                  iconPosition="end"
                  size="small"
                  onClick={() =>
                    setVisibleCount((current) =>
                      Math.min(current + EVIDENCE_LIST_PAGE_SIZE, matchedFiles.length)
                    )
                  }
                >
                  {loadMore}
                </Button>
              )}
            </Flex>
          </Flex>
        </div>
      )}
    </CompensationEventDetailPanel>
  );
};

export default CompensationEventEvidencePack;
