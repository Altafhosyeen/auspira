import type { ProjectEmail } from '@/components/contract-control-agent/action-queue.data';

export interface EmailThreadModalProps {
  open: boolean;
  projectId?: string | null;
  /** Outlook conversation id of the thread; the query stays disabled until set. */
  conversationId?: string | null;
  /** Shown in the header while the thread loads / when the API omits a subject. */
  subjectFallback?: string;
  /**
   * Pre-loaded messages to show when there's no real conversationId to fetch (e.g. a
   * demo/mock record that doesn't exist on the backend). Ignored once a real thread
   * fetch actually resolves — a genuinely empty real conversation still shows as empty.
   */
  fallbackMessages?: ProjectEmail[];
  onClose: () => void;
}

export type { ProjectEmail };

export type SortOrder = 'newest' | 'oldest';
export type Direction = 'sent' | 'received';

export interface ThreadAttachment {
  url: string;
  name: string;
  contentType?: string;
}
