import { Tooltip } from 'antd';
import { Eye } from 'lucide-react';
import React from 'react';
import type { SourceOverviewData } from '@/components/document-json-view/option-source/SourceOverviewDialog';
import type { TimelineItem } from './types';
import { WhoBadge } from './WhoBadge';

interface TimeBarRowProps {
  item: TimelineItem;
  group: string;
  isModifiesExpanded: boolean;
  onViewSource: (source: SourceOverviewData) => void;
}

/**
 * The SOURCE cell shows a shortened label — the full value goes in the tooltip. Values arrive
 * either as "<something> | <name>" or as a path, so prefer the name after the pipe, then the
 * last path segment, then the raw string.
 */
const shortSourceLabel = (source: string) =>
  source.split(' | ')[1] || source.split('/').pop() || source;

/** One clause row, plus its "Modifications" detail row when expanded. */
export const TimeBarRow: React.FC<TimeBarRowProps> = ({
  item,
  group,
  isModifiesExpanded,
  onViewSource,
}) => {
  const isModified = item.modified;

  return (
    <React.Fragment>
      <tr className="transition-colors hover:bg-slate-50/50">
        <td className="ds-caption! px-4 py-3 font-bold! text-slate-900">{item.clause}</td>

        <td className="ds-caption! px-4 py-3 font-bold!">
          <span className={isModified ? 'text-badge-warning!' : 'text-slate-800'}>
            {item.period}
          </span>
          {isModified && item.modifiedTag && (
            <span className="badge-warning ds-micro! ml-1.5 inline-flex items-center rounded px-1.5 py-0.5 font-extrabold! tracking-wide">
              {item.modifiedTag}
            </span>
          )}
        </td>

        <td className="px-4 py-3 text-center">
          <WhoBadge who={item.who} />
        </td>

        <td className="ds-caption! px-4 py-3 font-normal! text-slate-600">{item.clockStarts}</td>

        {/* Category — replaces the old per-category section heading */}
        <td className="px-4 py-3">
          <span className="ds-micro! font-bold! tracking-wider text-slate-500 uppercase">
            {group}
          </span>
        </td>

        <td className="ds-micro! px-4 py-3 font-medium! text-slate-700">
          {item.source !== '-' ? (
            <Tooltip
              title={<div className="ds-caption!">{item.source}</div>}
              overlayStyle={{ maxWidth: '350px' }}
            >
              <div className="cursor-help text-slate-500 hover:text-slate-700">
                <span className="ds-micro! inline-block max-w-20 truncate font-medium!">
                  {shortSourceLabel(item.source)}
                </span>
              </div>
            </Tooltip>
          ) : (
            <span>{item.source}</span>
          )}
        </td>

        <td className="px-4 py-3 text-center">
          <button
            type="button"
            onClick={() => item.sourceRef && onViewSource(item.sourceRef)}
            disabled={!item.sourceRef}
            title="View source clause"
            className="inline-flex cursor-pointer text-slate-700 transition-colors hover:text-slate-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eye size={16} />
          </button>
        </td>
      </tr>

      {isModifiesExpanded && item.modifies && (
        <tr className="bg-blue-50/30 hover:bg-blue-50/50">
          <td colSpan={7} className="px-4 py-3">
            <div className="space-y-2">
              <div className="ds-micro! font-bold! tracking-wider text-slate-600 uppercase">
                Modifications
              </div>
              <div className="ds-caption! rounded bg-white px-3 py-2 text-slate-700">
                {item.modifies}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
