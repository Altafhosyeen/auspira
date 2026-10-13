'use client';
import React from 'react';
import FormActions from '../Button/FormActions';
interface HeaderProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onAdd?: () => void;
  showButton?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}
const EditFormTableHeader = ({
  title,
  description,
  buttonText = 'Add New',
  onAdd,
  showButton = false,
  loading = false,
  icon,
}: HeaderProps) => {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-md border-b border-gray-300 bg-white p-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            {icon && <div className="">{icon}</div>}
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>

        {showButton && (
          <FormActions
            text={buttonText}
            onSubmit={onAdd}
            isSaving={loading}
            showCancelButton={false}
            withBg={false}
          />
        )}
      </div>
    </div>
  );
};

export default EditFormTableHeader;
