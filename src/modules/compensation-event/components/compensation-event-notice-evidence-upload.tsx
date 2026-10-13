import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Flex, Typography, Upload } from 'antd';
import { COMPENSATION_EVENT_NOTICE_COPY } from '../constants/compensation-event-notice.constants';
import CompensationEventNoticeDocumentRow from './compensation-event-notice-document-row';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { sections, upload } = COMPENSATION_EVENT_NOTICE_COPY;

interface CompensationEventNoticeEvidenceUploadProps {
  fileList: UploadFile[];
  onChange: UploadProps['onChange'];
  onView: (file: UploadFile) => void;
  onReplace: (file: UploadFile, replacement: File) => void;
  onRemove: (file: UploadFile) => void;
}

// The trigger sits in the card header and the rows are drawn by hand, so antd's own
// list is switched off rather than restyled.
const CompensationEventNoticeEvidenceUpload = ({
  fileList,
  onChange,
  onView,
  onReplace,
  onRemove,
}: CompensationEventNoticeEvidenceUploadProps) => (
  <CompensationEventNoticeSectionCard
    icon={<UploadOutlined />}
    title={sections.uploadDocuments}
    gap={16}
    extra={
      <Upload
        multiple
        showUploadList={false}
        fileList={fileList}
        onChange={onChange}
        beforeUpload={() => false}
      >
        <Button type="primary" icon={<UploadOutlined />}>
          {upload.button}
        </Button>
      </Upload>
    }
  >
    {fileList.length ? (
      <Flex vertical gap={8}>
        {fileList.map((file) => (
          <CompensationEventNoticeDocumentRow
            key={file.uid}
            file={file}
            onView={onView}
            onReplace={onReplace}
            onRemove={onRemove}
          />
        ))}
      </Flex>
    ) : (
      <Typography.Text type="secondary">{upload.empty}</Typography.Text>
    )}
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventNoticeEvidenceUpload;
