'use client';
import { Input } from 'antd';
const { Search } = Input;

type SearchXProps = {
  value?: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  className?: string;
  allowClear?: boolean;
};

export default function SearchX({
  value = '',
  placeholder = 'Search...',
  onSearch,
  onChange,
  className = '',
  allowClear = true,
}: SearchXProps) {
  return (
    <Search
      value={value}
      placeholder={placeholder}
      allowClear={allowClear}
      onSearch={onSearch}
      onChange={(e) => onChange?.(e.target.value)}
      className={`override-tablesearcher rounded-lg shadow-none! ${className}`}
    />
  );
}
