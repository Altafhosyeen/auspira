import type { ReactNode } from 'react';
import { DetailSectionCard } from '@/components/shared/detail-section-card';
import { NOTICE_COLORS, NOTICE_SIZES } from '../constants/compensation-event-notice.theme';

interface CompensationEventNoticeSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  /** Muted line under the title — Risk Allowance is the only section that has one. */
  subtitle?: string;
  /** Muted text inline after the title, e.g. "Event Summary (EWN-2023-ALPHA-042)". */
  titleSuffix?: ReactNode;
  /** Trailing header content (a status tag, an amount field) pinned to the right. */
  extra?: ReactNode;
  /** Rules between the header and the body — Programme Impact draws one. */
  headerDivider?: boolean;
  gap?: number;
}

// Section shell — soft-blue icon chip beside the title. The heading sits inside the
// body because the design draws no divider under it. Renders through the shared
// `DetailSectionCard`, the same shell the Request For Information detail's Overview
// panels use, so both detail screens' record-identity panels render identically.
const CompensationEventNoticeSectionCard = ({
  icon,
  title,
  children,
  subtitle,
  titleSuffix,
  extra,
  headerDivider = false,
  gap = 24,
}: CompensationEventNoticeSectionCardProps) => (
  <DetailSectionCard
    icon={icon}
    title={title}
    subtitle={subtitle}
    titleSuffix={titleSuffix}
    extra={extra}
    headerDivider={headerDivider}
    headerDividerBleed={NOTICE_SIZES.cardPaddingInline}
    gap={gap}
    padding={`${NOTICE_SIZES.cardPaddingBlock}px ${NOTICE_SIZES.cardPaddingInline}px`}
    tone={{
      main: NOTICE_COLORS.main,
      mainSoft: NOTICE_COLORS.mainSoft,
      mainBorder: NOTICE_COLORS.mainBorder,
    }}
  >
    {children}
  </DetailSectionCard>
);

export default CompensationEventNoticeSectionCard;
