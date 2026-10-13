'use client';

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  FontSizeOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Divider, Flex, message, Select, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { SEMANTIC_COLORS } from '@/constants';

const EDITOR_CLASS = 'auspira-meeting-rich-editor';

const EDITOR_CONTENT_CSS = `
.${EDITOR_CLASS} ol { list-style: decimal outside; padding-inline-start: 24px; margin: 6px 0; }
.${EDITOR_CLASS} ul { list-style: disc outside; padding-inline-start: 24px; margin: 6px 0; }
.${EDITOR_CLASS} li { margin: 2px 0; }
.${EDITOR_CLASS} h1 { font-size: 1.5em; font-weight: 600; margin: 10px 0 6px; }
.${EDITOR_CLASS} h2 { font-size: 1.25em; font-weight: 600; margin: 8px 0 4px; }
.${EDITOR_CLASS} p { margin: 0 0 6px; }
.${EDITOR_CLASS} a { color: #0284C7; text-decoration: underline; }
.${EDITOR_CLASS}[data-empty='true']::before {
  content: attr(data-placeholder);
  color: var(--ds-icon, #98A2B3);
  pointer-events: none;
  display: block;
}
`;

const BLOCK_OPTIONS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
];

interface ToolbarAction {
  key: string;
  title: string;
  icon: ReactNode;
  command: string;
  prompt?: string;
}

const TOOLBAR_GROUPS: ToolbarAction[][] = [
  [
    {
      key: 'removeFormat',
      title: 'Clear formatting',
      icon: <FontSizeOutlined style={{ fontSize: 13 }} />,
      command: 'removeFormat',
    },
    {
      key: 'bold',
      title: 'Bold',
      icon: <BoldOutlined style={{ fontSize: 13 }} />,
      command: 'bold',
    },
    {
      key: 'italic',
      title: 'Italic',
      icon: <ItalicOutlined style={{ fontSize: 13 }} />,
      command: 'italic',
    },
    {
      key: 'underline',
      title: 'Underline',
      icon: <UnderlineOutlined style={{ fontSize: 13 }} />,
      command: 'underline',
    },
    {
      key: 'strikeThrough',
      title: 'Strikethrough',
      icon: <StrikethroughOutlined style={{ fontSize: 13 }} />,
      command: 'strikeThrough',
    },
  ],
  [
    {
      key: 'justifyLeft',
      title: 'Align left',
      icon: <AlignLeftOutlined style={{ fontSize: 13 }} />,
      command: 'justifyLeft',
    },
    {
      key: 'justifyCenter',
      title: 'Align center',
      icon: <AlignCenterOutlined style={{ fontSize: 13 }} />,
      command: 'justifyCenter',
    },
    {
      key: 'justifyRight',
      title: 'Align right',
      icon: <AlignRightOutlined style={{ fontSize: 13 }} />,
      command: 'justifyRight',
    },
  ],
  [
    {
      key: 'insertOrderedList',
      title: 'Numbered list',
      icon: <OrderedListOutlined style={{ fontSize: 13 }} />,
      command: 'insertOrderedList',
    },
    {
      key: 'insertUnorderedList',
      title: 'Bullet list',
      icon: <UnorderedListOutlined style={{ fontSize: 13 }} />,
      command: 'insertUnorderedList',
    },
  ],
  [
    {
      key: 'insertImage',
      title: 'Insert image URL',
      icon: <PictureOutlined style={{ fontSize: 13 }} />,
      command: 'insertImage',
      prompt: 'Enter image URL:',
    },
    {
      key: 'createLink',
      title: 'Insert link',
      icon: <LinkOutlined style={{ fontSize: 13 }} />,
      command: 'createLink',
      prompt: 'Enter link URL:',
    },
  ],
];

interface EwRichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// Browsers leave a stray <br> behind after clearing a contentEditable, so
// emptiness is tracked in a data-attribute instead of relying on :empty.
const setEmptyFlag = (surface: HTMLElement) => {
  const hasContent = !!surface.textContent?.trim() || !!surface.querySelector('img, li');
  surface.setAttribute('data-empty', hasContent ? 'false' : 'true');
};

