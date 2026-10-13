import type React from 'react';
import type { UserLookupDto } from '../../types/early-warning-api.types';
import { getAvatarStyle, getInitials } from '../../utils/early-warning-meeting.utils';

export interface ExistingAssigneeInfo {
  id?: string;
  applicationUserId?: string | null;
  name?: string | null;
  email?: string | null;
  role?: number | string | null;
  isExternal?: boolean;
  avatarUrl?: string | null;
}

export interface EwCreateMeetingAttendeesSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  projectUsers?: UserLookupDto[];
  existingAssignees?: ExistingAssigneeInfo[];
  loading?: boolean;
  disabled?: boolean;
  borderless?: boolean;
  placeholder?: string;
  id?: string;
  onBlur?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface ResolvedAssignee {
  key: string;
  displayName: string;
  email: string;
  isExternal: boolean;
  roleText?: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
}

// Resolves a stored key (internal user id or external email) into display data.
export const resolveKey = (
  key: string,
  projectUsers: UserLookupDto[] = [],
  existingAssignees: ExistingAssigneeInfo[] = []
): ResolvedAssignee => {
  const normKey = key.trim().toLowerCase();

  const matchedProjectUser = projectUsers.find(
    (u) => u.id.toLowerCase() === normKey || (u.email && u.email.toLowerCase() === normKey)
  );
  if (matchedProjectUser) {
    const displayName = matchedProjectUser.fullName || matchedProjectUser.email;
    const style = getAvatarStyle(displayName);
    return {
      key,
      displayName,
      email: matchedProjectUser.email,
      isExternal: false,
      roleText: 'Project Member',
      initials: getInitials(displayName),
      avatarBg: style.bg,
      avatarColor: style.color,
    };
  }

  const matchedExisting = existingAssignees.find(
    (a) =>
      (a.id && a.id.toLowerCase() === normKey) ||
      (a.applicationUserId && a.applicationUserId.toLowerCase() === normKey) ||
      (a.email && a.email.toLowerCase() === normKey)
  );
  if (matchedExisting) {
    const displayName = matchedExisting.name || matchedExisting.email || key;
    const isExternal = Boolean(matchedExisting.isExternal);
    const style = getAvatarStyle(displayName);
    return {
      key,
      displayName,
      email: matchedExisting.email || '',
      isExternal,
      roleText: isExternal ? 'External User' : 'Team Member',
      initials: getInitials(displayName),
      avatarBg: style.bg,
      avatarColor: style.color,
    };
  }

  const style = getAvatarStyle(key);
  return {
    key,
    displayName: key,
    email: key,
    isExternal: true,
    roleText: 'External',
    initials: getInitials(key),
    avatarBg: style.bg,
    avatarColor: style.color,
  };
};
