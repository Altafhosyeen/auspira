'use client';

import ContractAnalysisCard from '@/components/dashboard/org-dashboard/ContractAnalysisCard';
import OrganizationHeader from '@/components/project/OrganizationHeader';
import ProjectDetailHeader from '@/components/project/ProjectDetailHeader';
import PageX from '@/components/shared/PageX';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useGetOrganizationMe } from '@/hooks/modules/organization';
import { useGetProjectById } from '@/hooks/modules/project';
import { dashboardPageVariants, elasticScaleVariants } from '@/lib/config/motion.config';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Skeleton, Spin } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectHealthCard from '@/components/dashboard/org-dashboard/ProjectHealthCard';
import { useProjectStore } from '@/store/project.store';

export default function ProjectsPage() {
  const { status, isAuthenticated } = useAuthGuard();
  const router = useRouter();
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useProjectStore((state) => state.setSelectedProjectId);
  const setIsCreatingProject = useProjectStore((state) => state.setIsCreatingProject);
  const projectOptions = useProjectStore((state) => state.projectOptions);
  const { data: organizationMe } = useGetOrganizationMe();

  // When landing back on /projects, stop creating mode and restore first project if none selected
  useEffect(() => {
    setIsCreatingProject(false);
    if (!selectedProjectId && projectOptions.length > 0) {
      setSelectedProjectId(projectOptions[0].id);
    }
  }, []);

  const { data: selectedProject, isLoading } = useGetProjectById({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  if (status === 'loading' || !isAuthenticated) {
    return (
      <main className="flex h-screen items-center justify-center p-6">
        <Spin size="large" tip="Loading projects..." />
      </main>
    );
  }
  return (
    <PageX
      heading="Project and Organisation  Details"
      subheading="Manage organisation and project information from a single workspace."
      actions={
        <>
          {/* <Button icon={<FilterOutlined />}>Filters</Button> */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsCreatingProject(true);
              setSelectedProjectId(null);
              router.push('/projects/new');
            }}
          >
            New Project
          </Button>
        </>
      }
      className="gap-5"
    >
      <OrganizationHeader organisation={organizationMe as any} />

      {selectedProjectId && (
        <>
          <div className="mt-6 flex justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <h2 className="heading-section">Project Detail</h2>
              <p className="mt-1 text-sm text-slate-500">
                Project information below updates instantly when you change the selector in the
                header.
              </p>
            </div>
            <Button type="primary" onClick={() => router.push(`/projects/${selectedProjectId}`)}>
              View Detail
            </Button>
          </div>
          <ProjectDetailHeader
            project={
              selectedProject
                ? {
                    name: selectedProject.name,
                    referenceId: selectedProject.referenceId,
                    description: selectedProject.description,
                    necEdition: selectedProject.necEdition,
                    necForm: selectedProject.necForm,
                    mainOption: selectedProject.mainOption,
                    secondaryOptions: selectedProject.secondaryOptions,
                    aiAssistenceMode: selectedProject.aiAssistenceMode,
                    contractValue: selectedProject.contractValue,
                    currency: selectedProject.currency,
                    startDate: selectedProject.startDate,
                    completionDate: selectedProject.completionDate,
                    defectDate: selectedProject.defectDate,
                    siteAddress: selectedProject.siteAddress,
                    postcode: selectedProject.postcode,
                    employer: selectedProject.employer,
                    contractor: selectedProject.contractor,
                    projectManager: selectedProject.projectManager,
                    supervisor: selectedProject.supervisor,
                    status: selectedProject.status,
                    createdOn: selectedProject.createdOn,
                  }
                : null
            }
          />
        </>
      )}
      {/* <div className="mt-6 rounded-lg bg-white">
        <MetricsDashboard />
      </div> */}
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
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
      )}
    </PageX>
  );
}
