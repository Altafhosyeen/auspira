'use client';

import type { ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';

interface EwIconFieldProps {
  icon: ReactNode;
  children: ReactNode;
  /** 'start' pins the icon square to the top — for multiline controls (textareas). */
  align?: 'center' | 'start';
  // Form.Item injects value/onChange/id/etc. onto its direct child — this component
  // MUST forward everything to the real control, otherwise the form never updates.
  [key: string]: unknown;
}

/** Field container with a leading icon square — the meeting modal field style. */
export const EwIconField = ({ icon, children, align = 'center', ...rest }: EwIconFieldProps) => {
  // Form.Item injects value/onChange onto its direct child — hand them to the
  // wrapped control so the form field stays connected.
  const field = isValidElement(children) ? cloneElement(children, rest) : children;

  return (
    <div
      className={`flex w-full overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-surface)] ${
        align === 'start' ? 'items-start' : 'items-stretch'
      }`}
    >
      <div
        className={`flex w-11 shrink-0 justify-center border-r border-[var(--theme-border)] bg-[var(--ds-surface-subtle)] text-[#949BAA] ${
          align === 'start' ? 'pt-3.5' : 'items-center'
        }`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 items-center">{field}</div>
    </div>
  );
};

export default EwIconField;
