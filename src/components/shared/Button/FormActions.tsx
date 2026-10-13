'use client';

import React from 'react';
import { useRouter } from 'nextjs-toploader/app';
import ButtonX from '@/components/antd/ButtonX';
import { Plus } from 'lucide-react';

interface FormActionsProps {
  isSaving?: boolean;
  showCancelButton?: boolean;
  showSaveButton?: boolean;
  text: string;
  onSubmit?: () => void;
  withBg?: boolean;
  icon?: React.ReactNode;
  customStyle?: string;
  onCancel?: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  isSaving = false,
  showCancelButton = true,
  showSaveButton = true,
  text,
  onSubmit,
  withBg = true,
  icon,
  customStyle = '',
  onCancel,
}) => {
  const router = useRouter();

  return (
    <div
      className={` ${customStyle} ${withBg ? 'rounded-xl border border-gray-200 bg-white p-4' : ''} `}
    >
      <div className="flex items-center justify-center gap-3">
        {showCancelButton && <ButtonX onClick={onCancel || (() => router.back())}>Cancel</ButtonX>}

        {showSaveButton && (
          <ButtonX
            type="primary"
            size="middle"
            icon={icon || <Plus className="h-4 w-4" />}
            loading={isSaving}
            onClick={onSubmit}
          >
            {text}
          </ButtonX>
        )}
      </div>
    </div>
  );
};

export default FormActions;
