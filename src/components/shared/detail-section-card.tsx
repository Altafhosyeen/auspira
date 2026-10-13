import { Avatar, Card, Divider, Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

export interface DetailSectionCardTone {
  main: string;
  mainSoft: string;
  mainBorder: string;
}

interface DetailSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  tone: DetailSectionCardTone;
  /** Muted line under the title. */
  subtitle?: string;
  /** Muted text inline after the title, e.g. "Event Summary (CE-0004)". */
  titleSuffix?: ReactNode;
  /** Trailing header content (a status tag, an amount field) pinned to the right. */
  extra?: ReactNode;
  /** Rules between the header and the body, full-bleed across the card's padding. */
  headerDivider?: boolean;
  /** Inline padding the header rule bleeds out to — keep in step with `padding`. */
  headerDividerBleed?: number;
  gap?: number;
  padding?: string;
}

// Section shell — soft-tinted icon chip beside the title, then the body. Shared by every
// detail screen's record-identity panels (Compensation Event's Event Summary/Description,
// Request For Information's Event Summary) so they read as one product rather than
// per-module near-duplicates that can drift apart.
export const DetailSectionCard = ({
  icon,
  title,
  children,
  tone,
  subtitle,
  titleSuffix,
  extra,
  headerDivider = false,
  headerDividerBleed = 32,
  gap = 24,
  padding = '24px 32px',
}: DetailSectionCardProps) => (
  <Card styles={{ body: { padding } }}>
    <Flex vertical gap={headerDivider ? 0 : gap}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Flex align="center" gap={10}>
          <Avatar
            shape="square"
            size={32}
            icon={icon}
            style={{
              backgroundColor: tone.mainSoft,
              border: `1px solid ${tone.mainBorder}`,
              color: tone.main,
            }}
          />
          <Flex vertical>
            <Flex align="center" gap={8}>
              <Typography.Text strong style={{ color: tone.main, fontSize: 16 }}>
                {title}
              </Typography.Text>
              {titleSuffix &&
                (typeof titleSuffix === 'string' ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {titleSuffix}
                  </Typography.Text>
                ) : (
                  titleSuffix
                ))}
            </Flex>
            {subtitle && (
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {subtitle}
              </Typography.Text>
            )}
          </Flex>
        </Flex>

        {extra}
      </Flex>

      {/* Negative inline margin pulls the rule out to the card's edges, so it reads as a
          band across the whole card rather than a line floating inside the padding. */}
      {headerDivider && (
        <Divider style={{ margin: `${gap}px -${headerDividerBleed}px`, width: 'auto' }} />
      )}

      {children}
    </Flex>
  </Card>
);
