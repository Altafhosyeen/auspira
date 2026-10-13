'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Options {
  storageKey?: string;
  margin?: number;
  disabled?: boolean;
}

const DRAG_THRESHOLD_PX = 4;

const readStoredPosition = (storageKey?: string): Position | null => {
  if (!storageKey || typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Position>;
    if (typeof parsed?.x !== 'number' || typeof parsed?.y !== 'number') return null;

    return { x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
};

const clampToViewport = (position: Position, element: HTMLElement | null, margin: number) => {
  if (typeof window === 'undefined' || !element) return position;

  const { offsetWidth, offsetHeight } = element;
  const maxX = Math.max(margin, window.innerWidth - offsetWidth - margin);
  const maxY = Math.max(margin, window.innerHeight - offsetHeight - margin);

  return {
    x: Math.min(Math.max(position.x, margin), maxX),
    y: Math.min(Math.max(position.y, margin), maxY),
  };
};

export const useDraggable = ({ storageKey, margin = 12, disabled = false }: Options = {}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const pointerOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const pointerStartRef = useRef<Position>({ x: 0, y: 0 });
  const draggedRef = useRef(false);

  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const stored = readStoredPosition(storageKey);
    if (stored) setPosition(stored);
  }, [storageKey]);

  useEffect(() => {
    if (!position || !storageKey) return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(position));
    } catch {
      // Storage can be unavailable (private mode, blocked site data) — ignore.
    }
  }, [position, storageKey]);

  useEffect(() => {
    if (!position) return;

    const handleResize = () =>
      setPosition((prev) => (prev ? clampToViewport(prev, nodeRef.current, margin) : prev));

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, margin]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) return;

      const node = nodeRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();

      pointerOffsetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      draggedRef.current = false;

      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      setPosition({ x: rect.left, y: rect.top });
    },
    [disabled]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!isDragging) return;

      const movedX = Math.abs(event.clientX - pointerStartRef.current.x);
      const movedY = Math.abs(event.clientY - pointerStartRef.current.y);

      if (!draggedRef.current && movedX < DRAG_THRESHOLD_PX && movedY < DRAG_THRESHOLD_PX) return;

      draggedRef.current = true;

      setPosition(
        clampToViewport(
          {
            x: event.clientX - pointerOffsetRef.current.x,
            y: event.clientY - pointerOffsetRef.current.y,
          },
          nodeRef.current,
          margin
        )
      );
    },
    [isDragging, margin]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!isDragging) return;

      event.currentTarget.releasePointerCapture(event.pointerId);
      setIsDragging(false);
    },
    [isDragging]
  );

  // Native HTML5 drag (images, links, selected text inside a handle) steals the
  // pointer stream and fires pointercancel mid-drag — suppress it on the handle.
  const onDragStart = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const wasDragged = useCallback(() => draggedRef.current, []);

  const style: React.CSSProperties = position
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : {};

  return {
    nodeRef,
    style,
    isDragging,
    wasDragged,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onDragStart,
    },
  };
};
