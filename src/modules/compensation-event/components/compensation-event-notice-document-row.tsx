import { DeleteOutlined, EyeOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, Flex, Space, Typography, Upload } from 'antd';
import { COMPENSATION_EVENT_NOTICE_COPY } from '../constants/compensation-event-notice.constants';
import { NOTICE_COLORS } from '../constants/compensation-event-notice.theme';

const { upload } = COMPENSATION_EVENT_NOTICE_COPY;

interface CompensationEventNoticeDocumentRowProps {
  file: UploadFile;
  onView: (file: UploadFile) => void;
  onReplace: (file: UploadFile, replacement: File) => void;
  onRemove: (file: UploadFile) => void;
}

const CompensationEventNoticeDocumentRow = ({
  file,
  onView,
  onReplace,
  onRemove,
}: CompensationEventNoticeDocumentRowProps) => (
  <Flex
    align="center"
    gap={8}
    style={{
      border: `1px solid ${NOTICE_COLORS.border}`,
      borderRadius: 8,
      padding: 8,
    }}
  >
    <FileOutlined style={{ color: NOTICE_COLORS.main, fontSize: 26 }} />

    <Typography.Text ellipsis style={{ flex: 1, minWidth: 0, color: NOTICE_COLORS.fileName }}>
      {file.name}
    </Typography.Text>

    <Space size={8}>
      <Button size="small" icon={<EyeOutlined />} onClick={() => onView(file)}>
        {upload.view}
      </Button>
      <Upload
        showUploadList={false}
        beforeUpload={(replacement) => {
          onReplace(file, replacement);
          return false;
        }}
      >
        <Button size="small" icon={<UploadOutlined />}>
          {upload.replace}
        </Button>
      </Upload>
      <Button
        size="small"
        icon={<DeleteOutlined />}
        aria-label={upload.remove}
        onClick={() => onRemove(file)}
      />
    </Space>
  </Flex>
);

export default CompensationEventNoticeDocumentRow;
