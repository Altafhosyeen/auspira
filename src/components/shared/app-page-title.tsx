import { Card, Flex, Tooltip, Typography } from 'antd';
import type { ReactNode } from 'react';
import { APP_COLORS } from '@/constants/app.theme';
import ClauseChip from './clause-chip';
import IconChip from './icon-chip';

// The chip prints the clause number under one prefix across every header.
const CLAUSE_LABEL_PREFIX = 'CL.';

export interface ClauseBadge {
  /** e.g. "15.1" or "NEC4 Cl. 15.1" → prefix stripped so tag renders only "15.1". */
  number?: string;
  /** Custom label for the chip tag if provided (prefix stripped). */
  label?: string;
  /** Reference to prepend to the tooltip line (e.g. "EWN-1239" or "CE-004"). */
  reference?: string;
  /** Full clause title (tooltip). */
  title?: string;
  /** Clause description (tooltip). */
  description?: string;
  /** Structured multi-line entries for the tooltip (matching Compensation Event format). */
  lines?: string[];
}

export interface AppPageTitleProps {
  icon: ReactNode;
  title: string;
  /** Clause badge + tooltip — pass the values from the record, never hardcode here. */
  clause?: ClauseBadge;
  /** Right-hand slot (buttons/children) — e.g. "Risk Reduction Meeting →". */
  actions?: ReactNode;
}

// Exported so callers can normalise a stored clause ("Cl. 17.1", "Clause 17.1", "17.1")
// to the bare number by the same rule the badge uses, instead of restating the regex.
export const stripClausePrefix = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  // "clause" must precede "cl\.?" in each alternation — regex takes the first branch that
  // matches, so the shorter one would strip "Cl" off "Clause 17.1" and leave "ause 17.1".
  const stripped = value.replace(/^(nec4\s*(clause|cl\.?)\s*|clause\s*|cl\.?\s*)/i, '').trim();
  return stripped || value.trim();
};

// Shared page title bar — icon chip + navy title + clause tag (tooltip) + optional actions.
const AppPageTitle = ({ icon, title, clause, actions }: AppPageTitleProps) => {
  const lines: string[] =
    clause?.lines && clause.lines.length > 0
      ? clause.lines
      : (() => {
          const detail = clause?.description || clause?.title;
          if (clause?.reference && detail) {
            return [`${clause.reference} – ${detail}`];
          }
          if (detail) {
            return [detail];
          }
          return clause?.number ? [`Clause ${stripClausePrefix(clause.number)}`] : [];
        })();

  // Prefixed "CL.62" like the Compensation Event and RFI chips, so the same clause reads
  // the same way whichever header it appears in. An explicit `label` is printed as given.
  const clauseNumber = stripClausePrefix(clause?.number);
  const tagLabel =
    clause?.label ?? (clauseNumber ? `${CLAUSE_LABEL_PREFIX}${clauseNumber}` : undefined);

  return (
    <Card styles={{ body: { padding: '12px 20px' } }}>
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Flex align="center" gap={12} style={{ minWidth: 0, flex: 1 }}>
          <div style={{ flexShrink: 0 }}>
            <IconChip icon={icon} size={36} />
          </div>
          <Tooltip title={title} placement="topLeft">
            <Typography.Title
              level={2}
              ellipsis={{ rows: 1 }}
              style={{
                margin: 0,
                fontSize: 20,
                color: APP_COLORS.main,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography.Title>
          </Tooltip>
          <ClauseChip chip={{ label: tagLabel, lines }} />
        </Flex>
        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </Flex>
    </Card>
  );
};

export default AppPageTitle;
