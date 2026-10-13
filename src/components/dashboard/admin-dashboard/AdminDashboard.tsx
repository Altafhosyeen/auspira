'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import PageX from '@/components/shared/PageX';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import OrganizationTable from '@/components/module/organization/OrganizationTable';
import { useGetOrganizations } from '@/hooks/modules/organization';
import { useTableChange } from '@/hooks/custom/useTableChange';
import {
  slideUpFadeVariants,
  containerVariants,
  blurScaleVariants,
} from '@/lib/config/motion.config';

function AdminDashboard() {
  const [paginationState, setPaginationState] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { data } = useGetOrganizations({
    skip: (paginationState.current - 1) * paginationState.pageSize,
    top: paginationState.pageSize,
  });

  return (
    <motion.div variants={slideUpFadeVariants} initial="hidden" animate="visible">
      <PageX
        heading="Admin Dashboard"
        subheading="Monitor platform operations, approvals, and security from one place."
        actions={
          <motion.div
            className="flex gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button icon={<FilterOutlined />}>Filters</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="primary" icon={<PlusOutlined />}>
                Add Organisation
              </Button>
            </motion.div>
          </motion.div>
        }
      >
        {/* Organisation  Table - Blur Scale Animation */}
        <motion.div
          variants={blurScaleVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.01 }}
        >
          <OrganizationTable
            data={(data?.items as any) ?? []}
            loading={false}
            onChange={useTableChange(setPaginationState)}
            pagination={{
              current: paginationState.current,
              pageSize: paginationState.pageSize,
              total: data?.count ?? 0,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onApprove={() => {}}
            onDeny={() => {}}
          />
        </motion.div>
      </PageX>
    </motion.div>
  );
}

export default AdminDashboard;
