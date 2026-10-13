import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectSelectOption } from '@/types/project/selection.types';

interface ProjectStoreState {
  selectedProjectId: string | null;
  projectOptions: ProjectSelectOption[];
  isCreatingProject: boolean;
  hasHydrated: boolean;
  setProjectOptions: (options: ProjectSelectOption[]) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  setIsCreatingProject: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      projectOptions: [],
      isCreatingProject: false,
      hasHydrated: false,
      setProjectOptions: (options) =>
        set((state) => {
          // Wait until the persisted selection has been rehydrated from storage.
          // Otherwise, on reload, options may arrive before rehydration and we would
          // wrongly fall back to options[0], replacing the user's selected project.
          if (!state.hasHydrated) {
            return { projectOptions: options };
          }

          const hasCurrentSelection =
            !!state.selectedProjectId &&
            options.some((option) => option.id === state.selectedProjectId);

          // Do not auto-select when user is actively creating a new project
          if (state.isCreatingProject) {
            return { projectOptions: options };
          }

          // Keep a persisted selection even if the options list is not populated yet.
          // Only fall back to the first project once we actually have options and the
          // persisted selection is genuinely gone from the list.
          if (state.selectedProjectId && options.length === 0) {
            return { projectOptions: options };
          }

          return {
            projectOptions: options,
            selectedProjectId: hasCurrentSelection
              ? state.selectedProjectId
              : (options[0]?.id ?? null),
          };
        }),
      setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
      setIsCreatingProject: (value) => set({ isCreatingProject: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      // Clears the persisted selection on logout/session-expiry so the next
      // signed-in user (on this device) never inherits a stale project.
      reset: () => set({ selectedProjectId: null, projectOptions: [], isCreatingProject: false }),
    }),
    {
      name: 'project-store',
      partialize: (state) => ({ selectedProjectId: state.selectedProjectId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
