import React from 'react';
import { Tag, TagProps } from 'antd';

interface TagXProps extends Omit<TagProps, 'variant'> {
  variant?: 'success' | 'warning' | 'error' | 'info';
}

const variantColors = {
  success: 'green',
  warning: 'orange',
  error: 'red',
  info: 'blue',
};

const TagX: React.FC<TagXProps> = ({ variant = 'info', children, ...rest }) => {
  return (
    <Tag color={variantColors[variant]} className={'rounded-md px-3 py-1 text-sm'} {...rest}>
      {children}
    </Tag>
  );
};

export default TagX;
