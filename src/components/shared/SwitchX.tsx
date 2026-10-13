'use client';
import React from 'react';
import { Switch } from 'antd';

interface SwitchXProps {
  selectLabel?: string;
  deselectLabel?: string;
  className?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const SwitchX: React.FC<SwitchXProps> = ({
  selectLabel = 'Select All',
  deselectLabel = 'Deselect All',
  checked = false,
  className = '',

  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        unCheckedChildren={selectLabel}
        checkedChildren={deselectLabel}
        checked={checked}
        className={`h-6.5 w-26.5 ${className}`}
        onChange={onChange}
      />
    </div>
  );
};

export default SwitchX;
