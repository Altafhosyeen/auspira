'use client';
import { Input, type InputProps } from 'antd';

interface Props extends InputProps {
  label?: string;
}

function InputX({ label, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm">{label}</label>}
      <Input {...props} />
    </div>
  );
}

export default InputX;
