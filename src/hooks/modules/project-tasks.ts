import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, type ContractEntityType } from '@/constants';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { HelperFunctions } from '@/types';

export const PROJECT_TASKS_QUERY_KEY = ['project-tasks'] as const;

/** User assigned to a project task, as embedded in the task response. */
export interface ProjectTaskAssignedUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  /** Only the grouped action-queue endpoint sends this. */
  role?: number;
}

/** A single project task row, as returned by GET /api/project-tasks/{projectId}. */
export interface ProjectTask {
  id: string;
  projectId: string;
  parentTaskId?: string | null;
  dueDate?: string | null;
  dueDateTime?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  status: number;
  stage?: number;
  /** The grouped action-queue's own stage number, kept when `stage` is deliberately cleared.
   *  `stage` numbering is the EW Cl. 15 lifecycle's, so non-EW rows drop it to keep the EW
   *  stage rules from firing on a number that means something else — but the stage is still
   *  the backend's key for the task, so routing carries it here instead. */
  queueStage?: number;
  /** Backend's authoritative task kind — see `ContractEntityType`. */
  entityType?: ContractEntityType;
  entityId?: string;
  reference?: string | null;
  title: string;
  description: string | null;
  childTaskCount?: number;
  createdOn?: string;
  updatedOn?: string;
  assignedUsers: ProjectTaskAssignedUser[];
}

/* -------------------- GET /api/project-tasks/{projectId} -------------------- */

export const getProjectTasks = async <T = ProjectTask[]>(projectId: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECT_TASKS.LIST_BY_PROJECT.replace(':projectId', projectId),
    method: 'GET',
    skipLoader: true, // list fetch — avoid stacking the global overlay
  });
};

export const useGetProjectTasks = <T = ProjectTask[]>(
  { projectId, enabled }: { projectId: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_TASKS_QUERY_KEY, projectId],
    queryFn: async () => getProjectTasks<T>(projectId),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/* -------------------- GET /api/project-tasks/{projectId}/counts -------------------- */

/** Task counts for a project, as returned by GET /api/project-tasks/{projectId}/counts. */
export interface ProjectTaskCounts {
  activeCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
}

export const getProjectTaskCounts = async (projectId: string) => {
  return AUSPIRA<ProjectTaskCounts>({
    url: API_ENDPOINTS.PROJECT_TASKS.COUNTS.replace(':projectId', projectId),
    method: 'GET',
    skipLoader: true, // background stat fetch — avoid stacking the global overlay
  });
};

export const useGetProjectTaskCounts = (
  { projectId, enabled }: { projectId: string; enabled?: boolean },
  helpers?: HelperFunctions<ProjectTaskCounts>
) =>
  useQuery<ProjectTaskCounts>({
    queryKey: [...PROJECT_TASKS_QUERY_KEY, projectId, 'counts'],
    queryFn: () => getProjectTaskCounts(projectId),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });

/* -------------------- GET /api/project-tasks/project/{projectId}/by-entity/{entityId} -------------------- */

/**
 * Tasks raised against one entity (a compensation event, early warning, ...) on a project,
 * optionally narrowed to a single lifecycle stage. Used by the screens an action-queue row
 * links into, so they can show the deadline the queue was tracking without the row having
 * to hand it over in the URL.
 */
export const getProjectTasksByEntity = async <T = ProjectTask[]>(
  projectId: string,
  entityId: string,
  stage?: number
) => {
  const url = buildUrl(
    API_ENDPOINTS.PROJECT_TASKS.BY_ENTITY.replace(':projectId', projectId).replace(
      ':entityId',
      entityId
    ),
    { stage }
  );

  return AUSPIRA<T>({
    url,
    method: 'GET',
    skipLoader: true, // background fetch behind an already-rendered screen
  });
};

export const useGetProjectTasksByEntity = <T = ProjectTask[]>(
  {
    projectId,
    entityId,
    stage,
    enabled,
  }: { projectId?: string; entityId?: string; stage?: number; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_TASKS_QUERY_KEY, projectId, 'by-entity', entityId, stage],
    queryFn: async () => getProjectTasksByEntity<T>(projectId ?? '', entityId ?? '', stage),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId && !!entityId,
  });

/* -------------------- GET /api/project-tasks/{taskId}/children -------------------- */

export const getProjectTaskChildren = async <T = ProjectTask[]>(taskId: string) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECT_TASKS.CHILDREN.replace(':taskId', taskId),
    method: 'GET',
    skipLoader: true, // list fetch — avoid stacking the global overlay
  });
};

