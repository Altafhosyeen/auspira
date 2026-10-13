'use client';

import { Avatar, Button, Flex, Typography } from 'antd';
import { useState } from 'react';
import type { MeetingAttendee } from '../../utils/early-warning-meeting.utils';

interface EwMeetingAttendeesProps {
  attendees: MeetingAttendee[];
  maxVisible?: number;
  /** The collapsible panel already renders the title — skip the inner one. */
  hideHeading?: boolean;
}

export const EwMeetingAttendees = ({
  attendees,
  maxVisible = 4,
  hideHeading = false,
}: EwMeetingAttendeesProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = attendees.length > maxVisible;
  const visibleAttendees = expanded ? attendees : attendees.slice(0, maxVisible);

  return (
    <Flex vertical gap={12}>
      {(!hideHeading || hasMore) && (
        <Flex justify="space-between" align="center">
          {hideHeading ? (
            <span />
          ) : (
            <Typography.Text strong>Attendees ({attendees.length})</Typography.Text>
          )}
          {hasMore && (
            <Button type="link" size="small" onClick={() => setExpanded((prev) => !prev)}>
              {expanded ? 'Show Less' : 'View All'}
            </Button>
          )}
        </Flex>
      )}

      {attendees.length === 0 ? (
        <Typography.Text type="secondary">No attendees listed for this meeting.</Typography.Text>
      ) : (
        <Flex wrap gap={16} align="center">
          {visibleAttendees.map((attendee) => (
            <Flex key={attendee.id} align="center" gap={8}>
              <Avatar
                size={36}
                style={{
                  backgroundColor: attendee.avatarBg,
                  color: attendee.avatarColor,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {attendee.initials}
              </Avatar>
              <Flex vertical>
                <Typography.Text strong>{attendee.name}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {attendee.role}
                </Typography.Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default EwMeetingAttendees;
