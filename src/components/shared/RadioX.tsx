import { Radio, type RadioProps } from 'antd';
import React from 'react';

interface Props extends RadioProps {
  required?: boolean;
}

function RadioX({ children, className, ...props }: Props) {
  return (
    <div className="flex flex-col gap-y-2">
      <Radio className={className} {...props}>
        {children}
      </Radio>
    </div>
  );
}

export default RadioX;
