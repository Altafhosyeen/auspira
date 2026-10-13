'use client';

import { Flex, Form, notification } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { useMemo, useState } from 'react';
import DocumentsUploadCard from '@/components/shared/documents-upload-card';
import { useRecipientOptions } from '@/components/shared/RecipientSelect';
import { MENU_PATH } from '@/constants/routes.constants';
import { useProjectStore } from '@/store/project.store';
import { PMI_FORM_COPY } from '../constants/pmi-form.constants';
import { usePmiCrossReferenceOrigin } from '../hooks/use-pmi-cross-reference-origin';
import { useCreatePmi } from '../hooks/use-pmis';
import { type CreatePmiFormValues, PmiType } from '../types/pmi.types';
import { toRegisterPmiRequest } from '../utils/pmi-form.utils';
import PmiBasicDetailsSection from './pmi-basic-details-section';
import PmiCrossReferenceOriginCard from './pmi-cross-reference-origin-card';
import PmiCrossReferenceOriginTag from './pmi-cross-reference-origin-tag';
import PmiFormActions from './pmi-form-actions';
import PmiFormHeader from './pmi-form-header';
import PmiInformationSection from './pmi-information-section';
import PmiThemeProvider from './pmi-theme-provider';

const copy = PMI_FORM_COPY;

// Container — owns the form instance, attachments, preview and submit state; delegates
// rendering to the presentational section components.
const PmiCreatePage = () => {
  const router = useRouter();
  const [form] = Form.useForm<CreatePmiFormValues>();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  // Set when the register was opened from the cross-reference drawer — stated by the
  // card below and carried into the POST so the backend can link the two records.
  const crossReference = usePmiCrossReferenceOrigin();

  // Contact persons for the selected project — the To / CC / BCC suggestion lists.
  const {
    options: recipientOptions,
    isLoading: recipientsLoading,
    noRecipientsHint,
  } = useRecipientOptions(selectedProjectId ?? undefined);

  const createPmi = useCreatePmi();

  // The scope/key-date instruction notifies a compensation event; every other type
  // just notifies. Only the button label changes — the POST is identical.
  const pmiType = Form.useWatch('pmiType', form);
  const submitLabel = useMemo(
    () => (pmiType === PmiType.ChangeScopeOrKeyDate ? copy.notifyCompensationEvent : copy.notify),
    [pmiType]
  );

  const handleSubmit = () => form.submit();
  const pmiTitle = Form.useWatch('title', form);

  const handleFinish = async (values: CreatePmiFormValues) => {
    if (!selectedProjectId) {
      notification.error({ message: 'Select a project before submitting the instruction.' });
      return;
    }

    setSubmitting(true);
    try {
      await createPmi.mutateAsync(
        toRegisterPmiRequest(values, {
          projectId: selectedProjectId,
          attachments: files,
          crossReference: crossReference ?? undefined,
        })
      );

      notification.success({ message: copy.submitted });
      form.resetFields();
      setFiles([]);
      router.push(MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.pathname);
    } catch {
      notification.error({ message: copy.submitFailed });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PmiThemeProvider>
      <Flex vertical gap={24}>
        <PmiFormHeader
          // The heading stays constant whatever the instruction was raised from — the
          // data point is named by the card below, so it is not repeated here.
          actions={crossReference ? <PmiCrossReferenceOriginTag origin={crossReference} /> : null}
        />

        {/* Restates the data point and the value just agreed in the drawer — absent for a
            PMI raised directly from the register, which has no origin to state. */}
        {crossReference && <PmiCrossReferenceOriginCard origin={crossReference} />}

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
          <Flex vertical gap={20}>
            <PmiBasicDetailsSection
              recipientOptions={recipientOptions}
              recipientsLoading={recipientsLoading}
              noRecipientsHint={noRecipientsHint}
            />
            <PmiInformationSection />
            <DocumentsUploadCard title={copy.uploadTitle} files={files} onFilesChange={setFiles} />
            <PmiFormActions
              submitting={submitting}
              label={submitLabel}
              onSubmit={handleSubmit}
              onValidate={() => form.validateFields()}
              confirmDescription={pmiTitle}
            />
          </Flex>
        </Form>
      </Flex>
    </PmiThemeProvider>
  );
};

export default PmiCreatePage;
