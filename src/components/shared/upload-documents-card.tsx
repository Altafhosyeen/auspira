import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Card, Flex, Typography, Upload } from 'antd';
import {
  isAllowedUploadFile,
  UPLOAD_ACCEPT,
  UPLOAD_SUPPORTED_HINT,
} from '@/lib/utils/upload-file-rules';
import UploadDocumentRow from './upload-document-row';

export interface UploadDocumentsCardProps {
  title?: string;
  fileList: UploadFile[];
  onChange: UploadProps['onChange'];
  onView: (file: UploadFile) => void;
  onReplace: (file: UploadFile, replacement: File) => void;
  onRemove: (file: UploadFile) => void;
}

// Generic "Upload Documents" card: an Upload trigger in the header plus a list of
// attached files, each row offering View / Replace / Delete. The trigger and rows are
// drawn by hand, so antd's own upload list is switched off rather than restyled.
const UploadDocumentsCard = ({
  title = 'Upload Documents',
  fileList,
  onChange,
  onView,
  onReplace,
  onRemove,
}: UploadDocumentsCardProps) => (
  <Card styles={{ body: { padding: '24px 32px' } }}>
    <Flex vertical gap={16}>
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={10}>
          <FileTextOutlined style={{ color: '#00355F', fontSize: 16 }} />
          <Typography.Text strong style={{ color: '#00355F', fontSize: 16 }}>
            {title}
          </Typography.Text>
        </Flex>

        <Upload
          multiple
          accept={UPLOAD_ACCEPT}
          showUploadList={false}
          fileList={fileList}
          onChange={onChange}
          // `false` keeps antd from uploading the pick itself — the form sends the files as
          // multipart on submit. `LIST_IGNORE` drops a rejected pick so it never reaches
          // `onChange` and cannot appear as a row.
          beforeUpload={(file) => (isAllowedUploadFile(file) ? false : Upload.LIST_IGNORE)}
        >
          <Button type="primary" icon={<UploadOutlined />}>
            Upload
          </Button>
        </Upload>
      </Flex>

      {fileList.length ? (
        <Flex vertical gap={8}>
          {fileList.map((file) => (
            <UploadDocumentRow
              key={file.uid}
              file={file}
              onView={onView}
              onReplace={onReplace}
              onRemove={onRemove}
            />
          ))}
        </Flex>
      ) : (
        <Flex vertical gap={2}>
          <Typography.Text type="secondary">No documents uploaded yet.</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {UPLOAD_SUPPORTED_HINT}
          </Typography.Text>
        </Flex>
      )}
    </Flex>
  </Card>
);

export default UploadDocumentsCard;
