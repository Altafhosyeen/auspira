'use client';

import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import PageX from '@/components/shared/PageX';
import { Button } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import OrgFilters from '@/components/dashboard/org-dashboard/OrgFilters';
import MetricsDashboard from '@/components/dashboard/org-dashboard/MetricsDashboard';
import ContractAnalysisCard from '@/components/dashboard/org-dashboard/ContractAnalysisCard';
import ProjectHealthCard from '@/components/dashboard/org-dashboard/ProjectHealthCard';
import ContractOverviewCard from '@/components/dashboard/org-dashboard/ContractOverviewCard';
import ProjectChartDashboard from '@/components/dashboard/org-dashboard/ProjectChartDashboard';
import {
  slideUpFadeVariants,
  containerVariants,
  blurScaleVariants,
  elasticScaleVariants,
  slideRightFadeVariants,
  dashboardPageVariants,
} from '@/lib/config/motion.config';

const DASHBOARD_DATA = [
  { id: '1', label: 'CE-017 - Access Road', value: 65, status: 'warning' },
  { id: '2', label: 'CE-017 - Access Road', value: 82, status: 'success' },
  { id: '3', label: 'CE-017 - Access Road', value: 70, status: 'warning' },
  { id: '4', label: 'CE-017 - Access Road', value: 65, status: 'warning' },
  { id: '5', label: 'CE-213 - Access Road', value: 60, status: 'warning' },
  { id: '6', label: 'CE-234 - Access Road', value: 40, status: 'danger' },
];

export default function OrganizationDashboard() {
  const { status, isAuthenticated } = useAuthGuard();

  if (status === 'loading' || !isAuthenticated) return <main className="p-6">Loading...</main>;

  return (
    <motion.div variants={slideUpFadeVariants} initial="hidden" animate="visible">
      <PageX
        heading="Dashboard"
        subheading=""
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
                Add New
              </Button>
            </motion.div>
          </motion.div>
        }
      >
        <motion.div variants={blurScaleVariants} initial="hidden" animate="visible">
          <OrgFilters />
        </motion.div>
        <motion.div className="mt-6 rounded-lg bg-white" initial="hidden" animate="visible">
          <MetricsDashboard />
        </motion.div>
        <motion.div
          className="mt-6 grid gap-6 md:grid-cols-2"
          variants={dashboardPageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={elasticScaleVariants} whileHover="hover" custom={0}>
            <ContractAnalysisCard />
          </motion.div>
          <motion.div variants={elasticScaleVariants} whileHover="hover" custom={1}>
            <ProjectHealthCard />
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-6"
          variants={slideRightFadeVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ x: 5 }}
        >
          <ContractOverviewCard
            title="Contract Control Agent Overview"
            percentage={62}
            description="Protecting your commercial position"
            items={DASHBOARD_DATA as any}
          />
        </motion.div>
        <motion.div
          variants={blurScaleVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.01 }}
        >
          <ProjectChartDashboard />
        </motion.div>
      </PageX>
    </motion.div>
  );
}
