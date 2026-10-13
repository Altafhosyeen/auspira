'use client';

import { Progress, Button, Card } from 'antd';
import { WarningOutlined, CheckCircleFilled, ArrowRightOutlined } from '@ant-design/icons';

type Item = {
  id: string;
  label: string;
  value: number;
  status: 'warning' | 'success' | 'danger';
};

interface Props {
  title: string;
  percentage: number;
  description: string;
  items: Item[];
}

const getColor = (status: Item['status']) => {
  switch (status) {
    case 'success':
      return '#22c55e';
    case 'danger':
      return '#ef4444';
    default:
      return '#f59e0b';
  }
};

const getIcon = (status: Item['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircleFilled className="text-green-500" />;
    case 'danger':
      return <WarningOutlined className="text-red-500" />;
    default:
      return <WarningOutlined className="text-yellow-500" />;
  }
};

export default function ContractOverviewCard({ title, percentage, description, items }: Props) {
  return (
    <Card className="w-full rounded-2xl bg-white shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        <Button type="default" size="large" icon={<ArrowRightOutlined />} iconPosition="end">
          See Details
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-6">
        <Progress type="circle" percent={percentage} strokeColor="#f59e0b" size={90} />
        <div>
          <h4 className="text-md font-bold text-gray-800">Contract Control Agent</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {getIcon(item.status)}
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-sm text-gray-600">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.value}%`, backgroundColor: getColor(item.status) }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
