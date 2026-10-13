'use client';

import type { UploadFile, UploadProps } from 'antd';
import { ConfigProvider, Flex, Form, notification } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import UploadDocumentsCard from '@/components/shared/upload-documents-card';
import { MENU_PATH } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { REQUEST_FOR_INFORMATION_FORM_COPY } from '../constants/request-for-information.constants';
import { FORM_THEME } from '../constants/request-for-information-form.theme';
import type { RequestForInformationFormValues } from '../types/request-for-information.types';
import RequestForInformationBasicDetailsSection from './request-for-information-basic-details-section';
import RequestForInformationFormActions from './request-for-information-form-actions';
import RequestForInformationFormBanner from './request-for-information-form-banner';
import RequestForInformationFormHeader from './request-for-information-form-header';
import RequestForInformationQuerySection from './request-for-information-query-section';
import RequestForInformationRequestDetailsSection from './request-for-information-request-details-section';

const copy = REQUEST_FOR_INFORMATION_FORM_COPY;

// The backend RFI create endpoint is not live yet — submitting is mocked locally so the
// screen matches the Figma design and stays navigable during development.
const RequestForInformationFormPage = () => {
  const router = useRouter();
  const [form] = Form.useForm<RequestForInformationFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([
    { uid: 'mock-1', name: 'Form of Agreement (executed)', status: 'done' },
    { uid: 'mock-2', name: 'Contract Data Part 1 (Employer)', status: 'done' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const currentUserEmail = useAuthStore((state) => state.user?.email);
  // Project contact persons — the To / From / CC / BCC suggestion list, same source the
  // Compensation Event notice form uses.
  const {
    options: recipientOptions,
    isLoading: recipientsLoading,
    noRecipientsHint,
  } = useRecipientOptions(selectedProjectId ?? undefined);

  useEffect(() => {
    if (currentUserEmail) form.setFieldValue('from', currentUserEmail);
  }, [currentUserEmail, form]);

  const handleFileListChange: UploadProps['onChange'] = ({ fileList: nextFileList }) => {
    setFileList(nextFileList);
  };

  const handleViewFile = (file: UploadFile) => {
    const source = file.originFileObj ?? file.url;
    if (!source) return;

    const objectUrl = typeof source === 'string' ? source : URL.createObjectURL(source);
    window.open(objectUrl, '_blank', 'noopener');
  };

  const handleReplaceFile = (target: UploadFile, replacement: File) => {
    setFileList((current) =>
      current.map((file) =>
        file.uid === target.uid
          ? {
              ...file,
              name: replacement.name,
              originFileObj: Object.assign(replacement, {
                uid: file.uid,
              }) as UploadFile['originFileObj'],
            }
          : file
      )
    );
  };

  const handleRemoveFile = (target: UploadFile) => {
    setFileList((current) => current.filter((file) => file.uid !== target.uid));
  };

  const handleSubmit = () => form.submit();
  const rfiSubject = Form.useWatch('rfiSubject', form);

  const handleFinish = async (_values: RequestForInformationFormValues) => {
    setSubmitting(true);
    try {
      // No live create endpoint yet — the register already shows mock rows, so submitting
      // here just confirms the flow and returns the user to it.
      await new Promise((resolve) => setTimeout(resolve, 400));
      notification.success({ message: copy.submitted });
      router.push(MENU_PATH.OCA_REQUEST_FOR_INFORMATION.pathname);
    } catch {
      notification.error({ message: copy.submitFailed });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider theme={FORM_THEME}>
      <Flex vertical gap={20}>
        <RequestForInformationFormHeader />
        <RequestForInformationFormBanner />

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
          {/* No email thread or attachments exist yet for a record being created, so the
              Documents & Communication sidebar is dropped and the form takes the full width. */}
          <Flex vertical gap={20}>
            <RequestForInformationBasicDetailsSection
              recipientOptions={recipientOptions}
              recipientsLoading={recipientsLoading}
              noRecipientsHint={noRecipientsHint}
            />
            <RequestForInformationRequestDetailsSection />
            <RequestForInformationQuerySection />
            <UploadDocumentsCard
              fileList={fileList}
              onChange={handleFileListChange}
              onView={handleViewFile}
              onReplace={handleReplaceFile}
              onRemove={handleRemoveFile}
            />
            <RequestForInformationFormActions
              submitting={submitting}
              onSubmit={handleSubmit}
              onValidate={() => form.validateFields()}
              confirmDescription={rfiSubject}
            />
          </Flex>
        </Form>
      </Flex>
    </ConfigProvider>
  );
};

export default RequestForInformationFormPage;
