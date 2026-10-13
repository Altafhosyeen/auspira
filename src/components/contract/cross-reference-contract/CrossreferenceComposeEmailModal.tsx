import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Select, Button, Tag, notification } from 'antd';
import { MailIcon } from '@/components/module/project/third-step/cross-reference/icons';
import { useProjectStore } from '@/store/project.store';
import { useSendCrossReferenceEmail } from '@/hooks/modules/cross-reference';
import type { ContractFinding } from './types';
import TextArea from 'antd/es/input/TextArea';

/** Editable fields the user can change; everything else is auto-populated from the finding. */
export interface ComposeEmailValues {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  message: string;
  logInCommunications: boolean;
}

interface ComposeEmailModalProps {
  open: boolean;
  finding: ContractFinding | null;
  /** Default recipient chip, e.g. "M. Cole". */
  defaultRecipient?: string;
  /** Project name for the auto-filled "Project Context" block. Falls back to the selected project. */
  projectName?: string;
  /** Contract reference for the auto-filled "Project Context" block. */
  contractReference?: string;
  onClose: () => void;
  onSend: (findingId: string, values: ComposeEmailValues) => void;
}

/**
 * Standard "what we need from you" ask, auto-filled at the foot of the email so the
 * contractor knows exactly how to respond. Fixed copy — not derived from the finding.
 */

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="ds-caption! mb-1.5 block font-bold! tracking-wide text-slate-600">
    {children}
  </label>
);

/** Uppercase micro caption used for the read-only preview field labels. */
const MetaLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="ds-micro! mb-1 font-bold! tracking-wider text-slate-500 uppercase">{children}</p>
);

/** Free-entry recipient field — type an address and press Enter to add it as a chip. */
const RecipientSelect: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => (
  <Select
    mode="tags"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full"
    suffixIcon={null}
    open={false}
    tokenSeparators={[',', ' ', ';']}
    tagRender={({ label, closable, onClose: onTagClose }) => (
      <Tag color="blue" closable={closable} onClose={onTagClose} className="mr-1">
        {label}
      </Tag>
    )}
  />
);

/** Short error code shown in the subject line, e.g. "ERR-001". */
const errorCode = (finding: ContractFinding) => {
  const n = finding.id.replace(/\D/g, '') || '1';
  return `ERR-${n.padStart(3, '0')}`;
};
const buildDefaults = (finding: ContractFinding, recipient: string): ComposeEmailValues => ({
  to: recipient ? [recipient] : [],
  cc: [],
  bcc: [],
  subject: `[${errorCode(finding)}] Cross-Reference Clarification: ${finding.title}`,
  message: finding.errorMessage!,
  logInCommunications: true,
});

