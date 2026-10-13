import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface ExecuteStagContractHeaderProps {
  onBack?: () => void;
}

export const ExecuteStagContractHeader: React.FC<ExecuteStagContractHeaderProps> = ({ onBack }) => (
  <div className="border-theme-border flex flex-col gap-2 border-b pb-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex items-center gap-3">
      <Button
        type="text"
        icon={<ArrowLeftOutlined className="text-theme-primary ds-body-large!" />}
        onClick={onBack}
        // className="h-10! w-10! border-[#d9e1ef]! bg-white! shadow-none transition hover:bg-[#f4f7fd]!"
      />

      <div className="flex items-center gap-3">
        <h2 className="heading-section my-0">Stage A · Executed Contract</h2>

        {/* <Tag
          color={'blue'}
          className="rounded-md bg-[#dcecff] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#2059d6]"
        >
          IN REVIEW
        </Tag> */}
      </div>
    </div>
  </div>
);

ExecuteStagContractHeader.displayName = 'ExecuteStagContractHeader';
