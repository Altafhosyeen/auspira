/**
 * Required Documents Header
 * Header showing title + "X / Y UPLOADED" counter matching the reference design
 */

import React from 'react';
import { REQUIRED_DOCS } from '@/constants/project.constants';

interface RequiredDocumentsHeaderProps {
  uploadedCount: number;
}

export const RequiredDocumentsHeader: React.FC<RequiredDocumentsHeaderProps> = ({
  uploadedCount,
}) => {
  const total = REQUIRED_DOCS.length;
  const allDone = uploadedCount === total;

  return (
    <div className="mb-2 flex! items-center justify-end!">
      <span
        className={`ds-caption! font-semibold! tracking-wide uppercase ${
          allDone ? 'text-emerald-600' : 'text-slate-700'
        }`}
      >
        {uploadedCount} / {total} UPLOADED
      </span>
    </div>
  );
};

RequiredDocumentsHeader.displayName = 'RequiredDocumentsHeader';
