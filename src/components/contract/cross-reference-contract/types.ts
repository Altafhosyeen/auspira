import type { Finding } from '@/components/module/project/third-step/cross-reference/types';

// Defined alongside `Finding` so the shared drawer can use it; re-exported here
// so existing contract-module imports keep working.
export type { WorkflowStatus } from '@/components/module/project/third-step/cross-reference/types';
import type { WorkflowStatus } from '@/components/module/project/third-step/cross-reference/types';

/** Details captured once a finding has been accepted by the assignee. */
export interface AcceptedInfo {
  /** Person who confirmed, e.g. "Sarah Collins". */
  name: string;
  /** Their role, e.g. "PM". */
  role: string;
  /** Confirmation summary, e.g. "Accepted 25 Jun · confirmed by PM". */
  note: string;
}

/** A finding decorated with the contract-registry email workflow. */
export interface ContractFinding extends Finding {
  status: WorkflowStatus;
  accepted?: AcceptedInfo;
}
