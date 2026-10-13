'use client';

import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import { Avatar, Flex, Tag, Typography } from 'antd';
import type React from 'react';
import type { UserLookupDto } from '../../types/early-warning-api.types';
import { getAvatarStyle, getInitials } from '../../utils/early-warning-meeting.utils';

export interface EwAssigneesDropdownMenuProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  containerWidth: number;
  trimmedSearch: string;
  canAddExternal: boolean;
  filteredProjectUsers: UserLookupDto[];
  highlightedIndex: number;
  onAddExternal: () => void;
  onSelectUser: (user: UserLookupDto) => void;
  onHighlight: (index: number) => void;
}

export const EwAssigneesDropdownMenu: React.FC<EwAssigneesDropdownMenuProps> = ({
  dropdownRef,
  containerWidth,
  trimmedSearch,
  canAddExternal,
  filteredProjectUsers,
  highlightedIndex,
  onAddExternal,
  onSelectUser,
  onHighlight,
}) => (
  <div
    ref={dropdownRef}
    role="listbox"
    aria-label="Project members"
    // Keep focus in the input when clicking a suggestion so blur never races the click.
    onMouseDown={(e) => e.preventDefault()}
    style={{
      width: Math.max(containerWidth, 360),
      maxHeight: 320,
      overflowY: 'auto',
      backgroundColor: 'var(--theme-surface, #ffffff)',
      border: '1px solid var(--theme-border, #e5e7eb)',
      borderRadius: 8,
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
      padding: '6px 0',
    }}
  >
    {canAddExternal && (
      <button
        type="button"
        onClick={onAddExternal}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '10px 14px',
          cursor: 'pointer',
          backgroundColor: 'rgba(22, 119, 255, 0.06)',
          border: 'none',
          borderBottom: '1px solid var(--theme-border, #f0f0f0)',
          transition: 'background-color 0.15s',
        }}
      >
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={10} style={{ minWidth: 0 }}>
            <Avatar
              size={26}
              style={{ backgroundColor: '#e6f4ff', color: '#1677ff', flexShrink: 0 }}
              icon={<UserAddOutlined style={{ fontSize: 13 }} />}
            />
            <Flex vertical style={{ minWidth: 0 }}>
              <Flex align="center" gap={6} wrap="wrap">
                <Typography.Text strong style={{ fontSize: 13, color: '#1677ff' }} ellipsis>
                  Add &ldquo;{trimmedSearch}&rdquo;
                </Typography.Text>
                <Tag
                  color="blue"
                  bordered={false}
                  style={{ margin: 0, fontSize: 10, lineHeight: '14px', padding: '1px 5px' }}
                >
                  External
                </Tag>
              </Flex>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                Press Enter or click to add
              </Typography.Text>
            </Flex>
          </Flex>
          <PlusOutlined style={{ color: '#1677ff', fontSize: 14, flexShrink: 0 }} />
        </Flex>
      </button>
    )}

    {filteredProjectUsers.length > 0 && (
      <>
        <Flex
          justify="space-between"
          align="center"
          style={{
            padding: '6px 14px',
            backgroundColor: 'var(--ds-surface-subtle, #fafafa)',
            borderBottom: '1px solid var(--theme-border, #f0f0f0)',
          }}
        >
          <Typography.Text
            type="secondary"
            strong
            style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Project Members
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {filteredProjectUsers.length} available
          </Typography.Text>
        </Flex>

        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {filteredProjectUsers.map((user, index) => {
            const avatarStyle = getAvatarStyle(user.fullName);
            const initials = getInitials(user.fullName);
            const isHighlighted = index === highlightedIndex;
            return (
              <button
                type="button"
                key={user.id}
                onClick={() => onSelectUser(user)}
                onMouseEnter={() => onHighlight(index)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: isHighlighted ? 'var(--ds-surface-subtle, #f5f5f5)' : 'none',
                  border: 'none',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                    <Avatar
                      size={28}
                      style={{
                        backgroundColor: avatarStyle.bg,
                        color: avatarStyle.color,
                        fontWeight: 600,
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Flex vertical style={{ minWidth: 0 }}>
                      <Typography.Text strong style={{ fontSize: 13 }} ellipsis>
                        {user.fullName}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }} ellipsis>
                        {user.email}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                  <Tag
                    bordered={false}
                    style={{
                      margin: 0,
                      fontSize: 10,
                      backgroundColor: 'var(--ds-surface-subtle, #f0f0f0)',
                      color: 'var(--ds-main-p, #595959)',
                      flexShrink: 0,
                    }}
                  >
                    Member
                  </Tag>
                </Flex>
              </button>
            );
          })}
        </div>
      </>
    )}
  </div>
);

export default EwAssigneesDropdownMenu;
