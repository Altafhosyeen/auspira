import React from 'react';
import { Card, Button, Divider } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

const LogItem = ({
  title,
  desc,
  showDivider,
}: {
  title: string;
  desc: string;
  showDivider: boolean;
}) => (
  <div className="flex items-start gap-3">
    <CheckCircleFilled className="mt-1 text-base text-blue-700" />

    <div className="flex-1">
      <p className="font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-500">{desc}</p>

      {showDivider && <Divider className="my-0 p-0" />}
    </div>
  </div>
);

export default function SetupCompleteCard() {
  const logs = [
    {
      title: 'Contract Registry created',
      desc: 'Secure vault initialized.',
    },
    {
      title: 'Legal snapshot created',
      desc: 'Baseline compliance verified.',
    },
    {
      title: 'CCA/OCA activated',
      desc: 'Analysis models deployed.',
    },
  ];
  return (
    <div className="flex items-center justify-center bg-[#F5F7FB] p-6">
      <Card className="w-full max-w-md rounded-2xl border border-gray-200 text-center shadow-sm">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <CheckCircleFilled className="text-2xl text-blue-800" />
          </div>
        </div>

        {/* Title */}
        <h2 className="heading-section">Setup Complete</h2>

        {/* Description */}
        <p className="mx-auto mt-2 max-w-md leading-tight text-gray-500">
          Your project environment has been successfully configured and is ready for use.
        </p>

        {/* Tag */}
        <div className="mt-4 flex justify-center">
          <div className="bg-theme-primary w-fit rounded-full border-0 px-3 py-1 text-xs tracking-wide text-white">
            ● ACTIVE PROJECT
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {/* Log Section */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-[#F7F9FC] p-5 text-left">
            <p className="mb-3 text-xs tracking-wide text-gray-400 uppercase">
              System Activation Log
            </p>

            {logs.map((log, i) => (
              <LogItem key={log.title} {...log} showDivider={i !== logs.length - 1} />
            ))}
          </div>

          {/* Button */}
          <Button
            type="primary"
            size="large"
            className="mt-6 h-12 w-full rounded-lg border-0 bg-blue-900 hover:bg-blue-800"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
