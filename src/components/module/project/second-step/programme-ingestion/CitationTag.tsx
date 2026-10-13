import React from 'react';

export const CitationTag: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  return (
    <span className="ds-micro! shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-medium! text-slate-700">
      {text}
    </span>
  );
};

CitationTag.displayName = 'CitationTag';
