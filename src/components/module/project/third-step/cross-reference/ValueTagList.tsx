'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

interface ValueTagListProps {
  values: string[];
  tagClassName: string;
}

/**
 * Wrapped pill list for a finding's extracted values. Collapses to a single-line
 * max height with a "See more" toggle once the tags overflow past that — the max
 * height is measured from the first tag's real rendered size (not a hardcoded
 * px value), so it holds up at any card/row width or tag padding.
 */
export const ValueTagList: React.FC<ValueTagListProps> = ({ values, tagClassName }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const firstTagRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [oneLineHeight, setOneLineHeight] = useState<number | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const firstTag = firstTagRef.current;
    if (!wrapper || !firstTag) return;
    const max = firstTag.offsetHeight;
    setOneLineHeight(max);
    setOverflowing(wrapper.scrollHeight > max + 1);
  }, [values]);

  return (
    <div>
      <div
        ref={wrapperRef}
        className="flex flex-wrap gap-1.5"
        style={
          !expanded && oneLineHeight ? { maxHeight: oneLineHeight, overflow: 'hidden' } : undefined
        }
      >
        {values.map((value, i) => (
          <span
            key={`${value}-${i}`}
            ref={i === 0 ? firstTagRef : undefined}
            title={value}
            className={tagClassName}
          >
            {value}
          </span>
        ))}
      </div>
      {overflowing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="ds-micro! mt-1 font-semibold! text-blue-500! hover:underline"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
};

ValueTagList.displayName = 'ValueTagList';
