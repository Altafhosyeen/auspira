'use client';

import { Tabs, type TabsProps } from 'antd';
import clsx from 'clsx';

interface Props extends TabsProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

function TabsX({ label, error, required, containerClassName, className, ...props }: Props) {
  return (
    <div className={clsx('flex flex-col gap-2', containerClassName)}>
      {label && (
        <div className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </div>
      )}

      <Tabs
        className={clsx(error && 'rounded-md border border-red-500 p-1', className)}
        {...props}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default TabsX;
