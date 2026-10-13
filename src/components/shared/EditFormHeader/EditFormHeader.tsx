'use client';

import React from 'react';
import ButtonX from '@/components/antd/ButtonX';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

interface IEditFormHeaderProps {
  title: string;
  subtitle?: string;
  name?: string;

  onBack?: () => string | void;
  onCancel?: () => void;
  onSave?: () => void;

  backLabel?: string;
  cancelLabel?: string;
  saveLabel?: string;

  isSaving?: boolean;
  hideActions?: boolean;

  className?: string;

  saveIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
  backIcon?: React.ReactNode;
}

const EditFormHeader: React.FC<IEditFormHeaderProps> = ({
  title,
  subtitle,
  name,

  onBack,
  onCancel,
  onSave,

  backLabel = 'Back',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',

  isSaving = false,
  hideActions = false,

  className = '',
  backIcon,
  cancelIcon,
  saveIcon,
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Top Row (ONLY Back) */}
      <div className="flex items-center">
        {onBack && (
          <ButtonX
            className="-ml-3"
            type="link"
            icon={backIcon || <ArrowLeftOutlined />}
            onClick={onBack}
          >
            {backLabel}
          </ButtonX>
        )}
      </div>

      {/* Second Row (Title + Actions) */}
      <div className="flex items-start justify-between">
        {/* Title */}
        <div className="pl-1">
          <div className="flex items-center gap-2">
            <h1 className="heading-page leading-tight">{title}</h1>
            <p className="text-lg">{name} </p>
          </div>

          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>

        {/* Actions */}
        {!hideActions && (
          <div className="flex items-center gap-2">
            {onCancel && (
              <ButtonX icon={cancelIcon || <CloseOutlined />} onClick={onCancel}>
                {cancelLabel}
              </ButtonX>
            )}

            {onSave && (
              <ButtonX
                type="primary"
                icon={saveIcon || <CheckOutlined />}
                loading={isSaving}
                onClick={onSave}
              >
                {saveLabel}
              </ButtonX>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditFormHeader;
