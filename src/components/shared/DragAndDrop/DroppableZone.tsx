'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';

// ─── DroppableZone ────────────────────────────────────────────────────────────

interface DroppableZoneProps {
  droppableId: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableZone = ({ droppableId, children, className = '' }: DroppableZoneProps) => (
  <Droppable droppableId={droppableId}>
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps} className={className}>
        {children}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);
