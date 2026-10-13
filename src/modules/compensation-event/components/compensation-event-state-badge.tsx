import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  FormOutlined,
  SendOutlined,
  SolutionOutlined,
  StopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import {
  COMPENSATION_EVENT_STATE_TONES,
  COMPENSATION_EVENT_STATUS_LABELS,
} from '../constants/compensation-event.constants';
import type {
  CompensationEventRegisterState,
  CompensationEventTone,
} from '../types/compensation-event.types';
import CompensationEventToneBadge from './compensation-event-tone-badge';

const STATE_ICONS: Record<CompensationEventRegisterState, ReactNode> = {
  DRAFT: <FormOutlined />,
  QUOTATION_TO_BE_SUBMITTED: <SendOutlined />,
  QUOTATION_SUBMITTED: <ClockCircleOutlined />,
  IMPLEMENTED: <CheckCircleOutlined />,
  REVISED_QUOTATION_TO_BE_SUBMITTED: <SendOutlined />,
  PROJECT_MANAGER_ASSESSMENT: <SolutionOutlined />,
  EXTENSION_OF_TIME_REQUESTED: <FieldTimeOutlined />,
  NOT_ACCEPTED: <CloseCircleOutlined />,
  DISCARDED: <StopOutlined />,
};

interface CompensationEventStateBadgeProps {
  state: CompensationEventRegisterState;
  overdue?: boolean;
  pill?: boolean;
  // Raw backend statusName — shown verbatim when supplied, instead of the
  // mapped register label, so the badge reflects exactly what the API sent.
  label?: string;
}

// Presentational — an overdue reply escalates the AWAITING pill from amber to red.
const CompensationEventStateBadge = ({
  state,
  overdue,
  pill,
  label,
}: CompensationEventStateBadgeProps) => {
  const tone: CompensationEventTone = overdue ? 'danger' : COMPENSATION_EVENT_STATE_TONES[state];
  const icon = overdue ? <WarningOutlined /> : STATE_ICONS[state];

  return (
    <CompensationEventToneBadge tone={tone} icon={icon} pill={pill}>
      {(label ?? COMPENSATION_EVENT_STATUS_LABELS[state]).toUpperCase()}
    </CompensationEventToneBadge>
  );
};

export default CompensationEventStateBadge;
