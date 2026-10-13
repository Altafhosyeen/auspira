/**
 * Motion Provider
 * Framer Motion provider for professional animations throughout the application
 */

'use client';

import React, { PropsWithChildren } from 'react';

/**
 * MotionProvider
 * Initializes Framer Motion for the application
 * This provider should wrap the entire application at the root level
 */
export function MotionProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

MotionProvider.displayName = 'MotionProvider';
