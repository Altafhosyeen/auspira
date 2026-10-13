import { useMemo } from 'react';
import { getAttachments } from '@/components/contract/cross-reference-contract/EmailThreadModal/utils';
import type {
  CompensationEvent,
  CompensationEventEvidenceFile,
} from '../types/compensation-event.types';
import { toConversationEvidenceFiles } from '../utils/compensation-event-api.utils';
import { useGetAttachmentsByEntity } from './use-attachments';
import { useGetCompensationEventEmailThread } from './use-project-email-thread';

// Matches a locally-held row the way the attachments endpoint matches its own — on the
// file name and type. Only the rows the endpoint never sees go through this.
const matchesTerm = (file: CompensationEventEvidenceFile, needle: string) =>
  file.name.toLowerCase().includes(needle) || file.kind.toLowerCase().includes(needle);

// Shared by the Documents tab and the detail page's tab-badge count — same merge/dedupe of
// attachments-API files, the event's own evidence rows and email-thread attachments, so the
// badge always matches what the tab itself lists.
// `term` is handed to the attachments endpoint, which searches the whole set rather than
// the page already fetched.
export const useCompensationEventDocuments = (
  event: CompensationEvent | undefined,
  term?: string
) => {
  const { data: attachments, isLoading } = useGetAttachmentsByEntity({
    entityId: event?.id,
    projectId: event?.projectId,
    term,
  });
  const { messages: emailMessages, isLoading: isEmailLoading } = useGetCompensationEventEmailThread(
    {
      compensationEventId: event?.id,
      projectId: event?.projectId,
    }
  );

  const emailFiles = useMemo(() => {
    const emailAttachments = emailMessages.flatMap((email) => getAttachments(email));
    return toConversationEvidenceFiles(emailAttachments, emailMessages);
  }, [emailMessages]);

  const files = useMemo(() => {
    // The endpoint already narrowed `attachments`; the other two sources it never sees, so
    // they are matched here on the same fields rather than left unfiltered beside the
    // endpoint's own results.
    const needle = term?.trim().toLowerCase();
    const localFiles = [...emailFiles, ...(event?.evidence ?? [])];
    const narrowedLocalFiles = needle
      ? localFiles.filter((file) => matchesTerm(file, needle))
      : localFiles;

    // `emailFiles` and `attachments` can both carry the same file (the attachments API also
    // returns email-sourced uploads, flagged `isEmailAttachment`) — `emailFiles` go first so
    // the attachments-API copy, which alone carries a real size, wins the dedupe below.
    const mergedFiles = [...narrowedLocalFiles, ...(attachments ?? [])];
    return Array.from(
      new Map(mergedFiles.map((file) => [file.filePath || file.id, file])).values()
    );
  }, [attachments, emailFiles, event?.evidence, term]);

  return { files, isLoading: isLoading || isEmailLoading };
};
