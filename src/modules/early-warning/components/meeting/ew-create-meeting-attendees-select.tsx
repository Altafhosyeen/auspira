'use client';

import { CloseOutlined, MailOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Avatar, Dropdown, Input, Spin, Tag, Tooltip, Typography } from 'antd';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UserLookupDto } from '../../types/early-warning-api.types';
import EwAssigneesDropdownMenu from './ew-assignees-dropdown-menu';
import { type EwCreateMeetingAttendeesSelectProps, resolveKey } from './ew-assignees-select.types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EwCreateMeetingAttendeesSelect: React.FC<EwCreateMeetingAttendeesSelectProps> = ({
  value = [],
  onChange,
  projectUsers = [],
  existingAssignees = [],
  loading = false,
  disabled = false,
  borderless = false,
  placeholder,
  id,
  onBlur,
  className,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [errorText, setErrorText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>(380);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(
    () => () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    },
    []
  );

  // Close the suggestion list when clicking anywhere outside the field + popup.
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isOpen]);

  const isKeySelected = useCallback(
    (keyToCheck: string) => {
      const norm = keyToCheck.trim().toLowerCase();
      return value.some((v) => v.trim().toLowerCase() === norm);
    },
    [value]
  );

  const isUserSelected = useCallback(
    (user: UserLookupDto) => {
      const normId = user.id.toLowerCase();
      const normEmail = (user.email || '').toLowerCase();
      return value.some((v) => {
        const nv = v.trim().toLowerCase();
        return nv === normId || (normEmail && nv === normEmail);
      });
    },
    [value]
  );

  const availableProjectUsers = useMemo(() => {
    return projectUsers.filter((u) => !isUserSelected(u));
  }, [projectUsers, isUserSelected]);

  const filteredProjectUsers = useMemo(() => {
    if (!searchText.trim()) return [];
    const term = searchText.trim().toLowerCase();
    return availableProjectUsers.filter(
      (u) => u.fullName.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
  }, [availableProjectUsers, searchText]);

  const trimmedSearch = searchText.trim();

  // A typed, valid email becomes an "Add as External" suggestion row (Gmail-style).
  const canAddExternal = useMemo(() => {
    if (!trimmedSearch || isKeySelected(trimmedSearch)) return false;
    const matchesInternal = projectUsers.some(
      (u) => u.email?.toLowerCase() === trimmedSearch.toLowerCase()
    );
    return !matchesInternal && EMAIL_RE.test(trimmedSearch);
  }, [trimmedSearch, isKeySelected, projectUsers]);

  const showSuggestions =
    isOpen && !disabled && !loading && (filteredProjectUsers.length > 0 || canAddExternal);

  const clearTransientState = () => {
    setSearchText('');
    setErrorText('');
    setHighlightedIndex(0);
  };

  // Gmail-style commit: an internal member match (by id or email) wins, otherwise
  // the text must be a valid email to become an external chip. Invalid text stays
  // in the input with an error — it never becomes a chip.
  const commitText = (raw: string): boolean => {
    const text = raw.trim();
    if (!text) return false;

    const matchedUser = projectUsers.find(
      (u) =>
        u.id.toLowerCase() === text.toLowerCase() ||
        (u.email && u.email.toLowerCase() === text.toLowerCase())
    );
    const keyToAdd = matchedUser ? matchedUser.id : text;

    if (isKeySelected(keyToAdd)) {
      clearTransientState();
      return true;
    }

    if (matchedUser || EMAIL_RE.test(text)) {
      onChange?.([...value, keyToAdd]);
      clearTransientState();
      return true;
    }

    setErrorText('Enter a valid email address');
    return false;
  };

  const selectUser = (user: UserLookupDto) => {
    if (!isKeySelected(user.id)) {
      onChange?.([...value, user.id]);
    }
    clearTransientState();
    inputRef.current?.focus();
  };

  const handleRemoveKey = (keyToRemove: string) => {
    const norm = keyToRemove.trim().toLowerCase();
    const next = value.filter((k) => k.trim().toLowerCase() !== norm);
    onChange?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (showSuggestions) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) => {
          const max = filteredProjectUsers.length - 1;
          const next = e.key === 'ArrowDown' ? prev + 1 : prev - 1;
          return Math.max(0, Math.min(next, max));
        });
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      // Internal suggestion picked directly; typed emails commit as external.
      if (showSuggestions && !trimmedSearch.includes('@')) {
        const target =
          filteredProjectUsers[Math.min(highlightedIndex, filteredProjectUsers.length - 1)];
        if (target) selectUser(target);
        return;
      }
      commitText(trimmedSearch);
      return;
    }

    if (e.key === 'Tab') {
      if (trimmedSearch) commitText(trimmedSearch);
      return;
    }

    if (e.key === ',' || e.key === ';') {
      if (trimmedSearch) {
        e.preventDefault();
        commitText(trimmedSearch);
      }
      return;
    }

    if (e.key === 'Backspace' && !searchText && value.length > 0) {
      e.preventDefault();
      onChange?.(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    // Gmail commits a valid address on blur; invalid text stays in the input.
    if (trimmedSearch) commitText(trimmedSearch);
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => setIsOpen(false), 150);
    onBlur?.();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;

    const tokens = pasteData
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;

    const currentKeys = new Set(value.map((k) => k.trim().toLowerCase()));
    const keysToAdd: string[] = [];
    let firstInvalid: string | null = null;

    for (const token of tokens) {
      const matchedUser = projectUsers.find(
        (u) =>
          u.id.toLowerCase() === token.toLowerCase() ||
          (u.email && u.email.toLowerCase() === token.toLowerCase())
      );
      const key = matchedUser ? matchedUser.id : token;
      if (matchedUser || EMAIL_RE.test(token)) {
        if (!currentKeys.has(key.toLowerCase())) {
          keysToAdd.push(key);
          currentKeys.add(key.toLowerCase());
        }
      } else if (!firstInvalid) {
        firstInvalid = token;
      }
    }

    e.preventDefault();
    if (keysToAdd.length > 0) {
      onChange?.([...value, ...keysToAdd]);
    }
    setSearchText(firstInvalid || '');
    setErrorText(firstInvalid ? 'Enter a valid email address' : '');
  };

  return (
    <Dropdown
      open={showSuggestions}
      trigger={[]}
      placement="bottomLeft"
      dropdownRender={() => (
        <EwAssigneesDropdownMenu
          dropdownRef={dropdownRef}
          containerWidth={containerWidth}
          trimmedSearch={trimmedSearch}
          canAddExternal={canAddExternal}
          filteredProjectUsers={filteredProjectUsers}
          highlightedIndex={highlightedIndex}
          onAddExternal={() => commitText(trimmedSearch)}
          onSelectUser={selectUser}
          onHighlight={setHighlightedIndex}
        />
      )}
    >
      <div
        ref={containerRef}
        id={id}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-haspopup="listbox"
        aria-invalid={!!errorText}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (disabled) return;
          if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
          inputRef.current?.focus();
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          // The input handles its own keys; only act when the container itself has focus.
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
        style={{
          width: '100%',
          minHeight: 40,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 6,
          padding: borderless ? '4px 6px' : '4px 10px',
          backgroundColor: borderless ? 'transparent' : 'var(--theme-surface, #ffffff)',
          border: borderless
            ? 'none'
            : `1px solid ${
                errorText
                  ? 'var(--ant-color-error, #ff4d4f)'
                  : isOpen
                    ? 'var(--ant-primary-color, #1677ff)'
                    : 'var(--theme-border, #d9d9d9)'
              }`,
          borderRadius: borderless ? 0 : 8,
          boxShadow: !borderless && isOpen ? '0 0 0 2px rgba(22, 119, 255, 0.12)' : 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'all 0.2s',
          ...style,
        }}
        className={className}
      >
        {value.map((key) => {
          const info = resolveKey(key, projectUsers, existingAssignees);
          return (
            <Tag
              key={key}
              closable={!disabled}
              onClose={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveKey(key);
              }}
              closeIcon={<CloseOutlined style={{ fontSize: 9 }} />}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                margin: 0,
                padding: '2px 8px 2px 4px',
                borderRadius: 16,
                backgroundColor: info.isExternal
                  ? 'rgba(22, 119, 255, 0.08)'
                  : 'var(--ds-surface-table-header, #f5f5f7)',
                border: info.isExternal
                  ? '1px solid rgba(22, 119, 255, 0.28)'
                  : '1px solid var(--theme-border, #e5e7eb)',
              }}
            >
              <Avatar
                size={18}
                style={{
                  backgroundColor: info.isExternal ? '#e6f4ff' : info.avatarBg,
                  color: info.isExternal ? '#1677ff' : info.avatarColor,
                  fontSize: 9,
                  fontWeight: 600,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                icon={info.isExternal ? <MailOutlined style={{ fontSize: 9 }} /> : undefined}
              >
                {!info.isExternal && info.initials}
              </Avatar>

              <Tooltip
                title={
                  info.isExternal
                    ? `External Attendee: ${info.email || info.displayName}`
                    : `${info.displayName} (${info.email})`
                }
              >
                <Typography.Text
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--theme-text-primary, #1f2937)',
                    maxWidth: 140,
                  }}
                  ellipsis
                >
                  {info.displayName}
                </Typography.Text>
              </Tooltip>

              {info.isExternal && (
                <Tag
                  color="blue"
                  bordered={false}
                  style={{
                    margin: 0,
                    fontSize: 9,
                    lineHeight: '14px',
                    padding: '0 4px',
                    fontWeight: 600,
                    borderRadius: 3,
                  }}
                >
                  External
                </Tag>
              )}
            </Tag>
          );
        })}

        <div style={{ flex: 1, minWidth: value.length > 0 ? 80 : 220 }}>
          <Input
            ref={inputRef}
            variant="borderless"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setErrorText('');
              setHighlightedIndex(0);
              // The popup only becomes visible once the text matches members.
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            // Constant prefix so the underlying input element is never remounted
            // (a remount would drop focus on the very first keystroke).
            prefix={
              <SearchOutlined
                style={{ color: 'var(--ds-icon, #8c8c8c)', fontSize: 13, marginRight: 4 }}
              />
            }
            placeholder={
              value.length > 0
                ? 'Add more...'
                : placeholder || 'Search project members or enter email...'
            }
            disabled={disabled}
            status={errorText ? 'error' : undefined}
            style={{
              padding: 0,
              fontSize: 13,
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {loading && <Spin size="small" style={{ flexShrink: 0 }} />}

        {errorText && (
          <Typography.Text type="danger" style={{ flexBasis: '100%', fontSize: 12, paddingTop: 2 }}>
            {errorText}
          </Typography.Text>
        )}
      </div>
    </Dropdown>
  );
};

export const EwAssigneesSelect = EwCreateMeetingAttendeesSelect;
export default EwCreateMeetingAttendeesSelect;
