'use client';

import React, { useEffect, useState } from 'react';
import type { NormalizedRect, PageIndex } from '@/lib/pdf-highlight';
import { useHighlightEngine } from './HighlightContext';
import { useActiveHighlightId, usePageHighlights } from './hooks/useHighlight';

export interface HighlightLayerProps {
  pageNumber: number;
  pageIndex: PageIndex | null;
  rotation: number;
  renderKey: number;
  className?: string;
}

const MAX_MEASURE_ATTEMPTS = 20;
const EMPTY_MEASUREMENTS: ReadonlyMap<string, NormalizedRect[]> = new Map();

export function HighlightLayer({
  pageNumber,
  pageIndex,
  rotation,
  renderKey,
  className,
}: HighlightLayerProps) {
  const { renderer } = useHighlightEngine();
  const highlights = usePageHighlights(pageNumber);
  const activeId = useActiveHighlightId();

  const [measured, setMeasured] =
    useState<ReadonlyMap<string, NormalizedRect[]>>(EMPTY_MEASUREMENTS);

  useEffect(() => {
    if (highlights.length === 0) {
      setMeasured((previous) => (previous.size === 0 ? previous : EMPTY_MEASUREMENTS));
      return;
    }

    let cancelled = false;
    let frame = 0;
    let attempts = 0;

    const run = () => {
      if (cancelled) return;

      const next = new Map<string, NormalizedRect[]>();
      let pending = false;

      for (const highlight of highlights) {
        const rendered = renderer.measure(highlight, pageIndex ?? undefined, rotation);
        if (rendered && rendered.rects.length > 0) next.set(highlight.id, rendered.rects);
        else pending = true;
      }

      setMeasured((previous) => (sameMeasurements(previous, next) ? previous : next));

      // Retry measurement if text layer spans are still building
      if (pending && attempts++ < MAX_MEASURE_ATTEMPTS) {
        frame = requestAnimationFrame(run);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
    };
  }, [highlights, pageIndex, renderer, renderKey, rotation]);

  if (highlights.length === 0) return null;

  return (
    <div className={`pdfHighlightLayer ${className ?? ''}`} aria-hidden="true">
      {highlights.map((highlight) => {
        const rects = measured.get(highlight.id);
        if (!rects) return null;
        const isActive = highlight.id === activeId;
        const color = isActive ? highlight.activeColor : highlight.color;

        return rects.map((rect) => (
          <span
            key={`${highlight.id}:${rect.x.toFixed(5)}:${rect.y.toFixed(5)}`}
            data-highlight-id={highlight.id}
            className={isActive ? 'pdfHighlight pdfHighlight--active' : 'pdfHighlight'}
            style={{
              position: 'absolute',
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.w * 100}%`,
              height: `${rect.h * 100}%`,
              backgroundColor: color,
              zIndex: isActive ? 2 : 1,
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
            }}
          />
        ));
      })}
    </div>
  );
}

function sameMeasurements(
  a: ReadonlyMap<string, NormalizedRect[]>,
  b: ReadonlyMap<string, NormalizedRect[]>
): boolean {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) {
    if (b.get(key) !== value) return false;
  }
  return true;
}
