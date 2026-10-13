'use client';

import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

interface InfoWithLabelProps {
  label?: string;
  info?: string; // tooltip text
  required?: boolean;
  className?: string;
}

const InfoWithLabel: React.FC<InfoWithLabelProps> = ({
  label,
  info,
  required = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${className}`}>
      <span>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>

      {info && (
        <Tooltip title={info}>
          <InfoCircleOutlined className="text-primary text-theme-primary cursor-pointer" />
        </Tooltip>
      )}
    </div>
  );
};

export default InfoWithLabel;
