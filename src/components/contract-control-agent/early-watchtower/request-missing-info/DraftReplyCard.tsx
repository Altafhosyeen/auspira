'use client';

import { Form, Input, Select, Tooltip } from 'antd';
import type { Rule } from 'antd/es/form';
import type { DefaultOptionType } from 'antd/es/select';
import { Mail } from 'lucide-react';
import type React from 'react';

const { TextArea } = Input;

const FieldLabel = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <label className="ds-micro text-icon mb-1.5 flex items-center gap-1.5 font-bold tracking-wider uppercase">
    {icon}
    {children}
  </label>
);

const FormField = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div>
    <FieldLabel icon={icon}>{label}</FieldLabel>
    {children}
  </div>
);

/** One row of the card. Pass `name` (+ optionally `rules`) to bind it to an ancestor antd
 * `<Form>` instead of rendering as a plain uncontrolled input. */
export interface DraftReplyField {
  key: string;
  label: string;
  icon: React.ReactNode;
  type?: 'input' | 'textarea' | 'tags';
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  disabledReason?: React.ReactNode;
  placeholder?: string;
  rows?: number;
  name?: string;
  rules?: Rule[];
  /** `type: 'tags'` only — suggestion list (e.g. project contact persons) shown under the input. */
  options?: DefaultOptionType[];
  loading?: boolean;
  notFoundContent?: React.ReactNode;
}

export interface DraftReplyCardProps {
  title?: string;
  badge?: string;
  fields: DraftReplyField[];
  footerHint?: string;
}

const DraftReplyCard = ({
  title = 'Draft Reply to Contractor',
  badge = 'Review before sending',
  fields,
}: DraftReplyCardProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    {/* Card header */}
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="bg-main-p/10 text-main-p flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Mail className="h-4.5 w-4.5" />
        </span>
        <h3 className="ds-caption text-text font-bold tracking-wider uppercase">{title}</h3>
      </div>
      {badge && (
        <span className="badge-warning ds-micro cursor-pointer rounded-md px-2.5 py-1 font-semibold hover:underline">
          {badge}
        </span>
      )}
    </div>

    {/* Form content */}
    <div className="space-y-4 p-5">
      {fields.map((field) => {
        const control =
          field.type === 'textarea' ? (
            <TextArea
              rows={8}
              value={field.value}
              defaultValue={field.defaultValue}
              disabled={field.disabled}
              placeholder={field.placeholder}
              className="ds-caption text-text resize-none rounded-lg leading-relaxed"
            />
          ) : field.type === 'tags' ? (
            <Select
              mode="tags"
              showSearch
              allowClear
              // Semicolons included so a recipient list pasted out of Outlook splits into tags.
              tokenSeparators={[',', ' ', ';']}
              optionLabelProp="value"
              // Collapse to one visible tag so a long recipient list doesn't grow the field —
              // the rest sit behind a "+N more" tag that expands on click.
              maxTagCount={1}
              maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
              options={field.options}
              loading={field.loading}
              notFoundContent={field.notFoundContent}
              disabled={field.disabled}
              placeholder={field.placeholder ?? 'Enter recipient emails'}
              size="large"
              className="w-full"
            />
          ) : (
            <Input
              value={field.value}
              defaultValue={field.defaultValue}
              disabled={field.disabled}
              placeholder={field.placeholder}
              size="large"
              className={field.disabled ? 'bg-surface-subtle rounded-lg' : 'rounded-lg'}
            />
          );

        const fieldControl = field.disabledReason ? (
          <Tooltip title={field.disabledReason}>
            <span className="block">{control}</span>
          </Tooltip>
        ) : (
          control
        );

        return (
          <FormField key={field.key} icon={field.icon} label={field.label}>
            {field.name ? (
              <Form.Item name={field.name} rules={field.rules} noStyle>
                {fieldControl}
              </Form.Item>
            ) : (
              fieldControl
            )}
          </FormField>
        );
      })}
    </div>

    {/* Footer hint */}
  </div>
);

export default DraftReplyCard;
