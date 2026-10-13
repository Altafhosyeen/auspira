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
import { Button, Divider, Flex, Select, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { COMPOSE_EMAIL_COPY } from '../constants/compensation-event-email.constants';
import { QUOTATION_COLORS } from '../constants/compensation-event-quotation.theme';

const { editor: copy } = COMPOSE_EMAIL_COPY;

const EDITOR_CLASS = 'auspira-email-editor';

// Tailwind's preflight (imported globally) flattens lists, headings and links —
// `list-style: none`, `font-size: inherit`, `text-decoration: inherit`. Without this the
// list and heading commands run correctly but render identically to plain text. Scoped
// to the editing surface, which is the one place those tags have to look like email.
const EDITOR_CONTENT_CSS = `
.${EDITOR_CLASS} ol { list-style: decimal outside; padding-inline-start: 28px; margin: 8px 0; }
.${EDITOR_CLASS} ul { list-style: disc outside; padding-inline-start: 28px; margin: 8px 0; }
.${EDITOR_CLASS} li { margin: 2px 0; }
.${EDITOR_CLASS} h1 { font-size: 1.75em; font-weight: 600; margin: 12px 0 8px; }
.${EDITOR_CLASS} h2 { font-size: 1.4em; font-weight: 600; margin: 12px 0 8px; }
.${EDITOR_CLASS} p { margin: 0 0 8px; }
.${EDITOR_CLASS} a { color: ${QUOTATION_COLORS.link}; text-decoration: underline; }
`;

const BLOCK_OPTIONS = [
  { label: copy.paragraph, value: 'p' },
  { label: copy.heading1, value: 'h1' },
  { label: copy.heading2, value: 'h2' },
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
      title: copy.clearFormatting,
      icon: <FontSizeOutlined />,
      command: 'removeFormat',
    },
    { key: 'bold', title: copy.bold, icon: <BoldOutlined />, command: 'bold' },
    { key: 'italic', title: copy.italic, icon: <ItalicOutlined />, command: 'italic' },
    { key: 'underline', title: copy.underline, icon: <UnderlineOutlined />, command: 'underline' },
    {
      key: 'strikeThrough',
      title: copy.strikethrough,
      icon: <StrikethroughOutlined />,
      command: 'strikeThrough',
    },
  ],
  [
    {
      key: 'justifyLeft',
      title: copy.alignLeft,
      icon: <AlignLeftOutlined />,
      command: 'justifyLeft',
    },
    {
      key: 'justifyCenter',
      title: copy.alignCenter,
      icon: <AlignCenterOutlined />,
      command: 'justifyCenter',
    },
    {
      key: 'justifyRight',
      title: copy.alignRight,
      icon: <AlignRightOutlined />,
      command: 'justifyRight',
    },
  ],
  [
    {
      key: 'insertOrderedList',
      title: copy.orderedList,
      icon: <OrderedListOutlined />,
      command: 'insertOrderedList',
    },
    {
      key: 'insertUnorderedList',
      title: copy.bulletList,
      icon: <UnorderedListOutlined />,
      command: 'insertUnorderedList',
    },
  ],
  [
    // {
    //   key: 'insertImage',
    //   title: copy.image,
    //   icon: <PictureOutlined />,
    //   command: 'insertImage',
    //   prompt: copy.imagePrompt,
    // },
    {
      key: 'createLink',
      title: copy.link,
      icon: <LinkOutlined />,
      command: 'createLink',
      prompt: copy.linkPrompt,
    },
  ],
];

interface CompensationEventEmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

// A contentEditable surface driven by `document.execCommand`. The API is deprecated but
// still universally supported, and the repo has no rich-text dependency to lean on —
// swap this one component out when a real editor lands.
const CompensationEventEmailEditor = ({
  value,
  onChange,
  minHeight = 260,
}: CompensationEventEmailEditorProps) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  // Tracks the HTML this editor last emitted, so a value echoed back by the parent is
  // not written into the DOM again — doing that would reset the caret on every keystroke.
  const lastEmittedRef = useRef<string | null>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || value === lastEmittedRef.current) return;

    surface.innerHTML = value;
    lastEmittedRef.current = value;
  }, [value]);

  const emit = (html: string) => {
    lastEmittedRef.current = html;
    onChange(html);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (surfaceRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  // The toolbar buttons suppress their own mousedown, but a Select or Tooltip can still
  // drop the selection — restoring it keeps commands acting on what the user highlighted.
  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!selection || !range) return;

    selection.removeAllRanges();
    selection.addRange(range);
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

    // Produces semantic tags (<b>, <ul>) instead of inline-styled spans.
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand(command, false, argument);

    saveSelection();
    emit(surface.innerHTML);
  };

  return (
    <Flex
      vertical
      style={{
        border: `1px solid ${QUOTATION_COLORS.border}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <style>{EDITOR_CONTENT_CSS}</style>

      <Flex align="center" wrap style={{ borderBottom: `1px solid ${QUOTATION_COLORS.border}` }}>
        <Select
          variant="borderless"
          defaultValue="p"
          options={BLOCK_OPTIONS}
          onSelect={(block: string) => runCommand('formatBlock', undefined, `<${block}>`)}
          style={{ width: 150 }}
        />

        {TOOLBAR_GROUPS.map((group) => (
          <Flex key={group[0].key} align="center">
            <Divider type="vertical" style={{ height: 28, margin: 0 }} />
            {group.map((action) => (
              <Tooltip key={action.key} title={action.title}>
                <Button
                  type="text"
                  icon={action.icon}
                  aria-label={action.title}
                  // Keeps focus (and the highlighted range) inside the editing surface.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => runCommand(action.command, action.prompt)}
                />
              </Tooltip>
            ))}
          </Flex>
        ))}
      </Flex>

      {/* biome-ignore lint/a11y/useSemanticElements: rich text needs contentEditable, which input/textarea cannot provide */}
      <div
        ref={surfaceRef}
        className={EDITOR_CLASS}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-multiline
        aria-label={COMPOSE_EMAIL_COPY.labels.body}
        onInput={(event) => emit(event.currentTarget.innerHTML)}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={saveSelection}
        style={{ minHeight, outline: 'none', overflowY: 'auto', padding: 16 }}
      />
    </Flex>
  );
};

export default CompensationEventEmailEditor;
