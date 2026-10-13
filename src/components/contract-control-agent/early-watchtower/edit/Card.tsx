import React from 'react';

/** White surface card used across both columns. */
export const Card = ({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

/** Small uppercase eyebrow heading used by the right-column cards. */
export const CardEyebrow = ({ children }: { children: React.ReactNode }) => (
  <h4 className="ds-caption text-icon font-bold tracking-wider uppercase">{children}</h4>
);
