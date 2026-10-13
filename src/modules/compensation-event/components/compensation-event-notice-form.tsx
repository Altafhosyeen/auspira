import type { FormInstance, UploadFile, UploadProps } from 'antd';
import { Flex, Form } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import type { CompensationEventNoticeFormValues } from '../types/compensation-event-notice.types';
import type { EventClauseOption } from '../types/event-clause.types';
import CompensationEventNoticeBasicDetails from './compensation-event-notice-basic-details';
import CompensationEventNoticeEventInformation from './compensation-event-notice-event-information';
import CompensationEventNoticeEvidenceUpload from './compensation-event-notice-evidence-upload';

interface CompensationEventNoticeFormProps {
  form: FormInstance<CompensationEventNoticeFormValues>;
  recipientOptions?: DefaultOptionType[];
  recipientsLoading?: boolean;
  noRecipientsHint?: string;
  clauseOptions?: EventClauseOption[];
  clausesLoading?: boolean;
  fileList: UploadFile[];
  onFileListChange: UploadProps['onChange'];
  onViewFile: (file: UploadFile) => void;
  onReplaceFile: (file: UploadFile, replacement: File) => void;
  onRemoveFile: (file: UploadFile) => void;
  onFinish: (values: CompensationEventNoticeFormValues) => void;
}

const CompensationEventNoticeForm = ({
  form,
  recipientOptions,
  recipientsLoading,
  noRecipientsHint,
  clauseOptions,
  clausesLoading,
  fileList,
  onFileListChange,
  onViewFile,
  onReplaceFile,
  onRemoveFile,
  onFinish,
}: CompensationEventNoticeFormProps) => (
  // The design shows no required markers; validation messages still surface on submit.
  <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
    <Flex vertical gap={24}>
      <CompensationEventNoticeBasicDetails
        recipientOptions={recipientOptions}
        recipientsLoading={recipientsLoading}
        noRecipientsHint={noRecipientsHint}
      />
      <CompensationEventNoticeEventInformation
        clauseOptions={clauseOptions}
        clausesLoading={clausesLoading}
      />
      <CompensationEventNoticeEvidenceUpload
        fileList={fileList}
        onChange={onFileListChange}
        onView={onViewFile}
        onReplace={onReplaceFile}
        onRemove={onRemoveFile}
      />
    </Flex>
  </Form>
);

export default CompensationEventNoticeForm;
