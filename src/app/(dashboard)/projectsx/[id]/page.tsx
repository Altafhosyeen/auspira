'use client';

import { useEffect } from 'react';
import ProjectWorkflow from '@/components/module/project/ProjectWorkflow';
import { useParams } from 'next/navigation';

import { useRouter } from 'nextjs-toploader/app';
import { useProjectStore } from '@/store/project.store';

export default function ProjectPage() {
  const params = useParams();
  const isCreateNew = params?.id === 'new';
  const router = useRouter();
  const routeProjectId = typeof params?.id === 'string' ? params.id : '';

  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useProjectStore((state) => state.setSelectedProjectId);
  const setIsCreatingProject = useProjectStore((state) => state.setIsCreatingProject);

  useEffect(() => {
    if (isCreateNew) {
      setIsCreatingProject(true);
      setSelectedProjectId(null);
      return;
    }
    // Leaving new project page — reset creating flag
    setIsCreatingProject(false);
    // Seed global selection from URL when user lands directly on a detail route.
    if (!selectedProjectId && routeProjectId) {
      setSelectedProjectId(routeProjectId);
      return;
    }

    // Keep detail route synchronized with the globally selected project.
    if (selectedProjectId && routeProjectId && selectedProjectId !== routeProjectId) {
      router.replace('/projects/' + selectedProjectId);
    }
  }, [
    isCreateNew,
    routeProjectId,
    router,
    selectedProjectId,
    setIsCreatingProject,
    setSelectedProjectId,
  ]);

  return <ProjectWorkflow key={selectedProjectId ?? routeProjectId} />;
}
