import { DeleteOutlined, EyeOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, Flex, Space, Typography, Upload } from 'antd';
import { isAllowedUploadFile, UPLOAD_ACCEPT } from '@/lib/utils/upload-file-rules';

export interface UploadDocumentRowProps {
  file: UploadFile;
  onView: (file: UploadFile) => void;
  onReplace: (file: UploadFile, replacement: File) => void;
  onRemove: (file: UploadFile) => void;
}

// One row in an UploadDocumentsCard list: filename plus View / Replace / Delete actions.
const UploadDocumentRow = ({ file, onView, onReplace, onRemove }: UploadDocumentRowProps) => (
  <Flex
    align="center"
    gap={8}
    style={{
      border: '1px solid #E0E3E8',
      borderRadius: 8,
      padding: 8,
    }}
  >
    <FileOutlined style={{ color: '#00355F', fontSize: 26 }} />

    <Typography.Text ellipsis style={{ flex: 1, minWidth: 0, color: '#1F2937' }}>
      {file.name}
    </Typography.Text>

    <Space size={8}>
      <Button size="small" icon={<EyeOutlined />} onClick={() => onView(file)}>
        View
      </Button>
      <Upload
        showUploadList={false}
        accept={UPLOAD_ACCEPT}
        // Replace is its own picker, so it has to enforce the same rules as the card's
        // own Upload — otherwise an allowed file could be swapped for anything at all.
        beforeUpload={(replacement) => {
          if (!isAllowedUploadFile(replacement)) return Upload.LIST_IGNORE;
          onReplace(file, replacement);
          return false;
        }}
      >
        <Button size="small" icon={<UploadOutlined />}>
          Replace
        </Button>
      </Upload>
      <Button
        size="small"
        icon={<DeleteOutlined />}
        aria-label="Remove"
        onClick={() => onRemove(file)}
      />
    </Space>
  </Flex>
);

export default UploadDocumentRow;
