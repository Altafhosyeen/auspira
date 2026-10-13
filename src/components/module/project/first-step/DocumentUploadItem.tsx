/**
 * Document Upload Item
 * Clean row-style component matching the reference design:
 *   Not uploaded: file icon | label | Upload button
 *   Uploaded:     check icon | label + filename | Uploaded ✓ chip + View/Remove actions
 */

import {
  CheckCircleFilled,
  EyeOutlined,
  FileAddOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Badge, Button, Modal, notification, Popconfirm, Progress, Tooltip, Upload } from 'antd';
import type { RcFile, UploadChangeParam } from 'antd/es/upload';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import type React from 'react';
import { SEMANTIC_COLORS } from '@/constants/theme.constants';
import { progressVariants } from '@/lib/config/motion.config';
import { fileNameMatchesKeywords } from '@/lib/utils/document-upload';

export interface DocumentUploadItemProps {
  id: string | number;
  label: string;
  /** Short explanation shown in an info-icon tooltip next to the label */
  info?: string;
  required?: boolean;
  uploaded: boolean;
  loading?: boolean;
  removing?: boolean;
  progress?: number;
  disabled?: boolean;
  filename?: string;
  onChange: (file: RcFile) => Promise<void>;
  onView?: (id: string | number) => void;
  /** True once uploaded but jsonData hasn't been extracted yet — shows a disabled "awaiting extraction" View button instead of hiding it. */
  awaitingExtraction?: boolean;
  /** True once the document's JSON has been extracted — makes the View button a prominent green to signal the data is ready. */
  extracted?: boolean;
  onReplace?: (id: string | number) => void;
  /** True while AI extraction has been triggered but jsonData hasn't come back yet — disables Replace and Remove so neither can race the in-flight extraction. */
  extractionInProgress?: boolean;
  onRemove?: (id: string | number) => void;
  /** Number of supporting docs already uploaded for this document */
  supportingDocsCount?: number;
  /** Called when user clicks the supporting-docs icon button */
  onOpenSupportingDocs?: () => void;
  /** Lowercase keywords the uploaded file name should contain; upload is blocked with a warning if none match. */
  matchKeywords?: string[];
}

