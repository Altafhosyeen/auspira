import { CalendarOutlined } from '@ant-design/icons';
import { Card, Tag } from 'antd';
import { CardHeader } from './CardHeader';

export const NECOptionsCard = ({ data }: { data?: any }) => (
  <Card className="rounded-2xl shadow-sm">
    <CardHeader icon={<CalendarOutlined />} title="NEC Options" score={data?.score} />

    <div className="space-y-4 text-sm">
      <div>
        <p className="mb-1 text-xs text-gray-400 uppercase">Main Option</p>
        <div className="bg-theme-primary rounded-lg px-3 py-2 text-sm text-white">{data?.main}</div>
      </div>

      <div>
        <p className="mb-2 text-xs text-gray-400 uppercase">Secondary Options</p>
        <div className="flex flex-wrap gap-2">
          {data?.secondary?.map((opt: string) => (
            <Tag key={opt} className="rounded-lg border-0 bg-gray-100">
              {opt}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  </Card>
);