export const useGetProjectTaskChildren = <T = ProjectTask[]>(
  { taskId, enabled }: { taskId: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_TASKS_QUERY_KEY, taskId, 'children'],
    queryFn: async () => getProjectTaskChildren<T>(taskId),
    ...helpers,
    enabled: (enabled ?? true) && !!taskId,
  });

/* -------------------- PATCH /api/project-tasks/{taskId}/close -------------------- */

export const closeProjectTask = async (taskId: string) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.PROJECT_TASKS.CLOSE.replace(':taskId', taskId),
    method: 'PATCH',
  });
};

export const useCloseProjectTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeProjectTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_QUERY_KEY });
    },
  });
};

/* -------------------- POST /api/project-tasks/users/assign -------------------- */

export const assignProjectTask = async (taskId: string, userId: string) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.PROJECT_TASKS.ASSIGN,
    method: 'POST',
    body: { taskId, userId },
  });
};

export const useAssignProjectTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      assignProjectTask(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_QUERY_KEY });
    },
  });
};

/* -------------------- POST /api/project-tasks/users/unassign -------------------- */

export const unassignProjectTask = async (taskId: string, userId: string) => {
  return AUSPIRA<void>({
    url: API_ENDPOINTS.PROJECT_TASKS.UNASSIGN,
    method: 'POST',
    body: { taskId, userId },
  });
};

export const useUnassignProjectTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      unassignProjectTask(taskId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_QUERY_KEY });
    },
  });
};

/* -------------------- GET /api/project-tasks/project/{projectId}/action-queue-grouped -------------------- */

/** A single task within an action-queue group. */
export interface ActionQueueGroupedTask {
  taskId: string;
  title: string;
  /** No longer sent by the grouped endpoint — `clause` replaced it. Kept optional for older payloads. */
  clauseReference?: string | null;
  assignedUsers: ProjectTaskAssignedUser[];
  dueDateTime: string | null;
  /** Backend sends this as free-form text (e.g. "High"/"Low") — kept as string, not a fixed union. */
  priority: string | null;
  /** Only a preview of the next stage (title + due date) — not the full task shape. */
  nextTask: { title: string; dueDateTime: string | null } | null;
  stage: number | null;
  /** NEC4 clause this stage is raised under, as a bare number ("62", "15.2") — sent as an empty
   *  string, not null, for stages the backend has no clause mapping for. */
  clause?: string | null;
  /** Prose explanation of `clause`. Same empty-string-when-absent convention. */
  clauseDescription?: string | null;
  /** The real record's own id this stage is actually about (a Compensation Event's GUID for a
   *  "Review Quotation" stage, say) — distinct from `group.groupId`, which is the group's shared
   *  human code ("CE-0002") rather than a routable id. Only some stages carry one. */
  subEntityId?: string | null;
}

/** A group of tasks sharing an entity type + parent early warning, as shown on the action queue view. */
export interface ActionQueueGroup {
  groupId: string;
  /** Backend's grouping key (entity type of the parent). Sent as `ContractEntityType`'s numeric
   *  value ("1") for kinds it covers, or as a PascalCase name ("EarlyWarningMeeting") for the
   *  finer-grained kinds it doesn't — always run through `normalizeTypeCode`, never compared raw. */
  groupType: string | number;
  title: string;
  reference: string | null;
  context: string | null;
  tasks: ActionQueueGroupedTask[];
}

export interface ActionQueueGroupedResponse {
  groups: ActionQueueGroup[];
}

export const getProjectActionQueueGrouped = async <T = ActionQueueGroupedResponse>(
  projectId: string
) => {
  return AUSPIRA<T>({
    url: API_ENDPOINTS.PROJECT_TASKS.ACTION_QUEUE_GROUPED.replace(':projectId', projectId),
    method: 'GET',
    skipLoader: true, // list fetch — avoid stacking the global overlay
  });
};

export const useGetProjectActionQueueGrouped = <T = ActionQueueGroupedResponse>(
  { projectId, enabled }: { projectId: string; enabled?: boolean },
  helpers?: HelperFunctions<T>
) =>
  useQuery<T>({
    queryKey: [...PROJECT_TASKS_QUERY_KEY, projectId, 'action-queue-grouped'],
    queryFn: async () => getProjectActionQueueGrouped<T>(projectId),
    ...helpers,
    enabled: (enabled ?? true) && !!projectId,
  });
