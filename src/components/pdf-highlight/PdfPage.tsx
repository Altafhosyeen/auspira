'use client';

import React, { useEffect, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import type { PdfDocumentProxy, PdfPageViewport } from '@/lib/pdf-highlight';
import { HighlightLayer } from './HighlightLayer';
import { useHighlightEngine } from './HighlightContext';
import { usePdfIndex } from './hooks/usePdfIndex';

export interface PdfPageProps {
  pdf: PdfDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  textLayer?: boolean;
}

export function PdfPage({ pdf, pageNumber, scale, rotation, textLayer = true }: PdfPageProps) {
  const { spanMapper, renderer } = useHighlightEngine();
  const { index: pageIndex } = usePdfIndex(pageNumber);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);

  const [viewport, setViewport] = useState<PdfPageViewport | null>(null);
  const [textDivs, setTextDivs] = useState<HTMLElement[] | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void } | null = null;
    let layer: InstanceType<typeof pdfjs.TextLayer> | null = null;

    const run = async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;

      const pageViewport = page.getViewport({ scale, rotation });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(pageViewport.width * dpr);
      canvas.height = Math.floor(pageViewport.height * dpr);
      canvas.style.width = `${Math.floor(pageViewport.width)}px`;
      canvas.style.height = `${Math.floor(pageViewport.height)}px`;

      const task = page.render({
        canvas,
        viewport: pageViewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      });
      renderTask = task;
      await task.promise;
      if (cancelled) return;

      setViewport(pageViewport);

      if (!textLayer || !textLayerRef.current) return;

      try {
        const textContent = await page.getTextContent();
        if (cancelled) return;

        const container = textLayerRef.current;
        container.replaceChildren();
        // pdf.js resolves span positions/sizes through --total-scale-factor,
        // which globals.css derives as --scale-factor * --user-unit. Both
        // inputs must be set before the TextLayer renders, or every span's
        // font-size calc() is invalid and highlight geometry drifts.
        container.style.setProperty('--scale-factor', String(scale));
        container.style.setProperty('--user-unit', String(pageViewport.userUnit ?? 1));

        layer = new pdfjs.TextLayer({
          textContentSource: textContent,
          container,
          viewport: pageViewport,
        });
        await layer.render();
        if (cancelled) return;

        container.style.width = `${Math.floor(pageViewport.width)}px`;
        container.style.height = `${Math.floor(pageViewport.height)}px`;
        setTextDivs(layer.textDivs);
      } catch {
        setTextDivs(null);
      } finally {
        if (!cancelled) setRenderKey((k) => k + 1);
      }
    };

    void run();

    return () => {
      cancelled = true;
      renderTask?.cancel();
      layer?.cancel();
    };
  }, [pdf, pageNumber, scale, rotation, textLayer]);

  // Register live DOM handles with the central engine
  useEffect(() => {
    if (!shellRef.current) return;

    spanMapper.registerPage({
      pageNumber,
      pageElement: shellRef.current,
      textLayerElement: textLayerRef.current,
      textDivs,
      viewport,
      rotation,
      renderKey,
    });

    if (textDivs && textDivs.length > 0) {
      renderer.invalidateApproximate(pageNumber);
    }

    return () => spanMapper.unregisterPage(pageNumber);
  }, [pageNumber, renderKey, renderer, rotation, spanMapper, textDivs, viewport]);

  return (
    <div ref={shellRef} className="pdf-page-shell relative bg-white shadow-md">
      <canvas ref={canvasRef} className="block" />
      <HighlightLayer
        pageNumber={pageNumber}
        pageIndex={pageIndex}
        rotation={rotation}
        renderKey={renderKey}
      />
      {textLayer && <div ref={textLayerRef} className="textLayer absolute inset-0" />}
    </div>
  );
}

/**
 * A fixed-size placeholder for a page that is scrolled out of view.
 *
 * Reserving the exact footprint is what stops a newly-drawn page from
 * collapsing the layout and shifting a scroll target out from under a jump.
 */
export function PdfPagePlaceholder({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center bg-white shadow-md" style={{ width, height }}>
      {children}
    </div>
  );
}
