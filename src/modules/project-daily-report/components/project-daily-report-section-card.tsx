import type { ReactNode } from 'react';
import { DetailSectionCard } from '@/components/shared/detail-section-card';
import { REGISTER_COLORS } from '../constants/project-daily-report-register.theme';

interface ProjectDailyReportSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  titleSuffix?: ReactNode;
  /** Trailing header content pinned to the right of the title — e.g. the search/filter toolbar. */
  extra?: ReactNode;
  /** Full-bleed rule between the header and the body. */
  headerDivider?: boolean;
  gap?: number;
}

// Section shell — soft-blue icon chip beside the title. Renders through the shared
// `DetailSectionCard`, the same shell the Defect Notice/Compensation Event panels use.
const ProjectDailyReportSectionCard = ({
  icon,
  title,
  children,
  titleSuffix,
  extra,
  headerDivider = false,
  gap = 24,
}: ProjectDailyReportSectionCardProps) => (
  <DetailSectionCard
    icon={icon}
    title={title}
    titleSuffix={titleSuffix}
    extra={extra}
    headerDivider={headerDivider}
    gap={gap}
    tone={{
      main: REGISTER_COLORS.main,
      mainSoft: REGISTER_COLORS.mainSoft,
      mainBorder: REGISTER_COLORS.tagBorder,
    }}
  >
    {children}
  </DetailSectionCard>
);

export default ProjectDailyReportSectionCard;
