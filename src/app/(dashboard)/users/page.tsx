'use client';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
import ButtonX from '@/components/antd/ButtonX';
import AddUserDrawer from '@/components/module/users/AddUserDrawer';
import UserStatsCard from '@/components/module/users/UserStatsCard';
import UsersTable from '@/components/module/users/UsersTable';
import PageX from '@/components/shared/PageX';
import SearchInputX from '@/components/shared/Search/SearchInputX';
import { USER_STATS_CONFIG } from '@/constants/stats.constants';
import { useGetUserStats, useGetUsers } from '@/hooks/modules/users';
import type { IMetaPaginatedResponse, User } from '@/types';

export default function Page() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const skip = (currentPage - 1) * pageSize;

  const { data, isLoading } = useGetUsers<IMetaPaginatedResponse<User>>({
    enabled: true,
    skip,
    top: pageSize,
    term: debouncedSearchTerm,
  });
  const { data: statsData } = useGetUserStats();

  const totalUsers = data?.meta?.totalCount || 0;

  const displayStats = USER_STATS_CONFIG.map((config) => ({
    title: config.title,
    value: statsData?.[config.key] || 0,
    color: config.color,
    icon: config.icon,
  }));

  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageX
      heading="Users Overview"
      subheading="Set up your Users to get started wth Auspira."
      actions={
        <>
          <ButtonX type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
            Add User
          </ButtonX>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((item) => (
          <UserStatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            color={item.color}
            icon={item.icon}
          />
        ))}
      </div>
      <div className="mt-5 flex w-full items-center justify-between">
        <SearchInputX
          allowClear
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          placeholder="Search by name and email"
          className="w-75! sm:max-w-sm"
        />
        {/* <ButtonX icon={<FilterOutlined />}>Filters</ButtonX> */}
      </div>
      <UsersTable
        data={data?.items}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalUsers,
          onChange: handlePaginationChange,
        }}
      />
      <AddUserDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </PageX>
  );
}
