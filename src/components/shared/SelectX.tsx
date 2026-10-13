import { Select } from 'antd';

interface SelectXProps {
  value?: number | string | null;
  options: {
    label: string;
    value: number | string;
  }[];
  onChange?: (value: number | string) => void;
  className?: string;
  placeholder?: string;
  allowClear?: boolean;
}

export default function SelectX({
  value,
  options,
  onChange,
  className = '',
  placeholder,
  allowClear = true,
}: SelectXProps) {
  return (
    <Select
      value={value || undefined}
      placeholder={placeholder}
      onChange={onChange}
      options={options}
      popupClassName="select-x-dropdown"
      allowClear={allowClear}
      className={`[&_.ant-select-dropdown]:rounded-sm! [&_.ant-select-dropdown]:shadow-none! ${className}`}
    />
  );
}
