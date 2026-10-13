'use client';

import React from 'react';
import { Card, Upload, Button, Typography, Tag } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UploadCardProps {
  title: string;
  subtitle?: string;
  required?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const UploadCard: React.FC<UploadCardProps> = ({
  title,
  subtitle,
  required = false,
  fullWidth = false,
  icon,
}) => {
  return (
    <Card
      className={`rounded-xl border border-gray-200 shadow-sm ${fullWidth ? 'col-span-2' : ''}`}
      bodyStyle={{ padding: 16 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <div>{icon && <span className="mr-2">{icon}</span>}</div>
          <div>
            <Text strong className="block text-gray-800">
              {title}
            </Text>
            {subtitle && <Text className="text-xs text-gray-500">{subtitle}</Text>}
          </div>
        </div>

        {required && <Tag color="red">REQUIRED</Tag>}
      </div>

      {/* Upload Area */}
      <Upload.Dragger
        multiple={false}
        showUploadList={false}
        className="!rounded-lg !border-dashed !bg-[#C2C7D1]"
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload.Dragger>
    </Card>
  );
};

export default UploadCard;
