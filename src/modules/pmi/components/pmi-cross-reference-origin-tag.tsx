import { LinkOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { PMI_FORM_COPY } from '../constants/pmi-form.constants';
import { crossReferenceOriginLabel } from '../hooks/use-pmi-cross-reference-origin';
import type { PmiCrossReferenceOrigin } from '../types/pmi.types';

const copy = PMI_FORM_COPY;

// Presentational — the header badge shown when the register was opened from a
// cross-reference data point. The heading already prints the data point's name, so
// the badge only says where it came from; the cross-reference id stays out of the UI.
const PmiCrossReferenceOriginTag = ({ origin }: { origin: PmiCrossReferenceOrigin }) => {
  const label = crossReferenceOriginLabel(origin);
  const tooltip = label ? `${copy.crossReferenceTooltip} — ${label}` : copy.crossReferenceTooltip;

  return (
    <Tooltip title={tooltip}>
      <span className="badge-info ds-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold">
        <LinkOutlined />
        {copy.crossReferenceOrigin}
      </span>
    </Tooltip>
  );
};

export default PmiCrossReferenceOriginTag;
