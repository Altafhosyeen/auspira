'use client';

import { Button, Card, Divider, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { DETAIL_COLORS, PANEL_SIZES } from '../constants/compensation-event-detail.theme';
import { EVIDENCE_COLORS } from '../constants/compensation-event-evidence.theme';

interface CompensationEventDetailPanelProps {
  icon: ReactNode;
  iconFontSize?: number;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Trailing content rendered before the action button — e.g. a search icon. */
  headerExtra?: ReactNode;
  padding: string;
  bodyGap: number;
  bodyInline?: number;
  children: ReactNode;
}

// Presentational — the detail-screen panel shell: tinted icon chip, title, an
// optional trailing action, a rule, then the body inset the way the design sets it.
const CompensationEventDetailPanel = ({
  icon,
  iconFontSize = PANEL_SIZES.headerIconFontSize,
  title,
  actionLabel,
  onAction,
  headerExtra,
  padding,
  bodyGap,
  children,
}: CompensationEventDetailPanelProps) => (
  <Card
    styles={{ body: { padding } }}
    style={{ borderRadius: PANEL_SIZES.cardRadius, height: '100%' }}
  >
    <Flex vertical gap={bodyGap}>
      <Flex vertical gap={PANEL_SIZES.headerBlockGap}>
        <Flex align="center" justify="space-between" gap={12} wrap>
          <Flex align="center" gap={PANEL_SIZES.headerGap}>
            <Flex
              align="center"
              justify="center"
              style={{
                background: DETAIL_COLORS.mainSoft,
                border: `1px solid ${DETAIL_COLORS.mainBorder}`,
                borderRadius: PANEL_SIZES.headerChipRadius,
                color: DETAIL_COLORS.main,
                flex: 'none',
                fontSize: iconFontSize,
                height: PANEL_SIZES.headerChip,
                width: PANEL_SIZES.headerChip,
              }}
            >
              {icon}
            </Flex>
            <Typography.Text style={{ fontSize: PANEL_SIZES.titleFontSize, fontWeight: 600 }}>
              {title}
            </Typography.Text>
          </Flex>

          {(headerExtra || actionLabel) && (
            <Flex align="center" gap={8}>
              {headerExtra}
              {actionLabel && (
                <Button
                  type="default"
                  onClick={onAction}
                  style={{
                    borderRadius: PANEL_SIZES.actionRadius,
                    fontSize: PANEL_SIZES.actionFontSize,
                    fontWeight: 600,
                    height: PANEL_SIZES.actionHeight,
                    padding: `0 ${PANEL_SIZES.actionPaddingInline}px`,
                  }}
                >
                  {actionLabel}
                </Button>
              )}
            </Flex>
          )}
        </Flex>

        <Divider style={{ borderColor: EVIDENCE_COLORS.divider, margin: 0 }} />
      </Flex>

      <div>{children}</div>
    </Flex>
  </Card>
);

export default CompensationEventDetailPanel;
