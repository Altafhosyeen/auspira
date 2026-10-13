import { Tooltip } from 'antd';
import { Info } from 'lucide-react';
import type React from 'react';

/**
 * How-to-use-this-drawer help. Held as data (rather than inline JSX) because it is rendered in
 * two places — the expanded guidance panel and the info icon's hover tooltip — and the two must
 * not drift apart.
 */
export const DRAWER_HELP_ITEMS: { term: string; detail: React.ReactNode }[] = [
  {
    term: 'Contract route checkbox',
    detail:
      'Flags the value as contract-driven and triggers an email action to confirm the correct value via cross-reference.',
  },
  {
    term: 'View source (eye icon)',
    detail:
      'Opens the PDF at the exact page so the user can verify that the AI’s extraction is correct.',
  },
  {
    term: 'Radio button',
    detail: (
      <>
        Select a suggested value, then click <strong>Save</strong> to apply it and resolve the
        conflict.
      </>
    ),
  },
  {
    term: 'Enter another value',
    detail: (
      <>
        Manually enter the correct value if the suggested values are incorrect, then click{' '}
        <strong>Save</strong> to apply it.
      </>
    ),
  },
  {
    term: 'Save note',
    detail:
      'The source is automatically logged with your selection for auditability and traceability.',
  },
];

/** `className` carries the full list styling so each host can size it for its own surface. */
export const HelpBullets: React.FC<{ className?: string }> = ({ className }) => (
  <ul className={className}>
    {DRAWER_HELP_ITEMS.map((item) => (
      <li key={item.term}>
        <strong>{item.term}</strong> – {item.detail}
      </li>
    ))}
  </ul>
);

interface DataPointGuidancePanelProps {
  /** This data point's own guidance, straight off the API. May be empty. */
  descriptionText?: string;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Guidance panel above the suggested values: the data point's own description
 * clamped to two lines, the static help bullets once expanded, and an info icon
 * whose tooltip carries both without expanding the panel.
 */
export const DataPointGuidancePanel: React.FC<DataPointGuidancePanelProps> = ({
  descriptionText,
  expanded,
  onToggle,
}) => (
  // Guidance comes straight off the API (`ProjectCrossReference.description`) rather
  // than static copy, so it's specific to this data point (e.g. which clause governs
  // it) instead of a generic how-to-use-this-drawer blurb.
  <div className="mb-2 flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
    {/* Hovering the icon shows the whole thing — description plus every help bullet —
          without having to expand the panel and push the values further down. */}
    <Tooltip
      title={
        <div className="ds-caption! max-h-[60vh] overflow-y-auto font-medium!">
          {descriptionText && <p className="mb-2 whitespace-pre-line">{descriptionText}</p>}
          <HelpBullets className="mb-0 list-disc space-y-1.5 pl-4" />
        </div>
      }
      styles={{ root: { maxWidth: 440 } }}
    >
      <span className="bg-main-p mt-0.5 flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full">
        <Info className="h-5 w-5 text-white!" />
      </span>
    </Tooltip>

    <div className="min-w-0 flex-1">
      {/* 1. This data point's own guidance, clamped to two lines when collapsed. */}
      {descriptionText && (
        <p
          className={`ds-caption! mb-0! font-medium! whitespace-pre-line text-slate-600 ${
            expanded ? '' : 'line-clamp-2'
          }`}
        >
          {descriptionText}
        </p>
      )}

      {/* 2. Static how-to-use-this-drawer help, revealed with the full description —
              it's reference material, so it stays out of the collapsed summary. */}
      {expanded && (
        <HelpBullets
          className={`ds-caption! mt-1! mb-0! list-disc space-y-2 font-medium! text-slate-600 ${
            descriptionText ? 'mt-2' : ''
          }`}
        />
      )}

      {/* Always offered: even with a short description there are help bullets to open. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="ds-caption! mt-0.5 cursor-pointer font-semibold! text-blue-600! transition-colors hover:text-blue-700 hover:underline"
      >
        {expanded ? 'See less' : 'See more'}
      </button>
    </div>
  </div>
);
