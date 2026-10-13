import { Button, Modal } from 'antd';
import type React from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { CheckIcon } from './icons';

interface ContractRouteConfirmModalProps {
  open: boolean;
  title: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /**
   * Label for the confirm button. Defaults to a plain "Confirm"; the onboarding
   * flow overrides it to name the follow-up action the confirm actually triggers
   * (notifying the project manager).
   */
  confirmLabel?: string;
  /** Replaces the body copy when the confirm does more than persist the flag. */
  description?: React.ReactNode;
  /**
   * Where to mount the modal. Pass `false` to render it in-place (used when the
   * dialog opens from inside the finding drawer, so the mask covers only the
   * drawer panel instead of the whole viewport).
   */
  getContainer?: React.ComponentProps<typeof Modal>['getContainer'];
}

/**
 * Confirmation dialog for marking a data point as the contract route.
 * Shows a brief explanation and asks for confirmation before persisting.
 */
export const ContractRouteConfirmModal: React.FC<ContractRouteConfirmModalProps> = ({
  open,
  title,
  loading = false,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  description,
  getContainer,
}) => {
  // Embedded = mounted inside the finding drawer. AntD's mask/wrap default to
  // position:fixed (viewport-anchored), so even with getContainer={false} the
  // dialog centers over the whole screen. Switching them to position:absolute
  // anchors them to the drawer panel instead, scoping the mask to the drawer.
  const isEmbedded = getContainer === false;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={440}
      centered
      // When embedded the mask/wrap are absolute inside the drawer, so the default
      // z-index is fine. When mounted at the body it needs to clear the drawer,
      // which sits at AntD's default 1000.
      zIndex={isEmbedded ? undefined : 1100}
      getContainer={getContainer}
      destroyOnHidden
      footer={null}
      title={null}
      styles={{
        body: { padding: 0 },
        container: { overflow: 'hidden' },
        ...(isEmbedded
          ? {
              root: { position: 'absolute', inset: 0 },
              mask: { position: 'absolute' },
              wrapper: { position: 'absolute' },
            }
          : {}),
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <CheckIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="ds-body-large! text-text m-0 font-bold!">Mark as contract route</h3>
          <p className="ds-caption! m-0 truncate text-slate-700">{title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="border-t border-slate-100">
        <p className="ds-body! mb-0 text-slate-600">
          {description ??
            'This data point will be flagged as the agreed reference across all contract documents. You can change this selection later.'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
        <DisabledTooltip
          disabled={loading}
          reason="Wait for the contract route change to finish saving before cancelling."
        >
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </DisabledTooltip>
        <Button type="primary" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

ContractRouteConfirmModal.displayName = 'ContractRouteConfirmModal';
