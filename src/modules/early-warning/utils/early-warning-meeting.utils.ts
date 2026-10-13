import dayjs from 'dayjs';
import type {
  EarlyWarningMeetingDto,
  MeetingActionDto,
  MeetingAttendeeDto,
  MeetingDto,
} from '../types/early-warning-api.types';
import { ProjectRole } from '../types/early-warning-api.types';

export interface MeetingAttendee {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  isExternal?: boolean;
}

const AVATAR_PALETTES = [
  { bg: '#EAE6FF', color: '#5925DC' },
  { bg: '#FFE8D6', color: '#D95D00' },
  { bg: '#E0F2FE', color: '#0284C7' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#FCE7F3', color: '#DB2777' },
];

export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  const parts = name.replace(/[(),]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const getAvatarStyle = (text?: string | null) => {
  const safeText = text || 'User';
  let hash = 0;
  for (let i = 0; i < safeText.length; i++) {
    hash += safeText.charCodeAt(i);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

export const formatMeetingDate = (iso?: string | null): string => {
  if (!iso) return '—';
  const parsed = dayjs(iso);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : '—';
};

export const formatMeetingTime = (iso?: string | null, endIso?: string | null): string => {
  if (!iso) return '—';
  const parsed = dayjs(iso);
  if (!parsed.isValid()) return '—';
  const startTime = parsed.format('HH:mm');
  let endTime = parsed.add(1, 'hour').format('HH:mm');
  if (endIso) {
    const endParsed = dayjs(endIso);
    if (endParsed.isValid()) {
      endTime = endParsed.format('HH:mm');
    }
  }
  return `${startTime} - ${endTime}`;
};

export const formatMeetingDateTime = (iso?: string | null, endIso?: string | null): string => {
  if (!iso) return '—';
  const parsed = dayjs(iso);
  if (!parsed.isValid()) return '—';
  const datePart = parsed.format('DD MMM YYYY');
  const timePart = formatMeetingTime(iso, endIso);
  return timePart !== '—' ? `${datePart} · ${timePart}` : datePart;
};

export type MeetingStatusType = 'Held' | 'Requested' | 'Completed';

export const getMeetingStatus = (
  meeting: EarlyWarningMeetingDto,
  index: number
): MeetingStatusType => {
  if (!meeting.meetingDate) return 'Requested';
  const meetingDate = dayjs(meeting.meetingDate);
  const now = dayjs();

  if (index === 0 && meetingDate.isBefore(now)) {
    return 'Held';
  }
  if (meetingDate.isBefore(now.subtract(7, 'day'))) {
    return 'Completed';
  }
  if (meetingDate.isAfter(now)) {
    return 'Requested';
  }
  return 'Held';
};

export const getMeetingDtoStatus = (meeting: MeetingDto): MeetingStatusType => {
  if (!meeting.startTime) return 'Requested';
  const startTime = dayjs(meeting.startTime);
  const now = dayjs();

  if (startTime.isAfter(now)) {
    return 'Requested';
  }
  if (meeting.endTime && dayjs(meeting.endTime).isBefore(now)) {
    return 'Completed';
  }
  return 'Held';
};

export const getMeetingStatusTagProps = (status: MeetingStatusType) => {
  switch (status) {
    case 'Held':
      return { color: 'processing', text: 'Held' };
    case 'Requested':
      return { color: 'purple', text: 'Requested' };
    case 'Completed':
      return { color: 'success', text: 'Completed' };
    default:
      return { color: 'default', text: status };
  }
};

export const parseAttendees = (participantsString?: string | null): MeetingAttendee[] => {
  if (!participantsString || participantsString.trim() === '' || participantsString === '—') {
    return [];
  }

  const rawList = participantsString
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return rawList.map((entry) => {
    const roleMatch = entry.match(/^(.*?)\s*[(-](.*?)[)]?$/);
    const name = roleMatch ? roleMatch[1].trim() : entry;
    const role = roleMatch ? roleMatch[2].trim() : 'Project Team';
    const style = getAvatarStyle(name);

    return {
      id: name.toLowerCase(),
      name,
      role,
      initials: getInitials(name),
      avatarBg: style.bg,
      avatarColor: style.color,
    };
  });
};

export const mapMeetingDtoToAttendees = (attendees?: MeetingAttendeeDto[]): MeetingAttendee[] => {
  if (!attendees || attendees.length === 0) return [];

  // Backends can return the same person on several rows (e.g. re-added after an
  // assignee change) — de-duplicate so the UI never shows a person twice.
  const seen = new Set<string>();
  const result: MeetingAttendee[] = [];

  attendees.forEach((att) => {
    const key = (att.applicationUserId || att.email || att.name || '').toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);

    const name = att.name || att.email || 'Participant';
    // External attendees come back with ProjectRole.None (0) — show "External User"
    // instead of a role; internals show their project role label (email as fallback).
    const role = att.isExternal
      ? 'External User'
      : getProjectRoleLabel(Number(att.role)) || att.email || 'Team Member';
    const style = getAvatarStyle(name);
    result.push({
      id: key,
      name,
      role,
      initials: getInitials(name),
      avatarBg: style.bg,
      avatarColor: style.color,
      isExternal: att.isExternal,
    });
  });

  return result;
};

export const getProjectRoleLabel = (role?: number | null): string => {
  switch (Number(role)) {
    case ProjectRole.Supervisor:
      return 'Supervisor';
    case ProjectRole.Contractor:
      return 'Contractor';
    case ProjectRole.Observer:
      return 'Observer';
    case ProjectRole.ProjectManager:
      return 'Project Manager';
    default:
      // ProjectRole.None (0) — externals; callers fall back to email / "External User".
      return '';
  }
};

export interface DisplayMeetingAction {
  id: string;
  ref: string;
  title: string;
  description: string;
  ownerName: string;
  ownerInitials: string;
  ownerAvatarBg: string;
  ownerAvatarColor: string;
  deadline: string;
  rawDeadline?: string | null;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Closed';
  conversationId?: string | null;
  assignees?: MeetingActionDto['assignees'];
  assignNotes?: string | null;
  completionNotes?: string | null;
  rawAction: MeetingActionDto;
}

export const mapActionToDisplay = (
  action: MeetingActionDto,
  index: number
): DisplayMeetingAction => {
  const ref = `A-${String(index + 1).padStart(2, '0')}`;
  const title = action.title || action.description || `Action ${index + 1}`;
  const description = action.description || action.assignNotes || '';

  let ownerName = 'Unassigned';
  if (action.assignees && action.assignees.length > 0) {
    const first = action.assignees[0];
    const extraCount = action.assignees.length - 1;
    ownerName = extraCount > 0 ? `${first.name} (+${extraCount})` : first.name;
  } else if (action.userFullName) {
    ownerName = action.userFullName;
  } else if (action.assignedUsers?.[0]?.name) {
    ownerName = action.assignedUsers[0].name;
  } else if (action.externalAttendees?.[0]?.name) {
    ownerName = action.externalAttendees[0].name;
  }

  const ownerInitials = getInitials(ownerName);
  const avatarStyle = getAvatarStyle(ownerName);

  let priority: 'High' | 'Medium' | 'Low' = 'Low';
  if (
    action.priority === 2 ||
    action.priority === '2' ||
    action.priority === 'High' ||
    action.priority === 'high'
  ) {
    priority = 'High';
  } else if (
    action.priority === 1 ||
    action.priority === '1' ||
    action.priority === 'Medium' ||
    action.priority === 'medium'
  ) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  // The API only carries isCompleted — derive the binary status from it.
  const status: 'Open' | 'Closed' = action.isCompleted ? 'Closed' : 'Open';

  const deadline = formatMeetingDate(action.dueDate);

  return {
    id: action.id || String(index),
    ref,
    title,
    description,
    ownerName,
    ownerInitials,
    ownerAvatarBg: avatarStyle.bg,
    ownerAvatarColor: avatarStyle.color,
    deadline,
    rawDeadline: action.dueDate,
    priority,
    status,
    conversationId: action.conversationId,
    assignees: action.assignees,
    assignNotes: action.assignNotes,
    completionNotes: action.completionNotes,
    rawAction: action,
  };
};
