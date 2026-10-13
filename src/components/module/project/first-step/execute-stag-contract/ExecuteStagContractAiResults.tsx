import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { ApiZClause } from '@/components/contract/Z-clauses';

const { Text } = Typography;

interface ExecuteStagContractAiResultsProps {
  clauses: ApiZClause[];
}

// Amendments modify an existing NEC clause, so they carry more risk than brand-new Z-clauses.
// Each category maps to a soft badge palette consistent with the document-review UI.
const CATEGORY_STYLE: Record<string, string> = {
  Amendment: 'badge-error border-badge-error/20',
  New: 'badge-info border-badge-info/20',
};
const categoryBadgeClass = (category: string): string =>
  CATEGORY_STYLE[category] ?? 'border-slate-200 bg-slate-50 text-slate-500';

const INITIAL_VISIBLE = 3;

// Placeholder titles the extractor emits for empty/unused clause slots — hide these rather than
// listing them as real clauses.
const PLACEHOLDER_TITLES = new Set(['not used', 'not found']);
const isRealClause = (clause: ApiZClause): boolean =>
  !PLACEHOLDER_TITLES.has((clause.title ?? '').trim().toLowerCase());

export const ExecuteStagContractAiResults: React.FC<ExecuteStagContractAiResultsProps> = ({
  clauses,
}) => {
  const [expanded, setExpanded] = useState(false);
  // Accordion: only one clause description is open at a time. Clicking an open clause closes it;
  // clicking another closes the previous and opens the new one.
  const [openId, setOpenId] = useState<string | number | null>(null);
  // Drop placeholder ("Not Used" / "Not Found") entries so the count and list show only real clauses.
  const realClauses = clauses.filter(isRealClause);
  const visibleClauses = expanded ? realClauses : realClauses.slice(0, INITIAL_VISIBLE);
  const hasMore = realClauses.length > INITIAL_VISIBLE;

  // Z-clauses are extracted asynchronously — hide the whole card until at least one exists
  // (secondary options now render separately, next to the toggle buttons in the parent step).
  if (realClauses.length === 0) return null;

  return (
    <Card
      bordered={false}
      className="border-theme-border mt-4! rounded-2xl border shadow-none"
      styles={{ body: { padding: 0 } }}
    >
      <div className="p-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Text className="ds-caption! block font-bold! tracking-wide text-slate-500 uppercase">
              Key Z Clauses
            </Text>
            <span className="bg-main-p/10 ds-caption! text-main-p inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-bold!">
              {realClauses.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {visibleClauses.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border bg-white transition-colors ${
                    isOpen ? 'border-slate-300' : 'border-theme-border hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-main-p ds-caption! flex h-7 shrink-0 items-center justify-center rounded-md px-2 font-bold! text-white">
                        {item.number}
                      </span>
                      <Text className="ds-body! text-text min-w-0 truncate font-semibold!">
                        {item.title}
                      </Text>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5">
                      <span
                        className={`ds-micro! inline-flex items-center rounded-md border px-2 py-0.5 font-bold! tracking-wide uppercase ${categoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                      <DownOutlined
                        className={`ds-caption! text-icon transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && item.description && (
                    <div className="px-4 pb-4 pl-[3.25rem]">
                      <Text className="ds-caption! block text-slate-600">{item.description}</Text>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="bg-surface-subtle ds-caption! text-main-p hover:border-main-p hover:bg-main-p/5 mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 font-semibold! transition-colors"
            >
              {expanded
                ? 'See less'
                : `See ${realClauses.length - INITIAL_VISIBLE} more clause${realClauses.length - INITIAL_VISIBLE > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

ExecuteStagContractAiResults.displayName = 'ExecuteStagContractAiResults';
