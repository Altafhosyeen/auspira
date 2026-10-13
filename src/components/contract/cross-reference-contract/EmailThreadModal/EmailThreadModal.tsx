'use client';

import { Button, Checkbox, Empty, Input, Modal, Popover, Select, Skeleton } from 'antd';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  isInboundEmail,
  type ProjectEmail,
} from '@/components/contract-control-agent/action-queue.data';
import DisabledTooltip from '@/components/shared/DisabledTooltip';
import { useGetProjectEmailThreadPage } from '@/hooks/modules/project-email-thread';
import { parseBackendDate } from '@/lib/utils';
import { ThreadMessage } from './components/ThreadMessage';
import { PAGE_SIZE_OPTIONS } from './constants';
import type { Direction, EmailThreadModalProps, SortOrder } from './types';

/**
 * The whole viewer intentionally mimics the Outlook reading pane (Fluent
 * neutrals, persona-color avatars), so it uses Outlook's palette directly
 * instead of the app design-system tokens. The app chrome (header, toolbar,
 * labels) still renders in the app's Inter font; only the sandboxed iframe
 * below — which renders raw HTML from the external mailbox — keeps Segoe UI,
 * since that's foreign message content rather than app UI text.
 */

/**
 * Outlook-style conversation viewer for a cross-reference clarification thread.
 * Fetches GET /api/project-emails/thread with `conversationId` + server-side
 * `Skip`/`Top` for the active page (page N → Skip=(N-1)*pageSize, Top=pageSize) —
 * a conversation with many messages is never pulled down whole. The search is the
 * endpoint's own `Term`, so it matches the whole conversation rather than the loaded
 * page; the Sent/Received filter and sort still apply to the page that comes back.
 */
