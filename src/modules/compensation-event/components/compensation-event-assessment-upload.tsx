import { DeleteOutlined, FileTextOutlined, InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Flex, notification, Typography, Upload } from 'antd';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';
import { QUOTATION_COLORS } from '../constants/compensation-event-quotation.theme';
import CompensationEventNoticeSectionCard from './compensation-event-notice-section-card';

const { lines, upload: copy } = PM_ASSESSMENT_COPY;

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
const ACCEPTED_FILE_TYPES = ALLOWED_EXTENSIONS.join(',');
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const validateFile = (file: File): boolean => {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    notification.error({
      message: `"${file.name}" has an unsupported format. Only PDF, Word and Excel documents are allowed.`,
    });
    return false;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    notification.error({ message: `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.` });
    return false;
  }
  return true;
};

interface CompensationEventAssessmentUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

// Stands in for the line-item form when the PM picks "Quotation Upload" — a single file,
// sent as `QuotationFile` alongside `IsFile: true`, which is what the backend prices the
// assessment off under this method.
const CompensationEventAssessmentUpload = ({
  file,
  onFileChange,
}: CompensationEventAssessmentUploadProps) => (
  <CompensationEventNoticeSectionCard icon={<InboxOutlined />} title={lines.title} gap={16}>
    {file ? (
      <Flex
        align="center"
        gap={12}
        style={{
          border: `1px solid ${QUOTATION_COLORS.groupBoxBorder}`,
          borderRadius: 8,
          padding: 12,
        }}
      >
        <FileTextOutlined style={{ color: QUOTATION_COLORS.main, fontSize: 24 }} />
        <Typography.Text ellipsis style={{ flex: 1, minWidth: 0 }}>
          {file.name}
        </Typography.Text>
        <Upload
          accept={ACCEPTED_FILE_TYPES}
          showUploadList={false}
          maxCount={1}
          beforeUpload={(picked) => {
            if (validateFile(picked)) onFileChange(picked);
            return false;
          }}
        >
          <Button size="small">{copy.replace}</Button>
        </Upload>
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          aria-label={copy.remove}
          onClick={() => onFileChange(null)}
        />
      </Flex>
    ) : (
      <Upload.Dragger
        multiple={false}
        showUploadList={false}
        accept={ACCEPTED_FILE_TYPES}
        beforeUpload={(picked) => {
          if (validateFile(picked)) onFileChange(picked);
          return false;
        }}
        style={{ background: QUOTATION_COLORS.mainSoft, borderColor: QUOTATION_COLORS.mainBorder }}
      >
        <Flex vertical align="center" gap={4} style={{ padding: '16px 0' }}>
          <UploadOutlined style={{ color: QUOTATION_COLORS.main, fontSize: 32 }} />
          <Typography.Text strong>{copy.title}</Typography.Text>
          <Typography.Text type="secondary">{copy.subtitle}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {copy.hint}
          </Typography.Text>
        </Flex>
      </Upload.Dragger>
    )}
  </CompensationEventNoticeSectionCard>
);

export default CompensationEventAssessmentUpload;
