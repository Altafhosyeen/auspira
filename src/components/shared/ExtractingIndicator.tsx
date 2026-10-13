/**
 * ExtractingIndicator
 * Animated inline loader shown while an AI extraction is running.
 * - Spinning glyph + shimmering "Extracting…" label
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LoadingOutlined } from '@ant-design/icons';

interface ExtractingIndicatorProps {
  /** When true, the indicator is visible. */
  active: boolean;
  /** Optional label; defaults to "Extracting". */
  label?: string;
}

export const ExtractingIndicator: React.FC<ExtractingIndicatorProps> = ({
  active,
  label = 'Extracting',
}) => {
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="inline-flex items-center gap-2 rounded-full border border-[#cfe0ff] bg-[#f4f8ff] px-3 py-1"
    >
      <motion.span
        aria-hidden
        className="flex h-4 w-4 items-center justify-center text-[15px] text-[#2f6bff]"
        animate={{ rotate: 360 }}
        transition={{ rotate: { repeat: Infinity, ease: 'linear', duration: 0.9 } }}
      >
        <LoadingOutlined />
      </motion.span>

      <span className="text-sm font-semibold text-[#245de0]">
        {label}
        <motion.span
          aria-hidden
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          …
        </motion.span>
      </span>
    </motion.div>
  );
};

ExtractingIndicator.displayName = 'ExtractingIndicator';
