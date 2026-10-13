'use client';

/**
 * OrgDashboard — pixel-matched to Figma design.
 */

import { Button, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import PageX from '@/components/shared/PageX';
import { useGetProjectById } from '@/hooks/modules/project';
import { useGetProjectAlerts } from '@/hooks/modules/project-alerts';
import { useGetProjectTaskCounts, useGetProjectTasks } from '@/hooks/modules/project-tasks';
import { slideUpFadeVariants } from '@/lib/config/motion.config';
import {
  mapAlertToSignalRow,
  mapProjectTaskToWatchtowerRow,
} from '@/lib/utils/org-dashboard.utils';
import { useProjectStore } from '@/store/project.store';
import type { ProjectDetailSummary } from '@/types/project/selection.types';
import { AwarenessPanel } from './AwarenessPanel';
import { RecentActivitySection } from './RecentActivitySection';
import { StatCardsSection } from './StatCardsSection';
import { WatchtowerPanel } from './WatchtowerPanel';

export default function OrgDashboard() {
  const router = useRouter();
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useProjectStore((state) => state.setSelectedProjectId);
  const setIsCreatingProject = useProjectStore((state) => state.setIsCreatingProject);

  const {
    data: projectAlertsData,
    isLoading: isProjectAlertsLoading,
    refetch: refetchProjectAlerts,
  } = useGetProjectAlerts({
    projectId: selectedProjectId ?? '',
    params: { top: 4 },
    enabled: !!selectedProjectId,
  });
  const {
    data: projectTasks,
    isLoading: isProjectTasksLoading,
    refetch: refetchProjectTasks,
  } = useGetProjectTasks({
    projectId: selectedProjectId!,
    enabled: !!selectedProjectId,
  });
  const {
    data: taskCounts,
    isLoading: isTaskCountsLoading,
    refetch: refetchTaskCounts,
  } = useGetProjectTaskCounts({
    projectId: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  // Reference of the selected project, shown as a chip next to the toolbar actions.
  const { data: selectedProject } = useGetProjectById<ProjectDetailSummary>({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });
  const projectReference = selectedProject?.referenceId?.trim();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Refreshes the Awareness and Watchtower panels together, so both read from the same moment.
  const handleRefresh = async () => {
    if (!selectedProjectId) return;
    setIsRefreshing(true);
    try {
      await Promise.all([refetchProjectAlerts(), refetchProjectTasks(), refetchTaskCounts()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const taskItems = projectTasks ?? [];
  const activeMattersCount = taskCounts?.activeCount ?? 0;
  const dueTodayCount = taskCounts?.dueTodayCount ?? 0;
  const dueThisWeekCount = taskCounts?.dueThisWeekCount ?? 0;
  const watchtowerRows = taskItems.slice(0, 4).map(mapProjectTaskToWatchtowerRow);
  const extraMattersCount = Math.max(activeMattersCount - watchtowerRows.length, 0);

  const totalAlertsCount = projectAlertsData?.meta.totalCount ?? 0;
  const awarenessSignals = (projectAlertsData?.items ?? []).map(mapAlertToSignalRow);

  return (
    <motion.div variants={slideUpFadeVariants} initial="hidden" animate="visible">
      <PageX
        heading="Dashboard"
        actions={
          <div className="flex items-center gap-2">
            {projectReference && (
              <Tooltip title={`Reference for ${selectedProject?.name ?? 'the selected project'}`}>
                <span className="badge-success mr-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide whitespace-nowrap">
                  <span className="font-medium opacity-100">Reference Number</span>
                  {projectReference}
                </span>
              </Tooltip>
            )}
            <Tooltip
              title={
                selectedProjectId
                  ? 'Refresh Awareness and Watchtower & Action Queue'
                  : 'Select a project first to refresh its dashboard data'
              }
            >
              {/* Wrapper element so the tooltip still fires while the button is disabled */}
              <span className="inline-block">
                <Button
                  type="default"
                  size="middle"
                  disabled={!selectedProjectId}
                  loading={isRefreshing}
                  onClick={handleRefresh}
                  aria-label="Refresh dashboard panels"
                  icon={<RefreshCw className="h-4 w-4" />}
                  className="!h-9 !rounded-lg !border-slate-200 !bg-white !px-3 !text-sm !font-medium !text-slate-600 !shadow-none hover:!border-slate-300 hover:!bg-slate-50"
                >
                  Refresh
                </Button>
              </span>
            </Tooltip>
            <Button
              type="default"
              size="middle"
              icon={<SlidersHorizontal className="h-4 w-4" />}
              className="!h-9 !rounded-lg !border-slate-200 !bg-white !px-3 !text-sm !font-medium !text-slate-600 !shadow-none hover:!border-slate-300 hover:!bg-slate-50"
            >
              Filters
            </Button>
            <DisabledTooltip
              disabled={!selectedProjectId}
              reason="Select a project first to edit it."
            >
              <Button
                type="default"
                size="middle"
                disabled={!selectedProjectId}
                onClick={() => router.push(`/projects/${selectedProjectId}`)}
                className="!h-9 !rounded-lg !border-slate-200 !bg-white !px-3 !text-sm !font-medium !text-slate-600 !shadow-none hover:!border-slate-300 hover:!bg-slate-50"
              >
                Edit Project
              </Button>
            </DisabledTooltip>
            <Button
              type="primary"
              size="middle"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setIsCreatingProject(true);
                setSelectedProjectId(null);
                router.push('/projects/new');
              }}
              className="!h-9 !rounded-lg !border-[#0C3F6A] !bg-[#0C3F6A] !px-3 !text-sm !font-semibold !shadow-none hover:!border-[#0A365A] hover:!bg-[#0A365A]"
            >
              New Project
            </Button>
          </div>
        }
        className="gap-3.5"
      >
        {/* Stat cards row */}
        <StatCardsSection />

        {/* Awareness + Watchtower — equal-width 2-col grid */}
        <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
          <AwarenessPanel
            totalAlertsCount={totalAlertsCount}
            isLoading={isProjectAlertsLoading}
            signals={awarenessSignals}
          />
          <WatchtowerPanel
            activeMattersCount={activeMattersCount}
            dueTodayCount={dueTodayCount}
            dueThisWeekCount={dueThisWeekCount}
            rows={watchtowerRows}
            extraMattersCount={extraMattersCount}
            isLoading={isProjectTasksLoading || isTaskCountsLoading}
          />
        </div>

        {/* Recent Activity full-width strip */}
        <RecentActivitySection />
      </PageX>
    </motion.div>
  );
}
