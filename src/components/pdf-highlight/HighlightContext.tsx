'use client';

import React, { createContext, use, useEffect, useRef } from 'react';
import {
  HighlightManager,
  HighlightRenderer,
  NavigationManager,
  SpanMapper,
} from '@/lib/pdf-highlight';

export interface HighlightContextValue {
  manager: HighlightManager;
  spanMapper: SpanMapper;
  renderer: HighlightRenderer;
  navigation: NavigationManager;
}

const HighlightContext = createContext<HighlightContextValue | null>(null);

function createEngine(): HighlightContextValue {
  const spanMapper = new SpanMapper();
  return {
    manager: new HighlightManager(),
    spanMapper,
    renderer: new HighlightRenderer(spanMapper),
    navigation: new NavigationManager(),
  };
}

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<HighlightContextValue | null>(null);
  engineRef.current ??= createEngine();
  const engine = engineRef.current;

  useEffect(() => {
    const { navigation } = engine;
    return () => navigation.cancel();
  }, [engine]);

  return <HighlightContext value={engine}>{children}</HighlightContext>;
}

export function useHighlightEngine(): HighlightContextValue {
  const context = use(HighlightContext);
  if (!context) {
    throw new Error('useHighlightEngine must be used inside a <HighlightProvider>');
  }
  return context;
}
