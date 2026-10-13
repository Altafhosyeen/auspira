import { Tag } from 'antd';

export const CardHeader = ({ icon, title, score }: { icon: any; title: any; score: any }) => (
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2 font-semibold text-gray-800">
      {icon}
      <span>{title}</span>
    </div>
    <Tag className="rounded-full border-0 bg-blue-100 text-blue-700">✦ {score}%</Tag>
  </div>
);
