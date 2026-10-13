'use client';

import React from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';

// ─── DragContext ───────────────────────────────────────────────────────────────

interface DragContextProps {
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
}

export const DragContext = ({ onDragEnd, children }: DragContextProps) => (
  <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
);
