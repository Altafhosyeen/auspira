'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

interface ExpandableTextProps {
  children: React.ReactNode;
  /** Number of lines to show when collapsed. Defaults to 2. */
  lines?: number;
  className?: string;
}

/**
 * Clamps its content to `lines` when collapsed and reveals a "See more" /
 * "See less" toggle only when the content actually overflows.
 */
export function ExpandableText({ children, lines = 2, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Overflow is detectable while collapsed (clamp active).
    if (!expanded) {
      setIsClamped(el.scrollHeight - el.clientHeight > 1);
    }
  }, [children, expanded, lines]);

  return (
    <div className={className}>
      <p
        ref={ref}
        style={
          expanded
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: lines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {children}
      </p>
      {(isClamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ds-caption! mt-0.5 cursor-pointer font-semibold! text-blue-600! transition-colors hover:text-blue-700 hover:underline"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
}
