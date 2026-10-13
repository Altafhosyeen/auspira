import { InfoCard } from '../EarlyWarningFormControls';
import { EW_FORM_COPY } from '../early-warning-form.data';
import { EW_FORM_STYLES as S } from '../early-warning-form.styles';

const { labels } = EW_FORM_COPY;

interface ClauseReferencesCardProps {
  /** The originating alert's clause reference, e.g. "Clause 15.1 - Early Warning". */
  clauseDescription?: string | null;
}

export const ClauseReferencesCard = ({ clauseDescription }: ClauseReferencesCardProps) => {
  if (!clauseDescription) return null;

  return (
    <InfoCard title={labels.clauseReferences}>
      <div className={S.chipWrap}>
        <span className={S.chip}>{clauseDescription}</span>
      </div>
    </InfoCard>
  );
};
