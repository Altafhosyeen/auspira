'use client';

import React from 'react';

interface AuthCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({
  icon,
  title,
  description,
  children,
  footer,
  className = '',
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7ff] p-4">
      <div
        className={`w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 shadow-sm ${className}`}
      >
        {/* Icon */}
        {icon && <div className="mb-4 flex justify-center text-blue-600">{icon}</div>}

        {/* Title */}
        <h2 className="heading-section mb-2 text-center">{title}</h2>

        {/* Description */}
        {description && (
          <p className="text-theme-primary mb-6 text-center text-sm">{description}</p>
        )}

        {/* Content */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthCard;
