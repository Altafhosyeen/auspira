'use client';

import { ClockCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Flex, Skeleton, Timeline, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  AUDIT_ACTION_BY_ORDINAL,
  AUDIT_ACTION_LABELS,
} from '@/components/shared/audit-trail/audit-actions';
import { useGetAuditLogs } from '@/hooks/modules/audit-log';
import {
  buildAuditSummary,
  COMPENSATION_EVENT_AUDIT_COPY,
  COMPENSATION_EVENT_AUDIT_PAGE_SIZE,
} from '../constants/compensation-event-audit.constants';
import {
  AUDIT_ACTION_COLORS,
  AUDIT_SIZES,
  AUDIT_TIMELINE,
} from '../constants/compensation-event-audit.theme';
import { PANEL_SIZES } from '../constants/compensation-event-detail.theme';
import { EVIDENCE_COLORS, EVIDENCE_SIZES } from '../constants/compensation-event-evidence.theme';
import { REGISTER_COLORS } from '../constants/compensation-event-register.theme';
import type { CompensationEvent } from '../types/compensation-event.types';
import { sortAuditEntries } from '../utils/compensation-event.utils';
import { toAuditEntry } from '../utils/compensation-event-api.utils';
import CompensationEventAuditEntryRow from './compensation-event-audit-entry-row';
import CompensationEventDetailPanel from './compensation-event-detail-panel';
import CompensationEventListToolbar from './compensation-event-list-toolbar';

const { title, searchPlaceholder, loadMore, noEntries, noMatches } = COMPENSATION_EVENT_AUDIT_COPY;

// The trail's action vocabulary, as the endpoint's own `actionType` ordinals. Taken from
// the full enum, not from the rows on screen — once the endpoint narrows to one action the
// loaded rows no longer name the others.
const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_BY_ORDINAL).map(([ordinal, action]) => ({
  value: ordinal,
  label: AUDIT_ACTION_LABELS[action],
}));

// Container — owns the search term, the action filter and how many rows are shown.
const CompensationEventAuditTrailTab = ({ event }: { event: CompensationEvent }) => {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  // The endpoint takes one actionType, so the dropdown holds at most one choice.
  const [actions, setActions] = useState<string[]>([]);
  const [visible, setVisible] = useState(COMPENSATION_EVENT_AUDIT_PAGE_SIZE);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { data: logs, isLoading } = useGetAuditLogs({
    entityId: event.id,
    term: debouncedTerm,
    actionType: actions.length ? Number(actions[0]) : undefined,
  });

  const isNarrowed = Boolean(debouncedTerm) || actions.length > 0;

  // The shared audit log is the source of truth; the event's own trail only stands in
  // while the entity has no logged history yet. Once a search or action filter is on, an
  // empty response means nothing matched — falling back there would show unfiltered rows.
  const allEntries = useMemo(
    () => (logs?.length || isNarrowed ? (logs ?? []).map(toAuditEntry) : (event.auditTrail ?? [])),
    [logs, event.auditTrail, isNarrowed]
  );

  const entries = useMemo(() => sortAuditEntries(allEntries), [allEntries]);

  const shown = entries.slice(0, visible);

  const clearAll = () => {
    setTerm('');
    setActions([]);
    setVisible(COMPENSATION_EVENT_AUDIT_PAGE_SIZE);
  };

  return (
    <CompensationEventDetailPanel
      icon={<ClockCircleOutlined />}
      title={title}
      padding={EVIDENCE_SIZES.threadPadding}
      bodyGap={EVIDENCE_SIZES.threadBodyGap}
      headerExtra={
        <CompensationEventListToolbar
          term={term}
          onTermChange={setTerm}
          searchPlaceholder={searchPlaceholder}
          filterOptions={AUDIT_ACTION_OPTIONS}
          selected={actions}
          // Only the newly ticked action survives — the endpoint narrows to one.
          onSelectedChange={(values) => setActions(values.slice(-1))}
          onClearAll={clearAll}
        />
      }
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : shown.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={isNarrowed ? noMatches : noEntries}
        />
      ) : (
        <div
          style={{ paddingTop: AUDIT_TIMELINE.paddingTop, paddingLeft: AUDIT_TIMELINE.paddingLeft }}
        >
          <Timeline
            items={shown.map((entry) => ({
              key: entry.id,
              color: AUDIT_ACTION_COLORS[entry.action],
              content: <CompensationEventAuditEntryRow entry={entry} />,
            }))}
          />
        </div>
      )}

      {shown.length > 0 && (
        <>
          <Divider style={{ borderColor: EVIDENCE_COLORS.divider, margin: 0 }} />
          <Flex
            align="center"
            justify="center"
            gap={AUDIT_SIZES.footerGap}
            wrap
            style={{ paddingTop: AUDIT_SIZES.footerPaddingTop }}
          >
            <Typography.Text
              style={{ color: REGISTER_COLORS.textMuted, fontSize: AUDIT_SIZES.footerFontSize }}
            >
              {buildAuditSummary(shown.length, entries.length)}
            </Typography.Text>

            {shown.length < entries.length && (
              <Button
                icon={<DownOutlined />}
                iconPosition="end"
                onClick={() =>
                  setVisible((current) => current + COMPENSATION_EVENT_AUDIT_PAGE_SIZE)
                }
                style={{
                  borderRadius: PANEL_SIZES.cardRadius,
                  color: REGISTER_COLORS.main,
                  height: AUDIT_SIZES.loadMoreHeight,
                }}
              >
                {loadMore}
              </Button>
            )}
          </Flex>
        </>
      )}
    </CompensationEventDetailPanel>
  );
};

export default CompensationEventAuditTrailTab;
