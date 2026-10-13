import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from 'antd';
import { CheckIcon } from './icons';

export type ResolveMode = 'confirm' | 'manual';

interface ResolveValueModalProps {
  open: boolean;
  mode: ResolveMode;
  /** Data-point label shown in the modal header, e.g. "BOQ total amount". */
  title: string;
  /** The value being confirmed (confirm mode) or the initial input (manual mode). */
  presetValue?: string;
  /** Disables the actions and shows a spinner while the API call is in flight. */
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

/**
 * Confirmation / manual-entry dialog for resolving a cross-reference conflict.
 * - `confirm` → shows the chosen value read-only and asks the user to confirm.
 * - `manual`  → shows an editable input so the user can type any value.
 * Either way the confirmed string is handed back via `onConfirm`.
 */
export const ResolveValueModal: React.FC<ResolveValueModalProps> = ({
  open,
  mode,
  title,
  presetValue = '',
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [value, setValue] = useState(presetValue);

  // Re-seed the input each time the dialog opens (or the preset changes).
  useEffect(() => {
    if (open) setValue(presetValue);
  }, [open, presetValue]);

  const isManual = mode === 'manual';
  const trimmed = value.trim();
  const canConfirm = !loading && trimmed.length > 0;

  const handleConfirm = () => {
    if (canConfirm) onConfirm(trimmed);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={440}
      centered
      // Opens from inside the finding drawer, which sits at AntD's default 1000.
      zIndex={1100}
      destroyOnHidden
      footer={null}
      title={null}
      styles={{ body: { padding: 0 }, container: { overflow: 'hidden' } }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-surface-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <CheckIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="ds-body-large! text-text m-0 truncate font-bold!">
            {isManual ? 'Enter value manually' : 'Confirm resolved value'}
          </h3>
          <p className="ds-caption! m-0 truncate text-slate-700">{title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="border-t border-slate-100">
        {isManual ? (
          <>
            <label className="ds-caption! mb-2 block font-bold! tracking-wide text-slate-600">
              Value
            </label>
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onPressEnter={handleConfirm}
              placeholder="Enter a number or text value…"
              size="large"
            />
          </>
        ) : (
          <>
            <p className="ds-caption! mb-2 font-medium! text-slate-500">
              Set the agreed value for this data point to:
            </p>
            <div className="ds-heading-3! text-surface-dark rounded-lg border-slate-200 bg-slate-50 px-4 py-2 text-center font-bold! tracking-tight wrap-break-word">
              {presetValue}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-end gap-2 border-slate-100 bg-slate-50/60">
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleConfirm}
          loading={loading}
          className="bg-surface-dark! hover:bg-surface-dark/90!"
        >
          {isManual ? 'Save' : 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
};

ResolveValueModal.displayName = 'ResolveValueModal';
