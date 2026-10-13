'use client';

import { DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Empty,
  Flex,
  Input,
  Skeleton,
  Timeline,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import { useGetAuditLogs } from '@/hooks/modules/audit-log';
import {
  AUDIT_ACTION_COLORS,
  AUDIT_SIZES,
  AUDIT_TIMELINE,
  buildAuditSummary,
  COMPENSATION_EVENT_AUDIT_COPY,
  COMPENSATION_EVENT_AUDIT_LABELS,
  COMPENSATION_EVENT_AUDIT_PAGE_SIZE,
  type CompensationEventAuditAction,
  CompensationEventAuditEntryRow,
  filterAuditEntries,
  getAuditActionOptions,
  sortAuditEntries,
  toAuditEntry,
} from '@/modules/compensation-event';
import { USE_MOCK_REQUEST_FOR_INFORMATION } from '../constants/request-for-information.constants';
import { REGISTER_COLORS } from '../constants/request-for-information-register.theme';
import { MOCK_REQUEST_FOR_INFORMATION_AUDIT_TRAIL } from '../mocks/request-for-information.mock';
import type { RequestForInformation } from '../types/request-for-information.types';

const {
  searchPlaceholder,
  filtersLabel,
  noFilterOptions,
  clearAllLabel,
  loadMore,
  noEntries,
  noMatches,
} = COMPENSATION_EVENT_AUDIT_COPY;

interface RequestForInformationAuditTrailTabProps {
  rfi: RequestForInformation;
}

// Container — the Audit Trail tab: same toolbar, filters and timeline as the
// Compensation Event detail's Audit Trail tab, reusing its shared audit-log hook
// (entity-agnostic, keyed only by `entityId`) and action taxonomy since both screens
// log through the same backend audit endpoint. The live audit log is the source of
// truth; the module's own mock trail only stands in while it has nothing for the id —
// which it always will for a mock RFI, since mock ids aren't real backend entities.
const RequestForInformationAuditTrailTab = ({ rfi }: RequestForInformationAuditTrailTabProps) => {
  const [term, setTerm] = useState('');
  const [actions, setActions] = useState<CompensationEventAuditAction[]>([]);
  const [visible, setVisible] = useState(COMPENSATION_EVENT_AUDIT_PAGE_SIZE);

  const { data: logs, isLoading } = useGetAuditLogs({
    entityId: rfi.id,
    enabled: !USE_MOCK_REQUEST_FOR_INFORMATION,
  });

  const allEntries = useMemo(() => {
    if (logs?.length) return logs.map(toAuditEntry);
    return USE_MOCK_REQUEST_FOR_INFORMATION
      ? (MOCK_REQUEST_FOR_INFORMATION_AUDIT_TRAIL[rfi.id] ?? [])
      : [];
  }, [logs, rfi.id]);

  const actionOptions = useMemo(() => getAuditActionOptions(allEntries), [allEntries]);

  const entries = useMemo(
    () => sortAuditEntries(filterAuditEntries(allEntries, term, actions)),
    [allEntries, term, actions]
  );

  const shown = entries.slice(0, visible);
  const hasEntries = allEntries.length > 0;

  const clearAll = () => {
    setTerm('');
    setActions([]);
    setVisible(COMPENSATION_EVENT_AUDIT_PAGE_SIZE);
  };

  return (
    <Card styles={{ body: { padding: AUDIT_SIZES.cardPadding } }} style={{ borderRadius: 12 }}>
      <Flex
        align="center"
        justify="space-between"
        gap={AUDIT_SIZES.toolbarGap}
        wrap
        style={{ marginBottom: AUDIT_SIZES.toolbarBottomGap }}
      >
        <Flex gap={AUDIT_SIZES.toolbarGap} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: REGISTER_COLORS.textMuted }} />}
            placeholder={searchPlaceholder}
            value={term}
            onChange={(changeEvent) => setTerm(changeEvent.target.value)}
            style={{
              borderRadius: 12,
              height: AUDIT_SIZES.toolbarHeight,
              maxWidth: '100%',
              width: AUDIT_SIZES.searchWidth,
            }}
          />

          <Dropdown
            trigger={['click']}
            menu={{
              selectable: false,
              items: actionOptions.length
                ? actionOptions.map((action) => ({
                    key: action,
                    label: (
                      <Checkbox
                        checked={actions.includes(action)}
                        onChange={({ target }) =>
                          setActions((current) =>
                            target.checked
                              ? [...current, action]
                              : current.filter((item) => item !== action)
                          )
                        }
                      >
                        {COMPENSATION_EVENT_AUDIT_LABELS[action]}
                      </Checkbox>
                    ),
                  }))
                : [{ key: 'empty', disabled: true, label: noFilterOptions }],
            }}
          >
            <Button
              icon={<FilterOutlined />}
              style={{
                borderRadius: 12,
                height: AUDIT_SIZES.toolbarHeight,
                width: AUDIT_SIZES.filtersWidth,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {filtersLabel}
                <DownOutlined style={{ fontSize: 10, color: REGISTER_COLORS.textMuted }} />
              </span>
            </Button>
          </Dropdown>
        </Flex>

        <Typography.Link onClick={clearAll} style={{ fontSize: AUDIT_SIZES.footerFontSize }}>
          {clearAllLabel}
        </Typography.Link>
      </Flex>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : shown.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={hasEntries ? noMatches : noEntries}
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
          <Divider style={{ margin: 0 }} />
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
                  borderRadius: 12,
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
    </Card>
  );
};

export default RequestForInformationAuditTrailTab;
