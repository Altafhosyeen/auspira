import { CalendarOutlined } from '@ant-design/icons';
import { Card, Timeline } from 'antd';
import { CardHeader } from './CardHeader';

export const KeyDatesCard = ({ data }: { data?: any }) => (
  <Card className="rounded-2xl shadow-sm">
    <CardHeader icon={<CalendarOutlined />} title="Key Dates" score={data.score} />

    <Timeline
      className="mt-2"
      items={data?.dates?.map((item: any, idx: number) => ({
        color: idx === data?.dates?.length - 1 ? 'red' : idx === 0 ? 'blue' : 'gray',
        content: (
          <div className="pb-2">
            <p className="text-xs text-gray-400 uppercase">{item.label}</p>
            <p className="font-medium text-gray-800">{item.value}</p>
          </div>
        ),
      }))}
    />
  </Card>
);
