'use client';

import { DeleteOutlined, EyeOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Flex, message, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { isAllowedUploadFile, UPLOAD_ACCEPT } from '@/lib/utils/upload-file-rules';

interface EwActionDocumentsUploadProps {
  fileList: UploadFile[];
  onFileListChange: (files: UploadFile[]) => void;
}

// Picks go through the shared attachment rules, so a meeting attachment is held to the
// same formats and size cap as every other upload in the product.
const beforeUpload: UploadProps['beforeUpload'] = (file) =>
  isAllowedUploadFile(file) ? false : Upload.LIST_IGNORE;

/** Open a local file in a new browser tab (blob URL, released after the tab loads). */
const openFileInNewTab = (file: UploadFile) => {
  if (file.originFileObj) {
    const url = URL.createObjectURL(file.originFileObj);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } else if (file.url) {
    window.open(file.url, '_blank', 'noopener,noreferrer');
  } else {
    message.info('This file cannot be previewed.');
  }
};

export const EwActionDocumentsUpload = ({
  fileList,
  onFileListChange,
}: EwActionDocumentsUploadProps) => {
  return (
    <div
      style={{
        border: '1px solid #EAECF0',
        borderRadius: 0,
        padding: '16px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Flex align="center" gap={12}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 0,
              border: '1px solid #D0D5DD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
            }}
          >
            <UploadOutlined style={{ fontSize: 16, color: '#1B3A5F' }} />
          </div>
          <Flex vertical gap={2}>
            <Typography.Text strong style={{ fontSize: 14, color: '#101828' }}>
              Upload Documents
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              PDF, Word, Excel, PPT, text &amp; images only
            </Typography.Text>
          </Flex>
        </Flex>

        <Upload
          fileList={fileList}
          accept={UPLOAD_ACCEPT}
          beforeUpload={beforeUpload}
          onChange={({ fileList: fl }) => onFileListChange(fl)}
          showUploadList={false}
        >
          <Button type="primary" icon={<UploadOutlined />}>
            Upload
          </Button>
        </Upload>
      </Flex>

      {fileList.length > 0 && (
        <Flex vertical gap={8} style={{ marginTop: 12 }}>
          {fileList.map((file) => (
            <div
              key={file.uid}
              style={{
                border: '1px solid #EAECF0',
                borderRadius: 0,
                padding: '10px 14px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                <FileTextOutlined style={{ fontSize: 18, color: '#101828', flexShrink: 0 }} />
                <Typography.Text ellipsis style={{ fontSize: 13, color: '#101828' }}>
                  {file.name}
                </Typography.Text>
              </Flex>

              <Flex align="center" gap={8}>
                <Button size="small" icon={<EyeOutlined />} onClick={() => openFileInNewTab(file)}>
                  View
                </Button>
                <Upload
                  accept={UPLOAD_ACCEPT}
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                  onChange={({ file: newFile }) => {
                    onFileListChange(fileList.map((f) => (f.uid === file.uid ? newFile : f)));
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    Replace
                  </Button>
                </Upload>
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onFileListChange(fileList.filter((f) => f.uid !== file.uid))}
                />
              </Flex>
            </div>
          ))}
        </Flex>
      )}
    </div>
  );
};

export default EwActionDocumentsUpload;
