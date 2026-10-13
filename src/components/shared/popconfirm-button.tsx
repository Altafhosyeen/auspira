'use client';

import { Button, type ButtonProps, Popconfirm } from 'antd';
import { type ReactNode, useState } from 'react';

export interface PopconfirmButtonProps extends Omit<ButtonProps, 'onClick' | 'htmlType'> {
  confirmTitle: ReactNode;
  /** Names the record the action runs on — pass what the API or the form holds for it. */
  confirmDescription?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  /** Gate run on click; the popconfirm stays shut when it returns false or rejects (e.g. a failed validateFields). */
  beforeOpen?: () => unknown;
  onConfirm: () => void;
}

// A one-way action button that asks once before it runs. The popconfirm is controlled so a
// form can be validated first, and the question is only asked about something submittable.
const PopconfirmButton = ({
  confirmTitle,
  confirmDescription,
  okText = 'Confirm',
  cancelText = 'Cancel',
  beforeOpen,
  onConfirm,
  danger,
  disabled,
  loading,
  ...buttonProps
}: PopconfirmButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    try {
      if (beforeOpen && (await beforeOpen()) === false) return;
    } catch {
      return;
    }
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <Popconfirm
      title={confirmTitle}
      description={confirmDescription || undefined}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger }}
      open={open}
      disabled={disabled}
      onOpenChange={(next) => {
        if (!next) setOpen(false);
      }}
      onConfirm={handleConfirm}
    >
      <Button
        {...buttonProps}
        danger={danger}
        disabled={disabled}
        loading={loading}
        onClick={handleClick}
      />
    </Popconfirm>
  );
};

export default PopconfirmButton;
