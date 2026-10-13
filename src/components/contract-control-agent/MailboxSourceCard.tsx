'use client';

import React from 'react';
import { Mail, Inbox, AtSign, Server, type LucideIcon } from 'lucide-react';
import { type MailboxProvider, type MailboxSource, type QueueMessage } from './action-queue.data';

// ─── PROVIDER VISUALS ────────────────────────────────────────────────────────

const PROVIDER_VISUAL: Record<MailboxProvider, { icon: LucideIcon; color: string }> = {
  outlook: { icon: Mail, color: '#0F6CBD' },
  gmail: { icon: AtSign, color: '#EA4335' },
  auspira: { icon: Inbox, color: '#0F4C81' },
  imap: { icon: Server, color: '#64748b' },
};

// ─── MESSAGE ROW ─────────────────────────────────────────────────────────────

const MessageRow = ({ message }: { message: QueueMessage }) => (
  <div className="border-t border-gray-100 px-5 py-4 transition-colors hover:bg-gray-50/60">
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm font-medium text-gray-500">
        {message.sender}
        {message.meta && <span className="text-gray-400"> — {message.meta}</span>}
      </span>
      {message.time && <span className="shrink-0 text-xs text-gray-400">{message.time}</span>}
    </div>

    {message.recipient && (
      <p className="mt-0.5 mb-0 truncate text-xs text-gray-400" title={`to ${message.recipient}`}>
        to {message.recipient}
      </p>
    )}

    <div className="mt-1 flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-gray-800">{message.subject}</span>
      {message.msgRef && (
        <span className="font-mono text-[11px] text-gray-400">{message.msgRef}</span>
      )}
    </div>

    {message.snippet && (
      <p className="mt-1 mb-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
        {message.snippet}
      </p>
    )}

    <div className="flex flex-wrap items-center gap-2">
      {/* {message.classification ? (
        <Tag
          bordered={false}
          className="m-0 rounded px-1.5 py-0 text-[10px] font-bold tracking-wide"
          style={CLASS_STYLE[message.classification]}
        >
          {message.classification}==
        </Tag>
      ) : (
        message.type && (
          <Tag
            bordered={false}
            className="m-0 rounded px-1.5 py-0 text-[10px] font-bold tracking-wide capitalize"
            style={CLASS_STYLE.Other}
          >
            {message.type}
          </Tag>
        )
      )} */}
      {typeof message.confidence === 'number' && message.confidence > 0 && (
        <span className="text-[11px] text-gray-400">
          conf <span className="font-medium text-gray-500">{message.confidence}%</span>
        </span>
      )}
    </div>
  </div>
);

// ─── CARD ────────────────────────────────────────────────────────────────────

const MailboxSourceCard = ({ source }: { source: MailboxSource }) => {
  const { icon: Icon, color } = PROVIDER_VISUAL[source.provider];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color }} />
          <span className="text-sm font-semibold text-gray-800">{source.name}</span>
          <span className="text-[11px] font-medium tracking-wide text-gray-400">
            {source.descriptor}
          </span>
        </div>
        <span className="shrink-0 text-xs text-gray-400">{source.status}</span>
      </div>

      {/* Messages */}
      <div>
        {source.messages.map((message) => (
          <MessageRow key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};

export default MailboxSourceCard;
