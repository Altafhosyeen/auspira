'use client';

import { MenuUnfoldOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Empty, Flex, Modal, message, Tag, Tooltip, Typography } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { EmailThreadModal } from '@/components/contract/cross-reference-contract/EmailThreadModal/EmailThreadModal';
import {
  useCompleteMeetingAction,
  useDeleteMeetingAction,
  useDownloadEarlyWarningAttachment,
  useGetEarlyWarningAttachments,
  useGetMeetingActionsByMeetingId,
  useGetMeetingById,
  useGetMeetingsByEarlyWarningId,
} from '../hooks/use-early-warnings';

import type { MeetingDto } from '../types/early-warning-api.types';
import type { DisplayMeetingAction, MeetingAttendee } from '../utils/early-warning-meeting.utils';
import {
  formatMeetingDate,
  formatMeetingTime,
  getMeetingDtoStatus,
  getMeetingStatusTagProps,
  mapActionToDisplay,
  mapMeetingDtoToAttendees,
} from '../utils/early-warning-meeting.utils';
import {
  EwAddMeetingActionModal,
  EwCompleteActionModal,
  EwCreateMeetingModal,
  EwEditActionAssigneesModal,
  EwMeetingActionsTable,
  EwMeetingAgenda,
  EwMeetingAttachments,
  EwMeetingAttendees,
  EwMeetingCollapsibleSection,
  EwMeetingMetaRow,
  EwMeetingsListColumn,
} from './meeting';

interface EarlyWarningMeetingTabProps {
  earlyWarningId: string;
  projectId?: string;
  /** Discarded EWs are terminal — hide every create entry point. */
  readOnly?: boolean;
  // Hosts that only schedule meetings (defect notices) hide the agreed-actions workflow —
  // the Add Action entry point and the actions table disappear; viewing stays untouched.
  hideActions?: boolean;
  // Hosts that book meetings on their own endpoint (e.g. defect notices) render the same
  // invite modal through this slot; when absent the EW booking modal is used as before.
  renderCreateMeetingModal?: (opts: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }) => ReactNode;
  // Overrides the empty-state copy, which names Early Warning by default.
  emptyDescription?: string;
}

