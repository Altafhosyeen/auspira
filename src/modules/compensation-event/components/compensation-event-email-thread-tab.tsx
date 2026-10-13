'use client';

import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/project.store';
import { useGetEntityConversations } from '../hooks/use-project-email-thread';
import type { CompensationEvent } from '../types/compensation-event.types';
import { resolveCompensationEventConversationThread } from '../utils/project-email.utils';
import CompensationEventEmailThread from './compensation-event-email-thread';

interface CompensationEventEmailThreadTabProps {
  event: CompensationEvent;
}

// Container — one row per conversation tied to the CE, same pattern as the Early Warning
// detail page's Email Thread panel: the conversation summary is enough for the list, and
// the full per-message thread only loads once a row is clicked (inside `EmailThreadModal`).
// The shared project-emails endpoint is the source of truth; `event.thread` only stands in
// while the demo event (or a real CE with no logged correspondence yet) has none.
// Owns the search term so it reaches the endpoint, the way the Audit Trail tab does.
const CompensationEventEmailThreadTab = ({ event }: CompensationEventEmailThreadTabProps) => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { data: conversations, isLoading } = useGetEntityConversations({
    entityId: event.id,
    term: debouncedTerm,
  });

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;

  // Once a search is on, an empty response means nothing matched — falling back to the
  // event's own thread there would show unfiltered rows.
  const threadMessages = resolveCompensationEventConversationThread(
    conversations ?? [],
    debouncedTerm ? [] : event.thread
  );

  return (
    <CompensationEventEmailThread
      messages={threadMessages}
      projectId={selectedProjectId}
      term={term}
      onTermChange={setTerm}
      isSearching={Boolean(debouncedTerm)}
    />
  );
};

export default CompensationEventEmailThreadTab;