export const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({
  id,
  label,
  info,
  required = false,
  uploaded,
  loading = false,
  removing = false,
  progress = 0,
  disabled = false,
  filename = '',
  onChange,
  onView,
  awaitingExtraction = false,
  onReplace,
  extractionInProgress = false,
  extracted = false,
  onRemove,
  supportingDocsCount = 0,
  onOpenSupportingDocs,
  matchKeywords,
}) => {
  const infoIcon = info ? (
    <Tooltip title={info} placement="top">
      <Info className="h-3.5 w-3.5 shrink-0 cursor-help text-gray-400 transition-colors hover:text-blue-500" />
    </Tooltip>
  ) : null;

  const supportingBtn =
    onOpenSupportingDocs !== undefined ? (
      <Tooltip
        title={
          !uploaded
            ? 'Upload the main document first to add supporting files'
            : 'Supporting documents'
        }
      >
        <Badge
          count={supportingDocsCount}
          size="small"
          offset={[-2, 2]}
          style={{ backgroundColor: SEMANTIC_COLORS['main-p'] }}
        >
          <button
            type="button"
            disabled={!uploaded}
            onClick={onOpenSupportingDocs}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              !uploaded
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
                : 'border-blue-200 bg-blue-50 text-blue-500 hover:bg-blue-100'
            }`}
          >
            <FileAddOutlined className="text-theme-primary! ds-body!" />
          </button>
        </Badge>
      </Tooltip>
    ) : null;
  const handleUploadChange = async (info: UploadChangeParam) => {
    if (info.file) {
      await onChange(info.file as RcFile);
    }
  };

  const handleReplaceChange = async (info: UploadChangeParam) => {
    if (info.file) {
      onReplace?.(id);
      await onChange(info.file as RcFile);
    }
  };

  // Shared by the initial-upload and replace pickers so both reject the same file types /
  // filenames that don't look like the expected document.
  const validateUpload = (file: RcFile) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowed.includes(file.type)) {
      notification.error({
        message: 'Only PDF, Word (.doc/.docx), and Excel (.xls/.xlsx) files are allowed',
      });
      return Upload.LIST_IGNORE;
    }
    if (!fileNameMatchesKeywords(file.name, matchKeywords)) {
      Modal.error({
        title: `This file doesn't look like "${label}"`,
        content: `The file name should include "${label}". Please upload the correct document or rename the file to match.`,
        okText: 'Got it',
        okButtonProps: { type: 'primary' },
        centered: true,
      });
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  // ── Uploaded state ──────────────────────────────────────────────────────────
  if (uploaded && !loading) {
    return (
      <div className="group flex h-13 items-center justify-between rounded-lg border border-gray-200 bg-white px-3 transition-colors duration-150 hover:border-emerald-300 hover:bg-emerald-50/40">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-50">
            <CheckCircleFilled className="ds-body-large! text-emerald-500!" />
          </div>
          <div className="mt-2 flex min-w-0 items-center gap-3 leading-tight">
            <p className="ds-body! text-text my-0 flex shrink-0 items-center gap-1.5 font-semibold!">
              <span>
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
              </span>
              {infoIcon}
            </p>
            {filename && (
              <p className="ds-caption! my-0 min-w-0 flex-1 truncate text-gray-400">{filename}</p>
            )}
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-2">
          {supportingBtn}

          {onView &&
            (extracted ? (
              <Tooltip title="Extracted data ready — click to review">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onView(id)}
                    className="ds-caption! border-emerald-400! bg-emerald-50! font-semibold! text-emerald-600! shadow-sm ring-1 ring-emerald-200 transition-all hover:border-emerald-500! hover:bg-emerald-100! hover:text-emerald-700!"
                  >
                    View
                  </Button>
                </motion.div>
              </Tooltip>
            ) : (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onView(id)}
                className="ds-caption! border-gray-200! text-gray-500! hover:border-blue-300! hover:text-blue-500!"
              >
                View
              </Button>
            ))}

          {!onView && awaitingExtraction && (
            <Tooltip title="Awaiting AI extraction for this document">
              <Button
                size="small"
                disabled
                icon={<EyeOutlined />}
                className="ds-caption! border-gray-200! text-gray-400!"
              >
                View
              </Button>
            </Tooltip>
          )}

          {/* <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircleFilled className="text-[10px]! text-emerald-500!" />
            Uploaded
          </span> */}

          {onReplace && (
            <Tooltip
              title={
                extractionInProgress
                  ? 'AI extraction is in progress — please wait before replacing this document'
                  : 'Upload a new version'
              }
            >
              <Upload
                disabled={disabled || extractionInProgress}
                showUploadList={false}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                beforeUpload={validateUpload}
                onChange={handleReplaceChange}
              >
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                  disabled={disabled || extractionInProgress}
                  className={`ds-caption! border-gray-200! text-gray-500! ${
                    extractionInProgress
                      ? 'cursor-not-allowed! opacity-40!'
                      : 'hover:border-blue-300! hover:text-blue-500!'
                  }`}
                >
                  Replace
                </Button>
              </Upload>
            </Tooltip>
          )}

          {onRemove && (
            <Popconfirm
              title="Remove document"
              description="Are you sure you want to remove this document?"
              okText="Yes"
              cancelText="No"
              disabled={removing || extractionInProgress}
              onConfirm={() => onRemove(id)}
            >
              <Tooltip
                title={
                  extractionInProgress
                    ? 'AI extraction is in progress — please wait before removing this document'
                    : 'Remove'
                }
              >
                <Button
                  danger
                  type="text"
                  size="small"
                  icon={<X size={13} />}
                  loading={removing}
                  disabled={extractionInProgress}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      </div>
    );
  }

  // ── Upload / loading state ──────────────────────────────────────────────────
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 transition-all duration-150 hover:border-blue-200 hover:shadow-sm">
      {/* Fixed-height row — matches the uploaded state */}
      <div className="flex h-13 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50">
            <FileTextOutlined className="ds-body-large! text-blue-400!" />
          </div>
          <span className="ds-body! flex min-w-0 items-center gap-1.5 font-medium! text-gray-700">
            <span className="truncate">
              {label}
              {required && <span className="ml-0.5 text-red-500">*</span>}
            </span>
            {infoIcon}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {supportingBtn}

          <Tooltip title={loading ? 'Uploading — please wait.' : undefined}>
            <Upload
              disabled={disabled || loading}
              showUploadList={false}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              beforeUpload={validateUpload}
              onChange={handleUploadChange}
            >
              <Button
                icon={<UploadOutlined />}
                disabled={disabled || loading || removing}
                size="small"
                className="border-main-p! text-main-p! hover:bg-main-p/5! shrink-0 rounded!"
              >
                {loading ? 'Uploading…' : 'Upload'}
              </Button>
            </Upload>
          </Tooltip>
        </div>
      </div>

      {/* Progress bar expands below the fixed row when uploading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="flex items-center gap-2 pb-3"
            variants={progressVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Progress
              percent={progress}
              size="small"
              strokeColor={{ '0%': SEMANTIC_COLORS['main-p'], '100%': SEMANTIC_COLORS.success }}
              showInfo={false}
              className="flex-1"
            />
            <span className="ds-caption! font-semibold! text-gray-500">{progress}%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

DocumentUploadItem.displayName = 'DocumentUploadItem';
