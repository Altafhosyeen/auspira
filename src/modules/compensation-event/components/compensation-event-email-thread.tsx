'use client';

import { DownOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';
import { useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import type { ProjectEmail } from '@/components/contract/cross-reference-contract/EmailThreadModal/types';
import { emailDirection } from '@/components/contract-control-agent/email-thread-list.utils';
import EmailThreadList, { type EmailThreadListItem } from '@/components/shared/EmailThreadList';
import {
  COMPENSATION_EVENT_EVIDENCE_COPY,
  EVIDENCE_LIST_PAGE_SIZE,
} from '../constants/compensation-event-evidence.constants';
import { EVIDENCE_SIZES } from '../constants/compensation-event-evidence.theme';
import { REGISTER_COLORS } from '../constants/compensation-event-register.theme';
import type { CompensationEventThreadMessage } from '../types/compensation-event.types';
import { toFallbackProjectEmail } from '../utils/project-email.utils';
import CompensationEventDetailPanel from './compensation-event-detail-panel';
import CompensationEventListToolbar from './compensation-event-list-toolbar';

const {
  threadTitle,
  noMessages,
  loadMore,
  activitiesUnit,
  threadSearchPlaceholder,
  noThreadSearchResults,
  inboundFilterLabel,
  outboundFilterLabel,
} = COMPENSATION_EVENT_EVIDENCE_COPY;

type ThreadDirection = 'in' | 'out';

const DIRECTION_OPTIONS: { value: ThreadDirection; label: string }[] = [
  { value: 'in', label: inboundFilterLabel },
  { value: 'out', label: outboundFilterLabel },
];

interface CompensationEventEmailThreadProps {
  // Already narrowed by the endpoint's own `term` search — never filtered again here.
  messages: CompensationEventThreadMessage[];
  projectId?: string | null;
  term: string;
  onTermChange: (term: string) => void;
  /** True once a search term is live, so the empty state reads "no matches". */
  isSearching?: boolean;
}

// Presentational — the Email Thread tab: the shared correspondence list (the same rows the
// Early Warning detail page renders) inside the CE panel chrome, with paged loading.
const CompensationEventEmailThread = ({
  messages,
  projectId,
  term,
  onTermChange,
  isSearching = false,
}: CompensationEventEmailThreadProps) => {
  const [visibleCount, setVisibleCount] = useState(EVIDENCE_LIST_PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFallback, setSelectedFallback] = useState<ProjectEmail[] | undefined>(undefined);
  const [directions, setDirections] = useState<ThreadDirection[]>([]);

  // Only the direction filter narrows in the browser — the term is the endpoint's.
  // Direction is resolved with the same helper the row itself uses, so a filtered row
  // always carries the badge the filter claimed it had.
  const matchedMessages = messages.filter((message) => {
    if (directions.length === 0) return true;
    return directions.includes(
      emailDirection({
        senderEmail: message.authorName,
        accountEmail: message.accountEmail,
        body: message.body,
        boxType: message.boxType ?? (message.authorParty === 'CONTRACTOR' ? 1 : 0),
        source: message.source,
      })
    );
  });

  const visibleMessages = matchedMessages.slice(0, visibleCount);
  const hasMore = visibleCount < matchedMessages.length;
  const isFiltered = isSearching || directions.length > 0;

  // A new term or filter re-pages from the top, so the count under the list always matches.
  const handleSearch = (value: string) => {
    onTermChange(value);
    setVisibleCount(EVIDENCE_LIST_PAGE_SIZE);
  };

  const handleDirections = (next: ThreadDirection[]) => {
    setDirections(next);
    setVisibleCount(EVIDENCE_LIST_PAGE_SIZE);
  };

  const clearAll = () => {
    onTermChange('');
    setDirections([]);
    setVisibleCount(EVIDENCE_LIST_PAGE_SIZE);
  };

  // Every direction signal the message carries is handed to the list rather than pre-derived,
  // so CE rows classify exactly like Early Warning rows. Demo/register-supplied rows carry
  // none of them, so the party the register resolved stands in as the `boxType` flag.
  const items: EmailThreadListItem[] = visibleMessages.map((item) => ({
    id: item.id,
    senderEmail: item.authorName,
    subject: item.subject,
    body: item.body,
    timestampUtc: item.sentAt,
    boxType: item.boxType ?? (item.authorParty === 'CONTRACTOR' ? 1 : 0),
    source: item.source,
    accountEmail: item.accountEmail,
  }));

  // Same trigger as the Early Warning detail page's Email Threads panel — every row
  // opens the same shared EmailThreadModal. Rows with a real conversationId fetch
  // their thread from the backend, same as Early Warning. Rows without one cannot be
  // fetched, so the row's own already-known content is passed as fallbackMessages.
  const handleThreadClick = (selected: EmailThreadListItem) => {
    const item = messages.find((entry) => entry.id === selected.id);
    if (!item) return;
    setSelectedConversationId(item.conversationId ?? null);
    setSelectedSubject(item.subject);
    setSelectedFallback(item.conversationId ? undefined : [toFallbackProjectEmail(item)]);
    setModalOpen(true);
  };

  return (
    <>
      <CompensationEventDetailPanel
        icon={<LinkOutlined />}
        title={threadTitle}
        onAction={() => setVisibleCount(matchedMessages.length)}
        padding={EVIDENCE_SIZES.threadPadding}
        bodyGap={EVIDENCE_SIZES.threadBodyGap}
        bodyInline={EVIDENCE_SIZES.threadBodyInline}
        headerExtra={
          <CompensationEventListToolbar
            term={term}
            onTermChange={handleSearch}
            searchPlaceholder={threadSearchPlaceholder}
            filterOptions={DIRECTION_OPTIONS}
            selected={directions}
            onSelectedChange={handleDirections}
            onClearAll={clearAll}
            searchWidth={EVIDENCE_SIZES.toolbarSearchWidth}
          />
        }
      >
        <EmailThreadList
          items={items}
          emptyTitle={isFiltered ? noThreadSearchResults : noMessages}
          emptyDescription={
            isFiltered
              ? 'Try a different search term or clear the filters.'
              : 'Correspondence linked to this compensation event will appear here once it arrives.'
          }
          onSelect={handleThreadClick}
        />

        {matchedMessages.length > 0 && (
          <Flex align="center" justify="center" gap={16} wrap style={{ marginTop: 8 }}>
            <Typography.Text
              style={{
                color: REGISTER_COLORS.textMuted,
                fontSize: EVIDENCE_SIZES.threadFontSize,
              }}
            >
              {`Showing 1 to ${visibleMessages.length} of ${matchedMessages.length} ${activitiesUnit}`}
            </Typography.Text>

            {hasMore && (
              <Button
                type="primary"
                icon={<DownOutlined />}
                iconPosition="end"
                size="small"
                onClick={() =>
                  setVisibleCount((current) =>
                    Math.min(current + EVIDENCE_LIST_PAGE_SIZE, matchedMessages.length)
                  )
                }
              >
                {loadMore}
              </Button>
            )}
          </Flex>
        )}
      </CompensationEventDetailPanel>

      <EmailThreadModal
        open={modalOpen}
        projectId={projectId}
        conversationId={selectedConversationId}
        subjectFallback={selectedSubject}
        fallbackMessages={selectedFallback}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default CompensationEventEmailThread;
