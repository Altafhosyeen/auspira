'use client';

import { Flex, Form, notification } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import DocumentsUploadCard from '@/components/shared/documents-upload-card';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import { MENU_PATH } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { DEFECT_NOTICE_FORM_COPY } from '../constants/defect-notice.constants';
import { useCreateDefectNotice } from '../hooks/use-defect-notices';
import type { DefectNoticeFormValues } from '../types/defect-notice.types';
import DefectNoticeBasicDetailsSection from './defect-notice-basic-details-section';
import DefectNoticeFormActions from './defect-notice-form-actions';
import DefectNoticeFormBanner from './defect-notice-form-banner';
import DefectNoticeFormHeader from './defect-notice-form-header';
import DefectNoticeInformationSection from './defect-notice-information-section';
import DefectNoticeThemeProvider from './defect-notice-theme-provider';

const copy = DEFECT_NOTICE_FORM_COPY;

// Container — submits the form through POST /api/defect-notices, the same multipart
// shape the PMI register's create screen sends.
const DefectNoticeFormPage = () => {
  const router = useRouter();
  const [form] = Form.useForm<DefectNoticeFormValues>();
  // Attachments live outside the antd Form — they ride the request as multipart parts, not
  // as fields. Same `File[]` hand-off the PMI/Early Warning create screens use.
  const [files, setFiles] = useState<File[]>([]);
  const currentUserFullName = useAuthStore((state) => state.user?.fullName);

  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const {
    options: recipientOptions,
    isLoading: recipientsLoading,
    noRecipientsHint,
  } = useRecipientOptions(selectedProjectId ?? undefined);

  const createNotice = useCreateDefectNotice();

  const handleSubmit = () => form.submit();
  const defectTitle = Form.useWatch('defectTitle', form);

  const handleFinish = async (values: DefectNoticeFormValues) => {
    if (!selectedProjectId) {
      notification.error({ message: 'Select a project before raising the notice.' });
      return;
    }

    try {
      await createNotice.mutateAsync({
        values,
        context: {
          projectId: selectedProjectId,
          raisedByName: currentUserFullName,
          attachments: files,
        },
      });
      notification.success({ message: copy.submitted });
      router.push(MENU_PATH.CCA_DEFECT_NOTICES.pathname);
    } catch {
      // The global error handler surfaces the reason; keep the PM on their form.
      notification.error({ message: copy.submitFailed });
    }
  };

  return (
    <DefectNoticeThemeProvider>
      {/* Gap 24 between the title bar, the explainer strip and the form — the same rhythm
          the Create PMI screen runs on. */}
      <Flex vertical gap={24}>
        <DefectNoticeFormHeader />
        <DefectNoticeFormBanner />

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
          <Flex vertical gap={20}>
            <DefectNoticeBasicDetailsSection
              recipientOptions={recipientOptions}
              recipientsLoading={recipientsLoading}
              noRecipientsHint={noRecipientsHint}
            />
            <DefectNoticeInformationSection />
            <DocumentsUploadCard title={copy.uploadTitle} files={files} onFilesChange={setFiles} />
            <DefectNoticeFormActions
              submitting={createNotice.isPending}
              onSubmit={handleSubmit}
              onValidate={() => form.validateFields()}
              confirmDescription={defectTitle}
            />
          </Flex>
        </Form>
      </Flex>
    </DefectNoticeThemeProvider>
  );
};

export default DefectNoticeFormPage;
