import { WarningOutlined } from '@ant-design/icons';
import { Card, Divider, Flex, Tag, Typography } from 'antd';
import { PM_ASSESSMENT_COPY } from '../constants/compensation-event-assessment.constants';
import {
  ASSESSMENT_COLORS,
  ASSESSMENT_SIZES,
} from '../constants/compensation-event-assessment.theme';
import type { LateEarlyWarningCheck } from '../types/compensation-event-assessment.types';
import { parseEmphasis } from '../utils/compensation-event-assessment.utils';

interface CompensationEventAssessmentClauseWarningProps {
  check: LateEarlyWarningCheck;
}

// Amber NEC4 Cl.63.7 banner — the rule on top, this event's finding under the rule.
const CompensationEventAssessmentClauseWarning = ({
  check,
}: CompensationEventAssessmentClauseWarningProps) => (
  <Card
    style={{
      backgroundColor: ASSESSMENT_COLORS.warningBg,
      borderColor: ASSESSMENT_COLORS.warningBorder,
    }}
    styles={{ body: { padding: '18px 20px' } }}
  >
    <Flex align="flex-start" gap={12}>
      <WarningOutlined
        style={{
          color: ASSESSMENT_COLORS.warningTitle,
          flex: 'none',
          fontSize: ASSESSMENT_SIZES.warningIconFontSize,
        }}
      />

      <Flex vertical flex={1} gap={10} style={{ minWidth: 0 }}>
        <Flex align="center" gap={10} wrap>
          <Typography.Text
            strong
            style={{
              color: ASSESSMENT_COLORS.warningTitle,
              fontSize: ASSESSMENT_SIZES.warningTitleFontSize,
            }}
          >
            {PM_ASSESSMENT_COPY.lateCheck.title}
          </Typography.Text>
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 4,
              backgroundColor: ASSESSMENT_COLORS.warningChipBg,
              color: ASSESSMENT_COLORS.warningChipText,
            }}
          >
            {check.riskLabel}
          </Tag>
        </Flex>

        <Typography.Paragraph style={{ margin: 0, fontSize: ASSESSMENT_SIZES.warningBodyFontSize }}>
          {parseEmphasis(check.rule).map((segment) => (
            <Typography.Text
              key={segment.text}
              strong={segment.strong}
              style={{ fontSize: ASSESSMENT_SIZES.warningBodyFontSize }}
            >
              {segment.text}
            </Typography.Text>
          ))}
        </Typography.Paragraph>

        {check.finding && (
          <>
            <Divider style={{ margin: 0, borderColor: ASSESSMENT_COLORS.warningDivider }} />

            <Typography.Paragraph
              style={{ margin: 0, fontSize: ASSESSMENT_SIZES.warningBodyFontSize }}
            >
              {check.finding}
            </Typography.Paragraph>
          </>
        )}
      </Flex>
    </Flex>
  </Card>
);

export default CompensationEventAssessmentClauseWarning;