export const EmailThreadModal: React.FC<EmailThreadModalProps> = ({
  open,
  projectId,
  conversationId,
  subjectFallback,
  fallbackMessages,
  onClose,
}) => {
  // `undefined` = no manual toggle yet → the first message on the current page
  // is expanded by default, matching Outlook's reading pane. `destroyOnHidden`
  // on the Modal resets this each time the viewer is opened.
  const [manualExpandedId, setManualExpandedId] = useState<string | null | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<Direction[]>(['received', 'sent']);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Debounced before it reaches the request, so typing does not fire one per keystroke.
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(searchTerm.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const { data, isLoading } = useGetProjectEmailThreadPage<ProjectEmail>({
    projectId: open ? (projectId ?? undefined) : undefined,
    conversationId: open ? (conversationId ?? undefined) : undefined,
    skip: (page - 1) * pageSize,
    // `Top` is the page size the backend returns, not the last row's index.
    top: pageSize,
    // The endpoint's own search — so it matches the whole conversation, not just
    // whichever page happens to be loaded.
    term: debouncedTerm || undefined,
  });

  // A real fetch (even one that resolves empty) always wins; fallbackMessages only
  // covers ids with no conversationId to fetch in the first place — e.g. demo data.
  const pageEmails = useMemo(
    () => (conversationId ? (data?.items ?? []) : (fallbackMessages ?? [])),
    [data, fallbackMessages, conversationId]
  );
  // Falls back to the current page's own count when the backend doesn't report a total
  // (e.g. a short conversation that never triggers the paged envelope).
  const totalCount = data?.totalCount ?? pageEmails.length;

  // Subject reflects the current page — the modal only ever holds one page at a time.
  const newestFirst = useMemo(
    () =>
      [...pageEmails].sort(
        (a, b) =>
          (parseBackendDate(b.timestampUtc)?.getTime() ?? 0) -
          (parseBackendDate(a.timestampUtc)?.getTime() ?? 0)
      ),
    [pageEmails]
  );
  const subject = newestFirst[0]?.subject || subjectFallback || 'Email thread';

  // The search runs on the backend against the whole conversation; the direction filter
  // and sort still apply to the page that comes back.
  const filteredEmails = useMemo(() => {
    return newestFirst
      .filter((email) =>
        directionFilter.includes(isInboundEmail(email.boxType, email.source) ? 'received' : 'sent')
      )
      .sort((a, b) => {
        const diff =
          (parseBackendDate(b.timestampUtc)?.getTime() ?? 0) -
          (parseBackendDate(a.timestampUtc)?.getTime() ?? 0);
        return sortOrder === 'newest' ? diff : -diff;
      });
  }, [newestFirst, directionFilter, sortOrder]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || sortOrder !== 'newest' || directionFilter.length < 2;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedEmails = filteredEmails;

  const expandedId =
    manualExpandedId === undefined ? (pagedEmails[0]?.id ?? null) : manualExpandedId;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      // Near-fullscreen reading pane — tracks the viewport instead of a fixed px width.
      width="98vw"
      style={{ maxWidth: 1200 }}
      centered
      destroyOnHidden
      closable={false}
      footer={null}
    >
      <div>
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
          <span className="bg-main-p/10 text-main-p flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Mail className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="ds-body-large! truncate font-bold! text-slate-900">{subject}</h3>
            <p className="ds-micro! mt-0.5 font-medium! text-slate-500">
              {totalCount} message{totalCount === 1 ? '' : 's'} in this conversation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Toolbar */}
        {!isLoading && totalCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select<SortOrder>
              value={sortOrder}
              onChange={(value) => {
                setSortOrder(value);
                setPage(1);
              }}
              className="w-36"
              options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
              ]}
            />

            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search in this conversation..."
              prefix={<Search className="h-3.5 w-3.5 text-slate-400" />}
              allowClear
              className="min-w-0 flex-1"
            />

            <Popover
              trigger="click"
              placement="bottomRight"
              content={
                <Checkbox.Group
                  value={directionFilter}
                  onChange={(value) => {
                    setDirectionFilter(value as Direction[]);
                    setPage(1);
                  }}
                  className="flex flex-col gap-2"
                  options={[
                    { value: 'received', label: 'Received' },
                    { value: 'sent', label: 'Sent' },
                  ]}
                />
              }
            >
              <button
                type="button"
                className="ds-caption! inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold! text-slate-700 hover:bg-slate-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {directionFilter.length < 2 && (
                  <span className="bg-main-p h-1.5 w-1.5 rounded-full" />
                )}
              </button>
            </Popover>

            <DisabledTooltip
              disabled={!hasActiveFilters}
              reason="No search, sort, or filter changes to reset."
            >
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSortOrder('newest');
                  setDirectionFilter(['received', 'sent']);
                  setPage(1);
                }}
                disabled={!hasActiveFilters}
                className="ds-caption! inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold! text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </DisabledTooltip>
          </div>
        )}

        {/* Neutral-grey reading pane filling the viewport height — the modal's single scroll area. */}
        <div className="mt-3 h-[calc(100vh-24rem)] overflow-y-auto rounded-lg bg-[#f5f5f5] p-4">
          <div className="mx-auto w-full max-w-5xl space-y-3">
            {isLoading ? (
              <div className="rounded-lg bg-white p-4 shadow-[0_1.6px_3.6px_rgba(0,0,0,0.11)]">
                <Skeleton active avatar paragraph={{ rows: 6 }} />
              </div>
            ) : totalCount === 0 ? (
              <div className="flex items-center justify-center rounded-lg bg-white p-10 shadow-[0_1.6px_3.6px_rgba(0,0,0,0.11)]">
                <Empty description="No messages found for this conversation." />
              </div>
            ) : pagedEmails.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg bg-white p-10 shadow-[0_1.6px_3.6px_rgba(0,0,0,0.11)]">
                <Empty description="No messages match your search." />
              </div>
            ) : (
              pagedEmails.map((email) => (
                <ThreadMessage
                  key={email.id}
                  email={email}
                  expanded={email.id === expandedId}
                  onToggle={() => setManualExpandedId(expandedId === email.id ? null : email.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Pagination footer */}
        {!isLoading && totalCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="ds-caption! text-slate-500">
              Showing {pagedEmails.length} of {totalCount} messages
            </span>

            <div className="flex items-center gap-2">
              <DisabledTooltip disabled={safePage <= 1} reason="Already on the first page.">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </DisabledTooltip>
              <span className="bg-main-p flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[12px] font-semibold text-white">
                {safePage}
              </span>
              <DisabledTooltip disabled={safePage >= totalPages} reason="Already on the last page.">
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </DisabledTooltip>
            </div>

            <div className="flex items-center gap-2">
              <span className="ds-caption! whitespace-nowrap text-slate-500">Per Page</span>
              <Select<number>
                value={pageSize}
                onChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
                className="w-20"
                options={PAGE_SIZE_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
              />
            </div>
          </div>
        )}

        {/* Close */}
        <div className="mt-3 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

EmailThreadModal.displayName = 'EmailThreadModal';
