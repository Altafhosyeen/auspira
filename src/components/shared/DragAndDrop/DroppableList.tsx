'use client';

import React from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DroppableListProps {
  droppableId: string;
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DroppableList = ({
  droppableId,
  onDragEnd,
  children,
  className = '',
}: DroppableListProps) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className={className}>
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
);

export default DroppableList;
