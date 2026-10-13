import React from 'react';

/** White surface card shared across the register form + side panels. */
export const RegisterCard = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`rounded-lg border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
    {children}
  </div>
);

/** Small uppercase field label above an input. */
export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="ds-micro text-icon mb-1.5 block font-semibold tracking-wider uppercase">
    {children}
  </label>
);

/** Uppercase eyebrow heading used by the side-panel cards. */
export const CardEyebrow = ({ children }: { children: React.ReactNode }) => (
  <h4 className="ds-caption text-icon font-bold tracking-wider uppercase">{children}</h4>
);