export const EarlyWarningMeetingTab = ({
  earlyWarningId,
  projectId = '',
  readOnly = false,
  hideActions = false,
  renderCreateMeetingModal,
  emptyDescription,
}: EarlyWarningMeetingTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [addActionModalOpen, setAddActionModalOpen] = useState(false);
  const [createMeetingModalOpen, setCreateMeetingModalOpen] = useState(false);
  const [editAssigneesAction, setEditAssigneesAction] = useState<DisplayMeetingAction | null>(null);
  const [completeActionTarget, setCompleteActionTarget] = useState<DisplayMeetingAction | null>(
    null
  );
  const [threadAction, setThreadAction] = useState<DisplayMeetingAction | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch meetings (GET /api/meetings/list/{entityId})
  const {
    data: newMeetings,
    isLoading: loadingNewMeetings,
    refetch: refetchNewMeetings,
  } = useGetMeetingsByEarlyWarningId({
    earlyWarningId,
    enabled: !!earlyWarningId,
  });

  const meetings: MeetingDto[] = useMemo(() => newMeetings ?? [], [newMeetings]);

  const activeMeetingId = selectedMeetingId || meetings[0]?.id || null;
  const selectedMeetingIndex = meetings.findIndex((m) => m.id === activeMeetingId);
  const selectedMeeting = meetings[selectedMeetingIndex >= 0 ? selectedMeetingIndex : 0];

  // Fetch meeting detail (GET /api/meetings/{meetingId})
  const { data: meetingDetail } = useGetMeetingById({
    meetingId: selectedMeeting?.id,
    enabled: !!selectedMeeting?.id,
  });

  // Fetch actions for selected meeting (GET /api/meeting-actions/meeting/{meetingId})
  const {
    data: rawMeetingActions,
    isLoading: loadingActions,
    refetch: refetchActions,
  } = useGetMeetingActionsByMeetingId({
    meetingId: selectedMeeting?.id,
    enabled: !!selectedMeeting?.id,
  });

  const { mutateAsync: completeAction } = useCompleteMeetingAction();
  const { mutateAsync: deleteAction } = useDeleteMeetingAction();
  const { mutate: downloadAttachment } = useDownloadEarlyWarningAttachment();

  // Attachments hang off the entity that owns them — a file uploaded with a meeting
  // is stored against the MEETING id, so query per selected meeting.
  // GET /api/attachments/{entityId}/projects/{projectId}
  const { data: rawAttachments } = useGetEarlyWarningAttachments({
    entityId: selectedMeeting?.id,
    projectId,
    enabled: !!selectedMeeting?.id && !!projectId,
  });

  const attachments = useMemo(
    () =>
      (rawAttachments ?? []).map((att) => ({
        id: att.id,
        fileName: att.fileName,
        filePath: att.filePath,
      })),
    [rawAttachments]
  );

  // Combine and format actions purely from API
  const displayActions: DisplayMeetingAction[] = useMemo(
    () => (rawMeetingActions ?? []).map((act, idx) => mapActionToDisplay(act, idx)),
    [rawMeetingActions]
  );

  const filteredMeetings = useMemo(() => {
    if (!searchTerm.trim()) return meetings;
    const term = searchTerm.toLowerCase();
    return meetings.filter((m) => {
      const subject = m.subject || '';
      const summary = m.agenda || '';
      const loc = m.location || '';
      return (
        subject.toLowerCase().includes(term) ||
        summary.toLowerCase().includes(term) ||
        loc.toLowerCase().includes(term)
      );
    });
  }, [meetings, searchTerm]);

  // Derive attendees for the active meeting
  const attendees: MeetingAttendee[] = useMemo(() => {
    if (!selectedMeeting) return [];

    const activeDetail = (meetingDetail || selectedMeeting) as MeetingDto;
    if (activeDetail.meetingAttendees && activeDetail.meetingAttendees.length > 0) {
      return mapMeetingDtoToAttendees(activeDetail.meetingAttendees);
    }

    return [];
  }, [selectedMeeting, meetingDetail]);

  // Meeting title, agenda, status, date/time
  const meetingTitle = useMemo(() => {
    if (!selectedMeeting) return 'Meeting Details';
    return selectedMeeting.subject || `Meeting ${selectedMeetingIndex + 1}`;
  }, [selectedMeeting, selectedMeetingIndex]);

  const meetingAgenda = useMemo(() => selectedMeeting?.agenda || '', [selectedMeeting]);

  const meetingStatus = useMemo(() => {
    if (!selectedMeeting) return 'Held';
    return getMeetingDtoStatus(selectedMeeting as MeetingDto);
  }, [selectedMeeting]);

  const tagProps = getMeetingStatusTagProps(meetingStatus);

  const meetingDateFormatted = useMemo(
    () => formatMeetingDate(selectedMeeting?.startTime),
    [selectedMeeting]
  );

  const meetingTimeFormatted = useMemo(() => {
    if (!selectedMeeting) return '—';
    return formatMeetingTime(selectedMeeting.startTime, selectedMeeting.endTime);
  }, [selectedMeeting]);

  const meetingLocation = useMemo(() => {
    if (!selectedMeeting) return 'Teams';
    if (selectedMeeting.isOnlineMeeting) {
      return selectedMeeting.location || 'Online / Teams';
    }
    return selectedMeeting.location || 'Auspira Project Meeting Room';
  }, [selectedMeeting]);

  // "Instructed by" comes from the meeting's createdByName (who raised it).
  const instructedBy = useMemo(() => {
    const activeDetail = (meetingDetail || selectedMeeting) as MeetingDto | undefined;
    return activeDetail?.createdByName || 'Project Team';
  }, [selectedMeeting, meetingDetail]);

  const handleDeleteAction = (action: DisplayMeetingAction) => {
    Modal.confirm({
      title: 'Delete this action?',
      content: `"${action.title}" will be permanently removed. This cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteAction(action.id);
          message.success('Action removed');
          refetchActions();
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete action');
        }
      },
    });
  };

  const refetchAllMeetings = () => {
    refetchNewMeetings();
  };

  return (
    <>
      <Flex gap={16} align="flex-start" style={{ width: '100%', position: 'relative' }}>
        {/* Left Column: Meetings List (Collapsible with smooth animation) */}
        <AnimatePresence initial={false}>
          {!isSidebarCollapsed && (
            <motion.div
              key="meetings-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <div style={{ width: 380, minWidth: 380 }}>
                <EwMeetingsListColumn
                  meetings={filteredMeetings}
                  activeMeetingId={activeMeetingId}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  isLoading={loadingNewMeetings}
                  onSelectMeeting={setSelectedMeetingId}
                  onCreateMeeting={() => setCreateMeetingModalOpen(true)}
                  onCollapse={() => setIsSidebarCollapsed(true)}
                  readOnly={readOnly}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Column: Selected Meeting Detail */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedMeeting ? (
            <Card styles={{ body: { padding: 0 } }} style={{ boxShadow: 'none' }}>
              <Flex vertical>
                {/* Header Bar */}
                <Flex
                  justify="space-between"
                  align="center"
                  wrap
                  gap={12}
                  style={{ padding: '20px 24px' }}
                >
                  <Flex align="center" gap={10} wrap>
                    {isSidebarCollapsed && (
                      <Tooltip title="Expand meetings sidebar">
                        <Button
                          icon={<MenuUnfoldOutlined />}
                          onClick={() => setIsSidebarCollapsed(false)}
                        >
                          Meetings ({filteredMeetings.length})
                        </Button>
                      </Tooltip>
                    )}
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      Meeting {selectedMeetingIndex + 1} — {meetingTitle}
                    </Typography.Title>
                    <Tag color={tagProps.color} bordered={false} style={{ margin: 0 }}>
                      {tagProps.text}
                    </Tag>
                  </Flex>

                  {!hideActions && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setAddActionModalOpen(true)}
                    >
                      Add Action
                    </Button>
                  )}
                </Flex>

                <Divider style={{ margin: 0 }} />

                {/* Metadata row */}
                <div style={{ padding: '20px 24px' }}>
                  <EwMeetingMetaRow
                    date={meetingDateFormatted}
                    time={meetingTimeFormatted}
                    location={meetingLocation}
                    instructedBy={instructedBy}
                  />
                </div>

                <Divider style={{ margin: 0 }} />

                {/* Attendees, Agenda and Attachments are reference detail — collapsed by
                    default so the meeting header and Agreed Actions stay above the fold. */}
                <div style={{ padding: '8px 12px' }}>
                  <EwMeetingCollapsibleSection
                    title={`Attendees (${attendees.length})`}
                    description="View meeting participants and their roles."
                  >
                    <EwMeetingAttendees attendees={attendees} hideHeading />
                  </EwMeetingCollapsibleSection>
                </div>

                <Divider style={{ margin: 0 }} />

                <div style={{ padding: '8px 12px' }}>
                  <EwMeetingCollapsibleSection
                    title="Agenda"
                    description="View the meeting agenda and discussion points."
                  >
                    <EwMeetingAgenda agenda={meetingAgenda} hideHeading />
                  </EwMeetingCollapsibleSection>
                </div>

                <Divider style={{ margin: 0 }} />

                <div style={{ padding: '8px 12px' }}>
                  <EwMeetingCollapsibleSection
                    title={`Attachments${attachments.length > 0 ? ` (${attachments.length})` : ''}`}
                    description="View and download meeting attachments."
                  >
                    <EwMeetingAttachments
                      attachments={attachments}
                      hideHeading
                      onDownload={(att) => {
                        if (att.filePath) {
                          downloadAttachment({ url: att.filePath, fileName: att.fileName });
                        } else {
                          message.info('This attachment has no stored file to download.');
                        }
                      }}
                    />
                  </EwMeetingCollapsibleSection>
                </div>

                <Divider style={{ margin: 0 }} />

                {/* Agreed Actions Table — hidden entirely for hosts that only schedule
                    meetings (defect notices); the meeting detail above still renders. */}
                {!hideActions && (
                  <>
                    <Divider style={{ margin: 0 }} />
                    <div style={{ padding: '20px 24px' }}>
                      <Flex vertical gap={12}>
                        <Typography.Text strong>
                          Agreed Actions {displayActions.length > 0 && `(${displayActions.length})`}
                        </Typography.Text>
                        <EwMeetingActionsTable
                          actions={displayActions}
                          loading={loadingActions}
                          // Read-only (closed/discarded) EWs get no mutating row actions —
                          // the kebab disappears entirely; the thread View stays.
                          onCompleteAction={
                            readOnly ? undefined : (action) => setCompleteActionTarget(action)
                          }
                          onDeleteAction={readOnly ? undefined : handleDeleteAction}
                          onEditAssignees={
                            readOnly ? undefined : (action) => setEditAssigneesAction(action)
                          }
                          onOpenThread={(action) => setThreadAction(action)}
                        />
                      </Flex>
                    </div>
                  </>
                )}
              </Flex>
            </Card>
          ) : (
            <Card
              styles={{ body: { padding: '64px 24px', textAlign: 'center' } }}
              style={{ boxShadow: 'none' }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Flex vertical gap={6} align="center">
                    <Typography.Text strong>No meeting selected</Typography.Text>
                    <Typography.Text type="secondary">
                      {emptyDescription ??
                        'There are no meetings scheduled for this Early Warning yet.'}
                    </Typography.Text>
                  </Flex>
                }
              >
                <Flex justify="center" gap={8} style={{ marginTop: 12 }}>
                  {isSidebarCollapsed && (
                    <Button
                      icon={<MenuUnfoldOutlined />}
                      onClick={() => setIsSidebarCollapsed(false)}
                    >
                      Show Meetings ({filteredMeetings.length})
                    </Button>
                  )}
                </Flex>
              </Empty>
            </Card>
          )}
        </div>
      </Flex>

      {/* Add Action Modal */}
      {selectedMeeting && !readOnly && !hideActions && (
        <EwAddMeetingActionModal
          open={addActionModalOpen}
          onClose={() => setAddActionModalOpen(false)}
          meetingId={selectedMeeting.id}
          projectId={projectId}
          onSuccess={() => {
            refetchActions();
            refetchAllMeetings();
          }}
        />
      )}

      {/* Edit Action Assignees Modal */}
      <EwEditActionAssigneesModal
        open={!!editAssigneesAction}
        onClose={() => setEditAssigneesAction(null)}
        action={editAssigneesAction?.rawAction}
        projectId={projectId}
        onSuccess={() => {
          refetchActions();
        }}
      />

      {/* Complete Action Modal */}
      <EwCompleteActionModal
        open={!!completeActionTarget}
        onClose={() => setCompleteActionTarget(null)}
        action={completeActionTarget}
        onSuccess={() => {
          refetchActions();
        }}
      />

      {/* Action Thread Modal */}
      <EmailThreadModal
        open={!!threadAction}
        projectId={projectId || null}
        conversationId={threadAction?.conversationId ?? null}
        subjectFallback={threadAction?.title}
        onClose={() => setThreadAction(null)}
      />

      {/* Create Meeting Invite Modal — hosts with their own booking endpoint (defect
          notices) slot theirs in; the open/close state and refetch stay here. */}
      {renderCreateMeetingModal ? (
        renderCreateMeetingModal({
          open: createMeetingModalOpen,
          onClose: () => setCreateMeetingModalOpen(false),
          onSuccess: refetchAllMeetings,
        })
      ) : (
        <EwCreateMeetingModal
          open={createMeetingModalOpen}
          onClose={() => setCreateMeetingModalOpen(false)}
          earlyWarningId={earlyWarningId}
          projectId={projectId}
          onSuccess={() => {
            refetchAllMeetings();
          }}
        />
      )}
    </>
  );
};

export default EarlyWarningMeetingTab;