export const CrossreferenceComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  open,
  finding,
  defaultRecipient,
  projectName,
  contractReference,
  onClose,
  onSend,
}) => {
  const [values, setValues] = useState<ComposeEmailValues | null>(null);
  const { mutateAsync: sendEmail, isPending: isSending } = useSendCrossReferenceEmail();
  // Fall back to the selected project's name when the parent doesn't pass one.
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const projectOptions = useProjectStore((s) => s.projectOptions);
  const resolvedProjectName =
    projectName || projectOptions.find((o) => o.id === selectedProjectId)?.name || '—';
  const resolvedContractReference = contractReference || '—';

  // Re-seed the form each time a finding is opened.
  useEffect(() => {
    if (open && finding) setValues(buildDefaults(finding, defaultRecipient!));
  }, [open, finding, defaultRecipient]);

  // Conflicting values table rows, auto-populated from the finding's sources.
  const valueRows = useMemo(
    () =>
      (finding?.sources ?? []).map((s) => ({
        document: s.documentName || s.docName,
        page: s.pageNumber ?? s.page.replace(/^PAGE\s*/i, ''),
        value: s.value,
      })),
    [finding]
  );

  if (!finding || !values) return null;

  const set = <K extends keyof ComposeEmailValues>(key: K, value: ComposeEmailValues[K]) =>
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSend = async () => {
    if (values.to.length === 0) {
      notification.error({ message: 'Add at least one recipient.' });
      return;
    }
    try {
      await sendEmail({
        to: values.to.join(', '),
        cc: values.cc.join(', ') || undefined,
        bcc: values.bcc.join(', ') || undefined,
        projectCrossReferenceId: finding.id,
        description: values.message,
      });
      onSend(finding.id, values);
      notification.success({ message: 'Email sent and logged against the contract.' });
      onClose();
    } catch {
      console.log('');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      centered
      destroyOnClose
      footer={null}
      title={null}
    >
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <MailIcon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="ds-body-large! text-text font-bold!">
            Cross-Reference Clarification Request
          </h3>
          <p className="ds-micro! font-bold! tracking-wider text-slate-700 uppercase">
            Data point verification · contractor response requested
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[64vh] space-y-4 overflow-y-auto py-4 pr-1">
        {/* Recipients — the only editable address fields */}
        <div>
          <FieldLabel>To</FieldLabel>
          <RecipientSelect
            value={values.to}
            onChange={(v) => set('to', v)}
            placeholder="Add recipient..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>CC</FieldLabel>
            <RecipientSelect
              value={values.cc}
              onChange={(v) => set('cc', v)}
              placeholder="Add CC..."
            />
          </div>
          <div>
            <FieldLabel>BCC</FieldLabel>
            <RecipientSelect
              value={values.bcc}
              onChange={(v) => set('bcc', v)}
              placeholder="Add BCC..."
            />
          </div>
        </div>
        <div>
          <FieldLabel>Message</FieldLabel>
          <TextArea
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            autoSize={{ minRows: 4, maxRows: 10 }}
          />
        </div>
        {/* ---------- Auto-populated email preview (matches the sent template) ---------- */}
        <div>
          <FieldLabel>Email preview — auto-filled from this finding</FieldLabel>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            {/* Status card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg text-amber-600">
                  ❓
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span className="ds-micro! rounded bg-sky-50 px-2 py-0.5 font-bold! tracking-wider text-sky-600 uppercase">
                    NEC4 ECC
                  </span>
                  <strong className="ds-body-strong! text-slate-900">
                    Data Discrepancy Identified
                  </strong>
                </div>
                <span className="ds-micro! shrink-0 rounded-full bg-amber-500 px-2.5 py-1 font-bold! tracking-wider text-white uppercase">
                  Needs Review
                </span>
              </div>
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="ds-caption! leading-relaxed text-amber-800">
                  During document review, the same data point was found to differ in formatting,
                  order, or value across multiple project documents. We need your confirmation on
                  which value is correct before this item can be closed out.
                </p>
              </div>
            </div>
            {/* Project context */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="ds-caption! mb-3 font-bold! text-slate-600">📋 Project Reference</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <MetaLabel>Project Name</MetaLabel>
                  <p className="ds-caption! font-semibold! wrap-break-word text-slate-900">
                    {resolvedProjectName}
                  </p>
                </div>
                <div>
                  <MetaLabel>Contract Reference</MetaLabel>
                  <p className="ds-caption! font-semibold! wrap-break-word text-slate-900">
                    {resolvedContractReference}
                  </p>
                </div>
              </div>
            </div>
            {/* Data point in question */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div>
                <p className="ds-caption! leading-relaxed wrap-break-word text-slate-700">
                  {finding.title}
                </p>
              </div>

              {valueRows.length > 0 && (
                <div>
                  <MetaLabel>Conflicting Values Found</MetaLabel>
                  <div className="mt-1 overflow-hidden rounded-lg border border-slate-100">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="ds-micro! px-3 py-2 text-left font-bold! tracking-wider text-slate-700 uppercase">
                            Source Document
                          </th>
                          <th className="ds-micro! px-3 py-2 text-center font-bold! tracking-wider text-slate-700 uppercase">
                            Page
                          </th>
                          <th className="ds-micro! px-3 py-2 text-right font-bold! tracking-wider text-slate-700 uppercase">
                            Value Found
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {valueRows.map((row) => (
                          <tr
                            key={`${row.document}-${row.page}-${row.value}`}
                            className="border-t border-slate-100"
                          >
                            <td className="ds-caption! px-3 py-2.5 align-top wrap-break-word text-slate-700">
                              {row.document}
                            </td>
                            <td className="ds-caption! px-3 py-2.5 text-center align-top text-slate-700">
                              {row.page}
                            </td>
                            <td className="ds-caption! px-3 py-2.5 text-right align-top font-semibold! wrap-break-word text-slate-900">
                              {row.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* What we need from you — auto-filled fixed copy */}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button onClick={onClose} disabled={isSending}>
          Discard
        </Button>
        <Button type="primary" onClick={handleSend} loading={isSending}>
          <span className="flex items-center gap-1.5">Send Email</span>
        </Button>
      </div>
    </Modal>
  );
};

CrossreferenceComposeEmailModal.displayName = 'CrossreferenceComposeEmailModal';
