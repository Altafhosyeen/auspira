import { ProjectAlertType } from '@/constants';
import type { ImpactAssessmentDetail, ProjectAlert } from '@/hooks/modules/project-alerts';
import { AWARENESS_ASSESSMENT_COPY } from '../constants/awareness.constants';

// The Auspira assessment card on the signal review screen. Everything it states comes off the
// alert the evaluator actually sent — the precis it wrote, and the impact assessment it filled
// in — so the card never asserts a finding nothing supports. It used to render a fixed set of
// Early Warning bullets ("3-4 week slippage on piling…") that no field on the payload carried.

// One labelled fact the extractor read out of the signal's mail.
export interface AssessmentFinding {
  label: string;
  value: string;
}

// The assessment card's contents — null when the alert carries nothing to assess.
export interface AssessmentView {
  /** The extractor's own account of what was detected, richest wording available. */
  paragraphs: string[];
  /** The labelled facts off `impactAssessment`, in reading order. */
  findings: AssessmentFinding[];
  /** The contractual caveat, worded for the alert's own clause. */
  note: string;
}

const text = (value?: string | null): string => (value ?? '').trim();

// The assessment card, or null when there is nothing to show.
//
// `summary` is the extractor's precis of the mail and `description` the same account at more
// length, so the precis leads and the description only stands in when it is missing. The
// findings are read off `impactAssessment` — the flags alongside them are booleans the backend
// leaves unset on most signals, which is why the card states the free-text findings rather than
// inferring an impact type the payload never claimed.
export const toAssessmentView = (
  alert: ProjectAlert,
  impact: ImpactAssessmentDetail | null
): AssessmentView | null => {
  const copy = AWARENESS_ASSESSMENT_COPY;
  const narrative = text(alert.summary) || text(alert.description);

  const findings: AssessmentFinding[] = [
    { label: copy.potentialImpacts, value: text(impact?.potentialImpacts) },
    { label: copy.keyDatesAffected, value: text(impact?.keyDatesAffected) },
    { label: copy.proposedActions, value: text(impact?.proposedActions) },
  ].filter((finding) => !!finding.value);

  // Nothing read out of the mail at all. An empty card would claim Auspira assessed a signal it
  // had nothing to say about, so the section is dropped instead.
  if (!narrative && findings.length === 0) return null;

  // The Early Warning caveat cites the clause the alert was raised under — read off the payload
  // rather than written in, so a signal raised under a different clause does not claim 15.1.
  const clauseNumber = text(alert.clauseNumber);

  return {
    paragraphs: narrative ? [narrative] : [],
    findings,
    note:
      alert.alertType === ProjectAlertType.EarlyWarning
        ? copy.ewNote(clauseNumber ? copy.ewClause(clauseNumber) : '')
        : copy.genericNote,
  };
};
