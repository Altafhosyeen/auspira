import { create } from 'zustand';
import type { ProjectAlert } from '@/hooks/modules/project-alerts';

interface ProjectAlertBridgeState {
  /** Ephemeral, non-persisted — router.push cannot carry an object, so this bridges one
   * client-side navigation (e.g. Signal Review → Register Early Warning /new). */
  pendingProjectAlert: ProjectAlert | null;
  setPendingProjectAlert: (alert: ProjectAlert | null) => void;
}

export const useProjectAlertBridgeStore = create<ProjectAlertBridgeState>((set) => ({
  pendingProjectAlert: null,
  setPendingProjectAlert: (alert) => set({ pendingProjectAlert: alert }),
}));
