import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { EW_FORM_COPY } from '../early-warning-form.data';
import { EW_FORM_STYLES as S } from '../early-warning-form.styles';

const { header } = EW_FORM_COPY;

interface FormHeaderProps {
  /**
   * Clause the source alert was flagged under. Passed through when the form is reached from a
   * signal review so this badge reads identically to the one on the screen the user just left;
   * manual entry has no alert behind it and falls back to the generic NEC4 clause. Also doubles
   * as the tooltip body once the badge itself switches to the number, so the wording isn't lost.
   */
  clauseBadge?: string | null;
  /** Clause number off the alert, e.g. "15.1" — prefixed onto the badge when present. */
  clauseNumber?: string | null;
}

export const FormHeader = ({ clauseBadge, clauseNumber }: FormHeaderProps) => {
  const badgeText = clauseNumber ? `NEC4 Cl. ${clauseNumber}` : clauseBadge || header.clauseBadge;
  const tooltipText = clauseNumber && clauseBadge ? clauseBadge : header.subtitle;

  return (
    <header>
      <div className={S.headerRow}>
        <h1 className={S.title}>{header.title}</h1>
        <span className={S.clauseBadge}>{badgeText}</span>
        {/* Clause wording, read once — it hangs off this icon rather than taking a line under
            the title. Icon is aria-hidden; the sentence below carries it for screen readers,
            which cannot reach a hover tooltip. */}
        <Tooltip title={tooltipText}>
          <InfoCircleOutlined
            aria-hidden
            className="cursor-help text-base text-slate-400 transition-colors hover:text-slate-600"
          />
        </Tooltip>
      </div>
      <p className="sr-only">{tooltipText}</p>
    </header>
  );
};
