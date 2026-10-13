import { CheckCircleOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { PMI_FORM_COPY } from '../constants/pmi-form.constants';
import type { PmiCrossReferenceOrigin } from '../types/pmi.types';

const copy = PMI_FORM_COPY;

// Presentational — the context strip above the Create PMI form when the instruction was
// raised from a cross-reference data point. It restates what the PM just agreed in the
// drawer (the data point and the value marked as contract route), so the form is not the
// only thing on screen once they have navigated away from it. The cross-reference id
// stays out of the UI — it is a wire detail, carried in the query string and the POST.
const PmiCrossReferenceOriginCard = ({ origin }: { origin: PmiCrossReferenceOrigin }) => {
  const dataPoint = origin.dataPoint.trim();
  const value = origin.value.trim();

  // The link is only worth a strip while it has something to say. A cross-reference that
  // carried neither a name, a value nor a route would render an empty box, so the badge
  // in the header is left to say where the instruction came from on its own.
  if (!dataPoint && !value && !origin.isContractRoute) return null;

  return (
    <Card
      className="border-badge-info bg-badge-info-soft"
      styles={{ body: { padding: '14px 20px' } }}
    >
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Flex align="center" gap={12} style={{ minWidth: 0 }}>
          <LinkOutlined className="text-badge-info" style={{ fontSize: 18, flexShrink: 0 }} />
          {/* Only the text truncates — wrapping this column in a tooltip or letting the
              flex row own the min-width would collapse it. */}
          <div style={{ minWidth: 0 }}>
            <div className="ds-caption text-main-p">
              {origin.isContractRoute
                ? copy.crossReferenceContractRoute
                : copy.crossReferenceTooltip}
            </div>
            {dataPoint && (
              <Typography.Text
                strong
                ellipsis={{ tooltip: dataPoint }}
                style={{ display: 'block' }}
              >
                {dataPoint}
              </Typography.Text>
            )}
          </div>
        </Flex>

        {/* The value the PM agreed, stated rather than collected — it is settled in the
            drawer, so this only reminds them what the instruction is being raised over.
            Marking a contract route does not require picking a value, so that path often
            arrives with none: the route chip then stands on its own. */}
        <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
          {value ? (
            <>
              <FileTextOutlined className="text-badge-info" />
              <span className="ds-caption text-main-p">{copy.crossReferenceAgreedValue}</span>
              <span className="badge-info ds-caption rounded px-2 py-0.5 font-semibold">
                {value}
              </span>
            </>
          ) : null}
          {origin.isContractRoute && (
            <span className="badge-success ds-caption inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-semibold">
              <CheckCircleOutlined />
              {copy.crossReferenceRouteChip}
            </span>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default PmiCrossReferenceOriginCard;
