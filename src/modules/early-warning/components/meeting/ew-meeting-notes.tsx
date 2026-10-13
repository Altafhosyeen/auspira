'use client';

import { Flex, Typography } from 'antd';

export interface EwMeetingAgendaProps {
  agenda?: string | null;
  /** Backwards compatibility alias for agenda */
  notes?: string | null;
  /** The collapsible panel already renders the title — skip the inner one. */
  hideHeading?: boolean;
}

export type EwMeetingNotesProps = EwMeetingAgendaProps;

const EMPTY_AGENDA_FALLBACK = 'No meeting agenda recorded for this meeting.';

export const EwMeetingAgenda = ({ agenda, notes, hideHeading = false }: EwMeetingAgendaProps) => {
  const rawContent = agenda ?? notes;
  const hasAgenda = !!rawContent && rawContent.trim() !== '' && rawContent !== '—';
  const isHtml = hasAgenda && /<[a-z][\s\S]*>/i.test(rawContent);

  return (
    <Flex vertical gap={8}>
      {!hideHeading && <Typography.Text strong>Meeting Agenda</Typography.Text>}
      {isHtml ? (
        <Flex
          vertical
          className="ew-meeting-agenda-content [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: agenda HTML is authored via our own rich-text editor by authenticated project members
          dangerouslySetInnerHTML={{ __html: rawContent ?? '' }}
        />
      ) : (
        <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {hasAgenda ? rawContent : EMPTY_AGENDA_FALLBACK}
        </Typography.Paragraph>
      )}
    </Flex>
  );
};

export const EwMeetingNotes = EwMeetingAgenda;
export default EwMeetingAgenda;
