import type { ReactNode } from 'react';
import { DetailSectionCard } from '@/components/shared/detail-section-card';
import { REGISTER_COLORS } from '../constants/request-for-information-register.theme';

interface RequestForInformationSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  /** Muted text inline after the title, e.g. "Event Summary (RFI-024)". */
  titleSuffix?: ReactNode;
  gap?: number;
}

// Section shell — soft-blue icon chip beside the title, shared by the detail screen's
// Event Summary and Description cards. Renders through the shared `DetailSectionCard`,
// the same shell the Compensation Event detail's Overview panels use.
const RequestForInformationSectionCard = ({
  icon,
  title,
  children,
  titleSuffix,
  gap = 24,
}: RequestForInformationSectionCardProps) => (
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

export default RequestForInformationSectionCard;
