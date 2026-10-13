'use client';

import { DatePicker, Form, Input, notification, Tag } from 'antd';
import type { Dayjs } from 'dayjs';
import { AlertTriangle } from 'lucide-react';
import React from 'react';
import ButtonX from '@/components/antd/ButtonX';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { RecipientSelect, useRecipientOptions } from '@/components/shared/RecipientSelect';
import { useCreateEarlyWarning } from '@/hooks/modules/early-warning';
import { useGetProjectById } from '@/hooks/modules/project';
import { useProjectStore } from '@/store/project.store';
import type { ProjectDetailSummary } from '@/types/project/selection.types';
import EarlyWarningNoticePreviewModal from './EarlyWarningNoticePreviewModal';

const { TextArea } = Input;

export interface EarlyWarningFormValues {
  ewReference: string;
  date: Dayjs | null;
  projectName: string;
  contractReference: string;
  to: string | string[];
  from: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  description: string;
  potentialImpacts?: string;
  proposedMitigation?: string;
}

// ─── SECTION SHELL ───────────────────────────────────────────────────────────

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
      {title}
      {hint && <span className="text-xs font-normal text-gray-400">{hint}</span>}
    </h3>
    {children}
  </div>
);

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const EarlyWarningNoticeFormOld = () => {
  const [form] = Form.useForm<EarlyWarningFormValues>();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewValues, setPreviewValues] = React.useState<EarlyWarningFormValues | null>(null);
  const { mutate: createEarlyWarning, isPending } = useCreateEarlyWarning();

  const { selectedProjectId } = useProjectStore();
  const { data: projectDetail } = useGetProjectById<ProjectDetailSummary>({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  // Contact persons for the selected project — drive the To / CC / BCC recipient dropdowns.
  const {
    options: recipientOptions,
    isLoading: isLoadingContacts,
    noRecipientsHint: noContactsHint,
  } = useRecipientOptions(selectedProjectId ?? undefined);

  React.useEffect(() => {
    if (!projectDetail) return;
    form.setFieldsValue({
      projectName: projectDetail.name ?? '',
      contractReference: projectDetail.referenceId ?? '',
    });
  }, [projectDetail, form]);

  const openPreview = () => {
    setPreviewValues(form.getFieldsValue(true));
    setPreviewOpen(true);
  };

  const handleSubmit = (values: EarlyWarningFormValues) => {
    createEarlyWarning(
      { data: values },
      {
        onSuccess: () => {
          notification.success({ message: 'Early Warning Notice sent successfully' });
        },
        onError: () => {
          notification.error({ message: 'Failed to send Early Warning Notice' });
        },
      }
    );
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="heading-page my-0">Early Warning Notice</h2>
            <p className="mt-1 mb-0 text-xs font-medium tracking-wide text-gray-400 uppercase">
              NEC4 Clause 15.1 · Early Warning Procedure
            </p>
          </div>
          <ButtonX htmlType="button" onClick={openPreview}>
            Preview
          </ButtonX>
        </div>

        {/* NEC4 banner */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
                <AlertTriangle size={18} className="text-rose-500" />
              </span>
              <Tag
                bordered={false}
                className="m-0 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-blue-600"
              >
                NEC4 ECC
              </Tag>
              <span className="text-lg font-bold text-gray-900">NEC4 Early Warning Notice</span>
            </div>
            <Tag
              bordered={false}
              className="m-0 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white"
            >
              TIME CRITICAL
            </Tag>
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="m-0 text-[13px] leading-relaxed text-blue-500">
              Clause 15 - Both parties must notify early warnings as soon as becoming aware of any
              matter affecting cost, time, or quality. All early warnings are recorded in the Early
              Warning Register.
            </p>
          </div>
        </div>

        {/* Project Context */}
        <Section title="Project Context">
          {/* <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Project</label>
            <Select
              className="w-full"
              placeholder="Select a project"
              allowClear
              loading={isLoadingProject}
              options={projectOptions.map((p) => ({ label: p.name, value: p.id }))}
              onChange={handleProjectChange}
            />
          </div> */}
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label="EW Reference"
              name="ewReference"
              rules={[{ required: true, message: 'EW Reference is required' }]}
            >
              <Input placeholder="EW-WD-023" />
            </Form.Item>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Date is required' }]}
            >
              <DatePicker className="w-full" format="MM/DD/YYYY" />
            </Form.Item>
            <Form.Item
              label="Project Name"
              name="projectName"
              rules={[{ required: true, message: 'Project name is required' }]}
            >
              <Input placeholder="Auto-filled from project" />
            </Form.Item>
            <Form.Item
              label="Contract Reference"
              name="contractReference"
              rules={[{ required: true, message: 'Contract reference is required' }]}
            >
              <Input placeholder="Auto-filled from project" />
            </Form.Item>
          </div>
        </Section>

        {/* Communication Details */}
        <Section title="Communication Details">
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            <DisabledTooltip disabled={!selectedProjectId} reason="Select a project first.">
              <Form.Item
                label="To"
                name="to"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) {
                        return Promise.reject(new Error('At least one recipient is required'));
                      }
                      const emails = Array.isArray(value) ? value : [value];
                      const invalidEmails = emails.filter(
                        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      );
                      if (invalidEmails.length > 0) {
                        return Promise.reject(new Error(`Invalid email: ${invalidEmails[0]}`));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <RecipientSelect
                  placeholder="Select or type email recipients..."
                  loading={isLoadingContacts}
                  options={recipientOptions}
                  disabled={!selectedProjectId}
                  notFoundContent={noContactsHint}
                />
              </Form.Item>
            </DisabledTooltip>

            <DisabledTooltip disabled={!selectedProjectId} reason="Select a project first.">
              <Form.Item label="CC" name="cc">
                <RecipientSelect
                  placeholder="Add CC recipients or type emails..."
                  loading={isLoadingContacts}
                  options={recipientOptions}
                  disabled={!selectedProjectId}
                  notFoundContent={noContactsHint}
                />
              </Form.Item>
            </DisabledTooltip>

            <DisabledTooltip disabled={!selectedProjectId} reason="Select a project first.">
              <Form.Item label="BCC" name="bcc">
                <RecipientSelect
                  placeholder="Add BCC recipients or type emails..."
                  loading={isLoadingContacts}
                  options={recipientOptions}
                  disabled={!selectedProjectId}
                  notFoundContent={noContactsHint}
                />
              </Form.Item>
            </DisabledTooltip>
          </div>
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: 'Subject is required' }]}
            className="mb-0"
          >
            <Input placeholder="Early Warning Notice - ..." />
          </Form.Item>
        </Section>

        {/* Early Warning Matter */}
        <Section title="Early Warning Matter" hint="(to Early Warning Register)">
          <Form.Item
            label="Description of Matter"
            name="description"
            rules={[{ required: true, message: 'Description of matter is required' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the matter that could affect cost, time, or quality (per Clause 15)..."
            />
          </Form.Item>
          <Form.Item label="Potential Impacts" name="potentialImpacts">
            <TextArea
              rows={3}
              placeholder="Describe potential impacts on cost, programme, or performance..."
            />
          </Form.Item>
          <Form.Item label="Proposed Mitigation Actions" name="proposedMitigation" className="mb-0">
            <TextArea
              rows={3}
              placeholder="Describe proposed actions to avoid or reduce the impact..."
            />
          </Form.Item>
        </Section>

        {/* Agent Integration System */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          {/* <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200">
                <Briefcase size={18} className="text-[#1e3a5f]" />
              </span>
              <span className="text-lg font-bold text-gray-900">Agent Integration System</span>
              <Tag
                bordered={false}
                className="m-0 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-gray-500"
              >
                EARLY-WARNING
              </Tag>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">AI Assistant</span>
                <Switch />
              </div>
              <span className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-gray-700">
                <Settings size={16} /> ADVANCED
              </span>
            </div>
          </div> */}

          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* <div className="flex flex-wrap items-center gap-3">
              <ButtonX
                htmlType="button"
                size="large"
                icon={<ShieldQuestion size={16} />}
                className="font-semibold!"
              >
                Validate
              </ButtonX>
              <ButtonX
                htmlType="button"
                size="large"
                icon={<ShieldCheck size={16} />}
                className="font-semibold!"
              >
                Check Compliance
              </ButtonX>
              <ButtonX
                htmlType="button"
                size="large"
                icon={<FileText size={16} />}
                className="font-semibold!"
              >
                Generate Evidence
              </ButtonX>
              <ButtonX
                htmlType="button"
                size="large"
                icon={<Save size={16} />}
                onClick={handleSaveDraft}
                className="font-semibold!"
              >
                Save Draft
              </ButtonX>
            </div> */}
            <ButtonX
              type="primary"
              htmlType="submit"
              size="large"
              loading={isPending}
              className="bg-[#1e3a5f]! px-8! font-semibold!"
            >
              Save
            </ButtonX>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <EarlyWarningNoticePreviewModal
        open={previewOpen}
        values={previewValues}
        onClose={() => setPreviewOpen(false)}
      />
    </Form>
  );
};

export default EarlyWarningNoticeFormOld;
