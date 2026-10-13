'use client';

import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, Card, Flex, Typography, Upload } from 'antd';
import {
  isAllowedUploadFile,
  UPLOAD_ACCEPT,
  UPLOAD_SUPPORTED_HINT,
} from '@/lib/utils/upload-file-rules';
import IconChip from './icon-chip';

/** Dedupe key for a picked file — lets re-adding the same file twice no-op. */
const fileKey = (file: File) => `${file.name}|${file.size}|${file.lastModified}`;

const uploadFiles = (fileList: UploadFile[]): File[] =>
  fileList
    .map((entry) => entry.originFileObj as File | undefined)
    .filter((file): file is File => Boolean(file && isAllowedUploadFile(file)));

export interface DocumentsUploadCardProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  title?: string;
  uploadLabel?: string;
  viewLabel?: string;
  replaceLabel?: string;
  noDocumentsLabel?: string;
}

// "Upload Documents" card — files live outside the antd Form (multipart parts, not fields).
// Shared by the Early Warning and PMI create screens; picks are restricted to documents
// and images with a 50MB per-file cap.
const DocumentsUploadCard = ({
  files,
  onFilesChange,
  title = 'Upload Documents',
  uploadLabel = 'Upload',
  viewLabel = 'View',
  replaceLabel = 'Replace',
  noDocumentsLabel = 'No documents uploaded yet.',
}: DocumentsUploadCardProps) => {
  const addFiles = (picked: File[]) => {
    if (!picked.length) return;
    const seen = new Set(files.map(fileKey));
    const additions = picked.filter((file) => !seen.has(fileKey(file)));
    if (additions.length > 0) onFilesChange([...files, ...additions]);
  };

  const removeFile = (index: number) => onFilesChange(files.filter((_, i) => i !== index));

  const replaceFile = (index: number, replacement?: File) => {
    if (!replacement) return;
    onFilesChange(files.map((file, i) => (i === index ? replacement : file)));
  };

  const viewFile = (file: File) => window.open(URL.createObjectURL(file), '_blank');

  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          <IconChip icon={<UploadOutlined />} />
          {title}
        </Flex>
      }
      extra={
        <Upload
          multiple
          accept={UPLOAD_ACCEPT}
          showUploadList={false}
          // Held at an empty controlled list on purpose. Left uncontrolled, antd keeps every
          // pick in its own internal list and reports the whole of it on each `onChange`, so
          // a file deleted here would still ride the next pick's payload back in — the
          // component below owns the list, and antd should hold none.
          fileList={[]}
          beforeUpload={(file) => (isAllowedUploadFile(file) ? false : Upload.LIST_IGNORE)}
          onChange={({ fileList }) => addFiles(uploadFiles(fileList))}
        >
          <Button type="primary" icon={<UploadOutlined />}>
            {uploadLabel}
          </Button>
        </Upload>
      }
    >
      <Flex vertical gap={8}>
        {files.length === 0 && (
          <Flex vertical gap={2}>
            <Typography.Text type="secondary">{noDocumentsLabel}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {UPLOAD_SUPPORTED_HINT}
            </Typography.Text>
          </Flex>
        )}
        {files.map((file, index) => (
          <Card key={fileKey(file)}>
            <Flex align="center" justify="space-between" gap={12}>
              <Flex align="center" gap={8}>
                <IconChip icon={<FileTextOutlined />} size={28} />
                <Typography.Text ellipsis>{file.name}</Typography.Text>
              </Flex>
              <Flex gap={8}>
                <Button size="small" icon={<EyeOutlined />} onClick={() => viewFile(file)}>
                  {viewLabel}
                </Button>
                <Upload
                  maxCount={1}
                  accept={UPLOAD_ACCEPT}
                  showUploadList={false}
                  // Same rule as the trigger above — the row owns its file, antd keeps none.
                  fileList={[]}
                  beforeUpload={(f) => (isAllowedUploadFile(f) ? false : Upload.LIST_IGNORE)}
                  onChange={({ fileList }) => replaceFile(index, uploadFiles(fileList)[0])}
                >
                  <Button size="small" icon={<DownloadOutlined />}>
                    {replaceLabel}
                  </Button>
                </Upload>
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeFile(index)}
                />
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Card>
  );
};

export default DocumentsUploadCard;