export const EwRichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Write here...',
  minHeight = 130,
}: EwRichTextEditorProps) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedRef = useRef<string | null>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || value === lastEmittedRef.current) return;

    surface.innerHTML = value;
    lastEmittedRef.current = value;
    setEmptyFlag(surface);
  }, [value]);

  const emit = (html: string) => {
    lastEmittedRef.current = html;
    onChange?.(html);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (surfaceRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!selection || !range) return;

    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Pasting images into the agenda is not allowed — images belong in the
  // documents upload, not in the agenda text. Rich text pastes that embed an
  // <img> keep their text but have the image stripped out.
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const { clipboardData } = event;
    const pastedHtml = clipboardData.getData('text/html') || '';

    if (Array.from(clipboardData.items).some((item) => item.type.startsWith('image/'))) {
      event.preventDefault();
      message.warning('Pasting images is not allowed in the agenda.');
      return;
    }

    if (/<img\b/i.test(pastedHtml)) {
      event.preventDefault();
      const cleaned = pastedHtml.replace(/<img\b[^>]*>/gi, '');
      if (cleaned.trim()) {
        const surface = surfaceRef.current;
        if (!surface) return;
        surface.focus();
        restoreSelection();
        document.execCommand('insertHTML', false, cleaned);
      }
      saveSelection();
      emit(surfaceRef.current?.innerHTML ?? '');
      if (surfaceRef.current) setEmptyFlag(surfaceRef.current);
    }
  };

  const runCommand = (command: string, promptLabel?: string, directArgument?: string) => {
    const surface = surfaceRef.current;
    if (!surface) return;

    let argument = directArgument;
    if (promptLabel) {
      const entered = window.prompt(promptLabel);
      if (!entered) return;
      argument = entered;
    }

    surface.focus();
    restoreSelection();

    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand(command, false, argument);

    saveSelection();
    emit(surface.innerHTML);
    if (surfaceRef.current) setEmptyFlag(surfaceRef.current);
  };

  return (
    <Flex
      vertical
      style={{
        border: '1px solid var(--theme-border)',
        borderRadius: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--theme-surface)',
      }}
    >
      <style>{EDITOR_CONTENT_CSS}</style>

      {/* Toolbar */}
      <Flex
        align="center"
        wrap
        style={{
          borderBottom: '1px solid var(--theme-border)',
          backgroundColor: 'var(--theme-surface)',
          padding: '4px 8px',
          gap: 2,
        }}
      >
        <Select
          variant="borderless"
          defaultValue="p"
          options={BLOCK_OPTIONS}
          onSelect={(block: string) => runCommand('formatBlock', undefined, `<${block}>`)}
          style={{ width: 115, fontWeight: 500 }}
        />

        {TOOLBAR_GROUPS.map((group) => (
          <Flex key={group[0].key} align="center" gap={1}>
            <Divider
              type="vertical"
              style={{ height: 20, margin: '0 4px', borderColor: 'var(--theme-border)' }}
            />
            {group.map((action) => (
              <Tooltip key={action.key} title={action.title}>
                <Button
                  type="text"
                  size="small"
                  icon={action.icon}
                  aria-label={action.title}
                  style={{ width: 28, height: 28, color: 'var(--ds-icon)' }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => runCommand(action.command, action.prompt)}
                />
              </Tooltip>
            ))}
          </Flex>
        ))}
      </Flex>

      {/* Surface */}
      {/* biome-ignore lint/a11y/useSemanticElements: rich text needs contentEditable */}
      <div
        ref={surfaceRef}
        className={EDITOR_CLASS}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-multiline
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        data-empty="true"
        onInput={(event) => {
          emit(event.currentTarget.innerHTML);
          setEmptyFlag(event.currentTarget);
        }}
        onPaste={handlePaste}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={saveSelection}
        style={{
          minHeight,
          outline: 'none',
          overflowY: 'auto',
          padding: '12px 14px',
          fontSize: 13,
          color: SEMANTIC_COLORS.text,
          lineHeight: 1.6,
        }}
      />
    </Flex>
  );
};

export default EwRichTextEditor;
