'use client';

import React from 'react';
import { type InputProps } from 'antd';
import InputX from '@/components/antd/InputX';
import { SearchOutlined } from '@ant-design/icons';

interface SearchInputProps extends Omit<InputProps, 'size' | 'onChange' | 'suffix' | 'type'> {
  value?: string;
  onChange?: (value: string) => void;

  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  className?: string;

  allowClear?: boolean;
  disabled?: boolean;

  suffix?: React.ReactNode;
}

const SearchInputX: React.FC<SearchInputProps> = ({
  value = '',
  onChange,

  placeholder = 'Search...',
  size = 'large',
  className,

  allowClear = true,
  disabled = false,

  suffix,

  ...restProps
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <InputX
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      allowClear={allowClear}
      size={size}
      disabled={disabled}
      suffix={suffix ?? <SearchOutlined />}
      className={className}
      {...restProps} // forward all other antd Input props
    />
  );
};

export default SearchInputX;
