'use client';

import React from 'react';
import EmailThreadList, { type EmailThreadListItem } from '@/components/shared/EmailThreadList';
import { useGetEarlyWarningConversations } from '@/hooks/modules/early-warning';
import { EmailThreadModal } from '../contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import EarlyWarningAfterMeetingCard from './EarlyWarningAfterMeetingCard';

interface EarlyWarningThreadsPanelProps {
  earlyWarningId: string;
  projectId?: string;
  closed?: boolean;
}

export default function EarlyWarningThreadsPanel({
  earlyWarningId,
  projectId,
  closed,
}: EarlyWarningThreadsPanelProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState<string>('');

  const { data: conversations = [], isLoading } = useGetEarlyWarningConversations({
    id: earlyWarningId,
  });

  // Conversation summaries carry no per-message id, so the conversation id is the row key —
  // it is also what the modal fetches the full thread with.
  const items: EmailThreadListItem[] = conversations.map((msg: any) => ({
    id: msg.conversationId,
    senderEmail: msg.senderEmail,
    subject: msg.subject,
    body: msg.body,
    timestampUtc: msg.timestampUtc,
    boxType: msg.boxType,
    source: msg.source,
    accountEmail: msg.userEmail,
  }));

  const handleThreadClick = (item: EmailThreadListItem) => {
    setSelectedConversationId(item.id);
    setSelectedSubject(item.subject);
    setModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <EmailThreadList
          items={items}
          isLoading={isLoading}
          emptyDescription="Messages linked to this early warning will appear here once they arrive."
          onSelect={handleThreadClick}
        />
      </div>

      <div className="space-y-4 lg:col-span-1">
        <div className="hidden h-4 lg:block" aria-hidden="true" />

        <EarlyWarningAfterMeetingCard earlyWarningId={earlyWarningId} closed={closed} />
      </div>

      <EmailThreadModal
        open={modalOpen}
        projectId={projectId}
        conversationId={selectedConversationId}
        subjectFallback={selectedSubject}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
