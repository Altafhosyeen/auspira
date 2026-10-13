'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DraggableWrapperProps {
  draggableId: string;
  index: number;
  children: React.ReactNode;
  className?: string | ((isDragging: boolean) => string);
  isDragDisabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DraggableItem = ({
  draggableId,
  index,
  children,
  className,
  isDragDisabled = false,
}: DraggableWrapperProps) => (
  <Draggable draggableId={draggableId} index={index} isDragDisabled={isDragDisabled}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={
          typeof className === 'function' ? className(snapshot.isDragging) : (className ?? '')
        }
      >
        {children}
      </div>
    )}
  </Draggable>
);

export default DraggableItem;
