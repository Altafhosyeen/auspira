import { Col, Row, Typography } from 'antd';
import type { ReactNode } from 'react';
import { QUOTATION_SIZES } from '../constants/compensation-event-quotation.theme';

interface CompensationEventLabelValueRowProps {
  label: string;
  value: ReactNode;
  labelSpan?: number;
  /** Overrides the row's type scale — Programme Impact reads at body size. */
  fontSize?: number;
}

// Muted label beside free-form content — shared by Programme Impact and PM Assessment.
const CompensationEventLabelValueRow = ({
  label,
  value,
  labelSpan = QUOTATION_SIZES.labelColumnSpan,
  fontSize = QUOTATION_SIZES.memberFontSize,
}: CompensationEventLabelValueRowProps) => (
  <Row gutter={16} align="middle">
    <Col span={labelSpan}>
      <Typography.Text type="secondary" style={{ fontSize }}>
        {label}
      </Typography.Text>
    </Col>
    <Col span={24 - labelSpan}>
      {typeof value === 'string' ? (
        <Typography.Text style={{ fontSize }}>{value}</Typography.Text>
      ) : (
        value
      )}
    </Col>
  </Row>
);

export default CompensationEventLabelValueRow;
