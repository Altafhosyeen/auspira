import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { EW_FORM_STYLES as S } from './early-warning-form.styles';

// ─── FieldLabel ──────────────────────────────────────────────────────────────

export const FieldLabel = ({
  children,
  required,
  spaced,
}: {
  children: React.ReactNode;
  required?: boolean;
  spaced?: boolean;
}) => (
  <label className={spaced ? S.labelSpaced : S.label}>
    {children}
    {required && <span className={S.required}> *</span>}
  </label>
);

// ─── TextField ───────────────────────────────────────────────────────────────

type TextFieldProps = {
  label: React.ReactNode;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  /** Renders the value in a muted grey (for placeholder-ish content like "-"). */
  muted?: boolean;
};

export const TextField = ({
  label,
  value,
  defaultValue,
  required,
  disabled,
  muted,
}: TextFieldProps) => {
  const className = disabled ? S.inputDisabled : muted ? S.inputMuted : S.input;
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {/* Controlled when `value` is passed (disabled fields), else uncontrolled */}
      {value !== undefined ? (
        <input type="text" value={value} disabled={disabled} className={className} />
      ) : (
        <input type="text" defaultValue={defaultValue} disabled={disabled} className={className} />
      )}
    </div>
  );
};

// ─── TextAreaField ───────────────────────────────────────────────────────────

export const TextAreaField = ({
  label,
  defaultValue,
  rows = 5,
}: {
  label: React.ReactNode;
  defaultValue?: string;
  rows?: number;
}) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <textarea rows={rows} defaultValue={defaultValue} className={S.textarea} />
  </div>
);

// ─── SelectField ─────────────────────────────────────────────────────────────

export const SelectField = ({
  label,
  options,
  compact,
}: {
  label?: React.ReactNode;
  options: readonly string[];
  /** Compact variant used in the side panel cards. */
  compact?: boolean;
}) => (
  <div>
    {label && <FieldLabel>{label}</FieldLabel>}
    <div className={S.selectWrap}>
      <select className={compact ? S.selectCompact : S.select}>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <DownOutlined className={S.selectChevron} />
    </div>
  </div>
);

// ─── SectionCard ─────────────────────────────────────────────────────────────

export const SectionCard = ({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className={`${S.cardStack} ${S.card}`}>
    {aside !== undefined ? (
      <div className={S.sectionHeaderRow}>
        <h3 className={S.sectionTitle}>{title}</h3>
        <span className={S.sectionAside}>{aside}</span>
      </div>
    ) : (
      <h3 className={S.sectionTitleBordered}>{title}</h3>
    )}
    {children}
  </div>
);

// ─── InfoCard (side panel) ───────────────────────────────────────────────────

export const InfoCard = ({
  title,
  bordered,
  stacked,
  children,
}: {
  title: string;
  /** Underline the title (used by the evidence card). */
  bordered?: boolean;
  /** Adds vertical spacing between children (evidence list + footer). */
  stacked?: boolean;
  children: React.ReactNode;
}) => (
  <div className={stacked ? `${S.cardStack} ${S.card}` : S.card}>
    <h4 className={bordered ? S.infoTitleBordered : S.infoTitle}>{title}</h4>
    {children}
  </div>
);

// ─── Checkbox ────────────────────────────────────────────────────────────────

export const Checkbox = ({
  label,
  checked,
  defaultChecked,
  onChange,
  small,
}: {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: () => void;
  small?: boolean;
}) => (
  <label className={S.checkboxLabel}>
    <input
      type="checkbox"
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      className={small ? S.checkboxSm : S.checkbox}
    />
    <span className={S.checkboxText}>{label}</span>
  </label>
);
