import { notification } from 'antd';
import { useMemo, useState } from 'react';
import type { ProjectEmail } from '@/components/contract-control-agent/action-queue.data';
import { downloadAttachment } from '@/hooks/modules/attachments';
import { useGetProjectEmailConversationDetails } from '@/hooks/modules/project';
import { useGetProjectEmailThread } from '@/hooks/modules/project-email-thread';
import { useProjectStore } from '@/store/project.store';
import { COMPENSATION_EVENT_NOTICE_COPY } from '../constants/compensation-event-notice.constants';
import type { CompensationEventEvidenceFile } from '../types/compensation-event.types';
import { toConversationEvidenceFiles } from '../utils/compensation-event-api.utils';
import { useGetEntityConversations } from './use-project-email-thread';

const copy = COMPENSATION_EVENT_NOTICE_COPY.messages;

// Documents & Communication reads one mail conversation: it carries both the messages
// behind "View" on the Email Thread tile and the files behind "View" on the Attachment
// tile. Every screen that shows that rail wires it the same way, so the wiring lives here
// rather than being re-derived per page — a page that forgets it renders an empty rail.
export const useConversationDocuments = ({
  projectId,
  conversationId,
}: {
  projectId?: string;
  conversationId?: string;
}) => {
  const selectedProjectId = useProjectStore((store) => store.selectedProjectId);
  const [threadOpen, setThreadOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  // The caller's project wins — the selected project only covers a screen that has no
  // record of its own to read the project off.
  const resolvedProjectId = projectId ?? selectedProjectId ?? undefined;

  const { data: conversationDetails } = useGetProjectEmailConversationDetails({
    projectId: resolvedProjectId,
    conversationId,
  });
  // The endpoint answers with a list; a conversation id resolves to at most one entry.
  const details = conversationDetails?.[0];
  const attachments = useMemo(() => details?.attachments ?? [], [details]);

  // The summary endpoint names each file but not who sent it or when, so the thread fills
  // those two columns in. Only fetched once the list is actually on screen — the tile's
  // count comes off the summary above, and the bodies are far heavier than it is.
  const { data: threadMessages, isLoading: isThreadLoading } = useGetProjectEmailThread<
    ProjectEmail[]
  >(
    {
      projectId: attachmentsOpen ? resolvedProjectId : undefined,
      conversationId: attachmentsOpen ? conversationId : undefined,
    },
    { staleTime: 60_000 }
  );

  const attachmentFiles = useMemo(
    () => toConversationEvidenceFiles(attachments, threadMessages),
    [attachments, threadMessages]
  );

  // Attachment urls point at private storage, so a plain link to one 404s for the browser —
  // every download is proxied through the backend, one request per file.
  const downloadFile = async (file: CompensationEventEvidenceFile) => {
    const url = file.filePath;
    if (!url) {
      notification.info({ message: copy.attachmentUnavailable });
      return;
    }

    try {
      await downloadAttachment({ url, fileName: file.name });
    } catch {
      // The global handler surfaces an API reason when there is one; this covers the rest.
      notification.error({ message: copy.downloadFailed });
    }
  };

  return {
    conversationId,
    projectId: resolvedProjectId,
    emailCount: details?.totalEmailsCount,
    // The list the modal actually shows, not the DTO's own count — the tile must never
    // promise files the click cannot deliver.
    attachmentCount: attachments.length,
    attachmentFiles,
    attachmentsLoading: isThreadLoading,
    threadOpen,
    openThread: () => setThreadOpen(true),
    closeThread: () => setThreadOpen(false),
    attachmentsOpen,
    openAttachments: () => setAttachmentsOpen(true),
    closeAttachments: () => setAttachmentsOpen(false),
    downloadFile,
  };
};

// The same rail on a screen reached from the register rather than from a signal: the
// compensation event owns the conversations its mail arrived on, so the thread is resolved
// off the event id instead of off an alert.
export const useCompensationEventDocuments = ({
  compensationEventId,
  projectId,
}: {
  compensationEventId?: string;
  projectId?: string;
}) => {
  const { data: conversations } = useGetEntityConversations({ entityId: compensationEventId });

  // An event can carry more than one conversation; the rail reports the first, which is
  // the thread the event itself was raised from.
  const conversationId = conversations?.[0]?.conversationId;

  return useConversationDocuments({ projectId, conversationId });
};
