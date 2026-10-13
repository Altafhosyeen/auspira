'use client';

import { Button, Card, Flex, Popconfirm, Select, Skeleton, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { findEarlyWarningByReference } from '@/components/contract-control-agent/risk-reduction-meeting.map';
import DocumentsCommunication from '@/components/shared/documents-communication';
import { useGetEarlyWarningsLookup } from '../../hooks/use-early-warnings';

export interface RrmMitigationSidebarProps {
  deadline?: string | null;
  projectId?: string;
  subject?: string;
  conversationId?: string | null;
  currentReference?: string;
  suggestedReference?: string | null;
  isCreatingMeeting?: boolean;
  isDismissingAlert?: boolean;
  onAccept: (chosenReference?: string) => void;
  onDismiss: () => void;
}

export const RrmMitigationSidebar = ({
  deadline,
  projectId,
  subject,
  conversationId,
  currentReference,
  suggestedReference,
  isCreatingMeeting,
  isDismissingAlert,
  onAccept,
  onDismiss,
}: RrmMitigationSidebarProps) => {
  const [selectedReference, setSelectedReference] = useState<string | undefined>(undefined);

  const { data: ewLookup, isLoading: isLookupLoading } = useGetEarlyWarningsLookup({
    projectId,
    enabled: Boolean(projectId),
  });

  const attachedReference = currentReference || suggestedReference;
  const attachedEarlyWarning = useMemo(
    () => findEarlyWarningByReference(ewLookup, attachedReference),
    [ewLookup, attachedReference]
  );
  const isReferenceConfirmed = Boolean(attachedEarlyWarning);

  useEffect(() => {
    if (attachedEarlyWarning?.reference) {
      setSelectedReference(attachedEarlyWarning.reference);
    }
  }, [attachedEarlyWarning]);

  const referenceOptions = useMemo(
    () =>
      (ewLookup ?? []).map((item) => ({
        value: item.reference,
        label: item.title ? `${item.reference} — ${item.title}` : item.reference,
      })),
    [ewLookup]
  );

  const activeReference =
    selectedReference || (isReferenceConfirmed ? attachedEarlyWarning?.reference : undefined);

  return (
    <Flex vertical gap={16}>
      {/* 1. Documents & Communication */}
      <DocumentsCommunication
        deadline={deadline}
        show
        projectId={projectId}
        conversationId={conversationId}
        subjectFallback={subject}
      />

      {/* 2. Early Warning Reference Card — checks lookup, defaults if confirmed, else select box */}
      <Card title="Early Warning Reference">
        {isLookupLoading && !ewLookup ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : isReferenceConfirmed && attachedEarlyWarning ? (
          <Flex vertical gap={12}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              This meeting is linked to registered Early Warning:
            </Typography.Text>
            <div
              style={{
                padding: '10px 14px',
                background: '#F0F7FF',
                border: '1px solid #BAE0FF',
                borderRadius: 8,
              }}
            >
              <Typography.Text strong style={{ color: '#00355F', fontSize: 14 }}>
                {attachedEarlyWarning.reference}
              </Typography.Text>
              {attachedEarlyWarning.title && (
                <Typography.Text
                  type="secondary"
                  style={{ display: 'block', fontSize: 12, marginTop: 2 }}
                >
                  {attachedEarlyWarning.title}
                </Typography.Text>
              )}
            </div>

            <Flex gap={12} style={{ width: '100%', marginTop: 4 }}>
              <Button
                type="primary"
                className="flex-1 font-semibold"
                loading={isCreatingMeeting}
                onClick={() => onAccept(activeReference)}
              >
                Accept
              </Button>
              <Popconfirm
                title="Dismiss this meeting record?"
                description="This will return you without saving changes."
                okText="Dismiss"
                cancelText="Cancel"
                onConfirm={onDismiss}
              >
                <Button className="flex-1 font-semibold" loading={isDismissingAlert}>
                  Dismiss
                </Button>
              </Popconfirm>
            </Flex>
          </Flex>
        ) : (
          <Flex vertical gap={12}>
            <div>
              <Typography.Text
                strong
                style={{ fontSize: 12, display: 'block', marginBottom: 6, color: '#475467' }}
              >
                Select Early Warning
              </Typography.Text>
              <Select
                placeholder="Select an Early Warning"
                showSearch
                allowClear
                style={{ width: '100%' }}
                value={selectedReference}
                onChange={setSelectedReference}
                options={referenceOptions}
                optionFilterProp="label"
                notFoundContent={
                  isLookupLoading ? 'Loading…' : 'No early warnings found for this project.'
                }
              />
            </div>

            <Flex gap={12} style={{ width: '100%', marginTop: 4 }}>
              <Button
                type="primary"
                className="flex-1 font-semibold"
                disabled={!activeReference || isCreatingMeeting}
                loading={isCreatingMeeting}
                onClick={() => onAccept(activeReference)}
              >
                Accept
              </Button>
              <Popconfirm
                title="Dismiss this meeting record?"
                description="This will return you without saving changes."
                okText="Dismiss"
                cancelText="Cancel"
                onConfirm={onDismiss}
              >
                <Button className="flex-1 font-semibold" loading={isDismissingAlert}>
                  Dismiss
                </Button>
              </Popconfirm>
            </Flex>
          </Flex>
        )}
      </Card>
    </Flex>
  );
};

export default RrmMitigationSidebar;
