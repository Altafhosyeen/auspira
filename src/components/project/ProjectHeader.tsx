import { Button, Card, Tag, Typography } from 'antd';
const { Title, Text } = Typography;

import React from 'react';

const ProjectHeader = () => {
  return (
    <div>
      <Card className="rounded-xl border border-slate-200 !bg-[#b2cfe938]">
        <div className="flex flex-wrap items-center gap-3">
          <Title level={4} className="!mb-0 font-bold!">
            Wesfield Development Project
          </Title>
          <Tag color="blue-inverse" className="!m-0 rounded-full !px-3 !py-1 font-medium">
            NEC4 ECC
          </Tag>
          <Tag color={'cyan-inverse'} className="!m-0 rounded-full !px-3 !py-1">
            Option C
          </Tag>
          <Tag color="green-inverse" className="!m-0 rounded-full !px-3 !py-1">
            Active
          </Tag>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          <Text type="secondary">Westfield Corp</Text>
          <Text type="secondary">$125,000,0</Text>
          <Text type="secondary">715 days</Text>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-3">
          <Button type="text" className="!px-0 !text-sm !font-medium !text-slate-600">
            Project Brief &amp; Key Insights
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProjectHeader;
