import type { ReactNode } from 'react';
import { DetailSectionCard } from '@/components/shared/detail-section-card';
import { REGISTER_COLORS } from '../constants/defect-notice-register.theme';

interface DefectNoticeSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  titleSuffix?: ReactNode;
  gap?: number;
}

// Section shell — soft-blue icon chip beside the title. Renders through the shared
// `DetailSectionCard`, the same shell the Compensation Event/RFI detail panels use.
const DefectNoticeSectionCard = ({
  icon,
  title,
  children,
  titleSuffix,
  gap = 24,
}: DefectNoticeSectionCardProps) => (
  <DetailSectionCard
    icon={icon}
    title={title}
    titleSuffix={titleSuffix}
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

export default DefectNoticeSectionCard;
