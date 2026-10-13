'use client';

import { Card } from 'antd';
import { Users, UserCheck, Mail, UserPlus } from 'lucide-react';

/** ✅ Central icon map */
export const iconMap = {
  users: Users,
  userCheck: UserCheck,
  mail: Mail,
  userPlus: UserPlus,
};

/** ✅ Strict icon type (auto-inferred) */
export type IconType = keyof typeof iconMap;

type PropsUserStatusCard = {
  title: string;
  value: number;
  color: string;
  icon: IconType;
};

export default function UserStatsCard({ title, value, color, icon }: PropsUserStatusCard) {
  const Icon = iconMap[icon];

  return (
    <Card
      bordered={false}
      className="rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md"
      styles={{ body: { padding: 16 } }} // ✅ AntD v6 fix
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${color} flex items-center justify-center`}>
          <Icon size={18} />
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-500">{title}</span>

          <span className="text-2xl leading-none font-semibold text-gray-900">{value}</span>

          <span className="mt-1 text-xs text-gray-400">Across Organisation </span>
        </div>
      </div>
    </Card>
  );
}
