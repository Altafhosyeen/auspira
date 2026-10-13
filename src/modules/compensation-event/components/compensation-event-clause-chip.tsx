import ClauseChip from '@/components/shared/clause-chip';
import type { ClauseChip as ClauseChipValue } from '../utils/compensation-event-clause.utils';

interface CompensationEventClauseChipProps {
  // Built by `resolveClauseChip` off the record on screen; undefined drops the chip.
  chip?: ClauseChipValue;
}

// The "CL.62 / 63" pill the workflow headers wear. Kept as a thin alias so this module's
// headers keep their own name for it, while the pill itself is the shared `ClauseChip`
// every other register uses — the two used to be separate copies that drifted apart.
const CompensationEventClauseChip = ({ chip }: CompensationEventClauseChipProps) => (
  <ClauseChip chip={chip} />
);

export default CompensationEventClauseChip;
