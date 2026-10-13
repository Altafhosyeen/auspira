'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton, Spin } from 'antd';
import PageX from '@/components/shared/PageX';
import ProjectDetailHeader from '@/components/project/ProjectDetailHeader';
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';
import { useGetProjectById } from '@/hooks/modules/project';
import { useProjectStore } from '@/store/project.store';
import { slideUpFadeVariants } from '@/lib/config/motion.config';

export default function ProjectDashboard() {
  const { status, isAuthenticated } = useAuthGuard();

  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const setIsCreatingProject = useProjectStore((s) => s.setIsCreatingProject);
  const projectOptions = useProjectStore((s) => s.projectOptions);

  useEffect(() => {
    setIsCreatingProject(false);
    if (!selectedProjectId && projectOptions.length > 0) setSelectedProjectId(projectOptions[0].id);
  }, []);

  const { data: selectedProject, isLoading } = useGetProjectById({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  if (status === 'loading' || !isAuthenticated) {
    return (
      <main className="flex h-screen items-center justify-center p-6">
        <Spin size="large" tip="Loading…" />
      </main>
    );
  }

  return (
    <motion.div variants={slideUpFadeVariants} initial="hidden" animate="visible">
      <PageX heading="Project Details" className="gap-5">
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : selectedProjectId ? (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
            }}
            initial="hidden"
            animate="visible"
          >
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
                      secondaryOptions: selectedProject.secondaryOptionValues || [],
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
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="ds-body-strong text-slate-600">No project selected</p>
            <p className="ds-caption mt-1 text-slate-400">
              Use the dropdown in the header to select a project.
            </p>
          </div>
        )}

        {/* <motion.div variants={dashboardPageVariants} initial="hidden" animate="visible">
          <SignalsInbox />
        </motion.div>

        <motion.div variants={dashboardPageVariants} initial="hidden" animate="visible">
          <WatchtowerActionQueue />
        </motion.div> */}
      </PageX>
    </motion.div>
  );
}
