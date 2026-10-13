import { SearchSlash, ShieldCheck } from 'lucide-react';
import type React from 'react';

type EmptyStateTone = 'neutral' | 'success';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  /** 'success' is the "all clear" look (emerald chip, ShieldCheck) — for a table that is
   *  empty because there is genuinely nothing outstanding, not because a filter matched
   *  nothing. Defaults to the neutral slate look every existing caller already expects. */
  tone?: EmptyStateTone;
}

const TONE_CHIP_BG: Record<EmptyStateTone, string> = {
  neutral: 'bg-slate-100',
  success: 'bg-emerald-50',
};

const TONE_DEFAULT_ICON: Record<EmptyStateTone, React.ReactNode> = {
  neutral: <SearchSlash className="text-slate-700" size={22} />,
  success: <ShieldCheck className="text-emerald-500" size={22} />,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No results found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  icon,
  className = '',
  tone = 'neutral',
}) => (
  <div className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
    <div
      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${TONE_CHIP_BG[tone]}`}
    >
      {icon ?? TONE_DEFAULT_ICON[tone]}
    </div>
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    <p className="mt-1 max-w-xs text-xs text-slate-700">{description}</p>
  </div>
);

export default EmptyState;
