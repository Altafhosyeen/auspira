'use client';

import React, { useMemo, useRef, useState } from 'react';

/**
 * Email bodies are raw HTML from external mailboxes, so they are rendered in a
 * sandboxed iframe: `allow-scripts` is deliberately absent (nothing can execute),
 * while `allow-same-origin` lets the parent measure the height for auto-resize.
 */
export const EmailBodyFrame: React.FC<{ html: string }> = ({ html }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(120);

  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><head><base target="_blank"><style>
        body{margin:0;padding:4px 2px;font-family:'Segoe UI',system-ui,sans-serif;
             font-size:14px;line-height:1.5;color:#242424;word-break:break-word}
        img{max-width:100%}
      </style></head><body>${html}</body></html>`,
    [html]
  );

  // Grow to the full content height — the thread list is the only scrollbar,
  // so a long email never gets a nested scroll area of its own.
  const syncHeight = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc?.documentElement) setHeight(doc.documentElement.scrollHeight + 8);
  };

  // Images load after the document does and change the height — re-sync per image.
  const handleLoad = () => {
    syncHeight();
    frameRef.current?.contentDocument
      ?.querySelectorAll('img')
      .forEach((img) => img.addEventListener('load', syncHeight));
  };

  return (
    <iframe
      ref={frameRef}
      sandbox="allow-same-origin"
      srcDoc={srcDoc}
      onLoad={handleLoad}
      title="Email message"
      className="w-full border-0"
      style={{ height }}
    />
  );
};
