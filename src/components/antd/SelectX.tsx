'use client';
import { Select, type SelectProps } from 'antd';

interface Props extends SelectProps {
  label?: string;
}

function SelectX({ label, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm">{label}</label>}
      <Select
        {...props}
        filterOption={
          props.filterOption ??
          ((input, option) => {
            const candidate = String(option?.label ?? option?.value ?? '').toLowerCase();
            return candidate.includes(input.toLowerCase());
          })
        }
        optionFilterProp={props.optionFilterProp}
        showSearch
      />
    </div>
  );
}

export default SelectX;
