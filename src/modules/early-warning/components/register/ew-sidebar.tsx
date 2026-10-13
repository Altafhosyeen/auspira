import DocumentsCommunication from '@/components/shared/documents-communication';

export interface EwSidebarProps {
  /** Alert deadline for the Time Bar countdown (alert flow only). */
  deadline?: string | null;
  /** Documents & Communication card exists only when the EW originates from an alert. */
  showCommunicationCard: boolean;
  projectId?: string | null;
  conversationId?: string | null;
  subjectFallback?: string | null;
}

// Right sidebar per the register design — communication items (alert flow).
// Submit buttons live in EwFormActions below this column.
const EwSidebar = ({
  deadline,
  showCommunicationCard,
  projectId,
  conversationId,
  subjectFallback,
}: EwSidebarProps) => (
  <DocumentsCommunication
    deadline={deadline}
    show={showCommunicationCard}
    projectId={projectId}
    conversationId={conversationId}
    subjectFallback={subjectFallback}
  />
);

export default EwSidebar;
