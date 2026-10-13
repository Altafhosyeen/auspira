import React from 'react';

interface DocumentSectionHeaderProps {
  number?: string;
  title?: string;
  className?: string;
}

export const DocumentSectionHeader: React.FC<DocumentSectionHeaderProps> = ({
  number = 'Z',
  title,
  className = '',
}) => {
  if (!title?.trim()) return null;

  return (
    <div
      className={`flex min-w-0 flex-nowrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 ${className}`.trim()}
    >
      <span className="bg-main-p flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md px-2 text-sm! leading-none! font-bold! whitespace-nowrap text-white tabular-nums">
        {number}
      </span>
      <h3 className="text-text m-0 min-w-0 flex-1 self-center overflow-hidden text-sm! leading-[1.4]! font-bold! tracking-tight text-ellipsis whitespace-nowrap">
        {title}
      </h3>
    </div>
  );
};
