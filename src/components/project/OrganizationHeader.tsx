import React from 'react';
import { Card, Divider, Tag, Typography } from 'antd';
import {
  AppstoreOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

type OrganizationStatus = number | string | null | undefined;

interface OrganizationHeaderData {
  name?: string | null;
  status?: OrganizationStatus;
  industrySector?: string | null;
  address?: string | null;
  houseNumber?: string | null;
  expectedUsers?: number | null;
  rejectionReason?: string | null;
}

interface OrganizationHeaderProps {
  organisation?: OrganizationHeaderData | null;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}

const STATUS_CONFIG: Record<'rejected' | 'approved' | 'pending', { label: string; color: string }> =
  {
    rejected: { label: 'Rejected', color: 'red' },
    approved: { label: 'Approved', color: 'green' },
    pending: { label: 'In Review', color: 'gold' },
  };

const getStatusConfig = (status: OrganizationStatus) => {
  if (status === 0 || status === '0' || status === 'rejected') {
    return STATUS_CONFIG.rejected;
  }

  if (status === 1 || status === '1' || status === 'approved') {
    return STATUS_CONFIG.approved;
  }

  return STATUS_CONFIG.pending;
};

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      {icon}
    </div>

    <div className="flex flex-col">
      <Text className="text-xs! font-medium! tracking-wide text-slate-700! uppercase">{label}</Text>
      <Text className="text-sm! font-semibold! text-slate-700!">{value || '--'}</Text>
    </div>
  </div>
);

const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({ organisation }) => {
  const statusConfig = getStatusConfig(organisation?.status);

  return (
    <Card
      bordered={false}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-[#eef6fd] to-[#f8fbff] shadow-sm"
      bodyStyle={{ padding: 24 }}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Title level={3} className="mb-0! font-bold! text-slate-800!">
              {organisation?.name || '--'}
            </Title>

            <Tag
              color={statusConfig.color}
              className="rounded-full px-4 py-1 text-sm font-semibold"
            >
              {statusConfig.label}
            </Tag>

            <Tag color="blue" className="rounded-full px-4 py-1 text-sm font-medium">
              {organisation?.industrySector || '--'}
            </Tag>
          </div>

          <Text className="mt-2 block text-sm text-slate-500">
            Organisation overview and operational details
          </Text>
        </div>

        {/* <Button
          type="primary"
          icon={<InfoCircleOutlined />}
          className="h-11 rounded-xl px-5 font-medium shadow-sm"
        >
          View Full Details
        </Button> */}
      </div>

      <Divider className="my-6!" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoItem icon={<EnvironmentOutlined />} label="Address" value={organisation?.address} />
        <InfoItem icon={<HomeOutlined />} label="House Number" value={organisation?.houseNumber} />
        <InfoItem
          icon={<AppstoreOutlined />}
          label="Industry Sector"
          value={organisation?.industrySector}
        />
        <InfoItem
          icon={<TeamOutlined />}
          label="Expected Users"
          value={organisation?.expectedUsers?.toLocaleString() || '--'}
        />
      </div>

      {organisation?.rejectionReason && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <Text type="danger" className="font-medium">
            Rejection Reason:
          </Text>
          <div className="mt-1 text-sm text-red-500">{organisation.rejectionReason}</div>
        </div>
      )}
    </Card>
  );
};

export default OrganizationHeader;
