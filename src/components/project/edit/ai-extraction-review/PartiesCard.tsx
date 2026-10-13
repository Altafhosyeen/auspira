'use client';

import React from 'react';
import { Card } from 'antd';
import { CardHeader } from './CardHeader';
import { TeamOutlined } from '@ant-design/icons';

export const PartiesCard = ({ data }: { data?: any }) => {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(data?.employer);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader icon={<TeamOutlined />} title="Parties" score={data.score} />

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 uppercase">Employer</p>

          {editing ? (
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              className="w-full rounded border px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          ) : (
            <p
              className="cursor-pointer rounded px-1 font-medium hover:bg-gray-100"
              onDoubleClick={() => setEditing(true)}
            >
              {value}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Contractor</p>
          <p className="font-medium">{data.contractor}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">Project Manager</p>
          <p className="font-medium">{data.pm}</p>
        </div>
      </div>
    </Card>
  );
};
