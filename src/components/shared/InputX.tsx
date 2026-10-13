import { Input, type InputProps } from 'antd';
import React from 'react';

interface Props extends InputProps {
  label?: string | React.ReactNode;
  topDesc?: string | React.ReactNode;
  className?: string;
  bottomDesc?: string | React.ReactNode;
}

function InputX({ label, topDesc, bottomDesc, ...props }: Props) {
  return (
    <div className="flex flex-col gap-y-2">
      {label && <span className="text-[16px] font-medium">{label}</span>}
      {topDesc && <span className="text-xs text-gray-500">{topDesc}</span>}
      <Input {...props} />
      {bottomDesc && <span className="text-xs text-gray-500">{bottomDesc}</span>}
    </div>
  );
}

export default InputX;
