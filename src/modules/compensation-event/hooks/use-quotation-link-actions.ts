'use client';

import { notification } from 'antd';
import { useRouter } from 'next/navigation';
import { MENU_PATH } from '@/constants/routes.constants';
import {
  useAcceptPmiQuotation,
  useConfirmPmiQuotation,
  useRequestPmiQuotationRevision,
} from '@/modules/pmi';
import { CONTRACTOR_QUOTATION_COPY } from '../constants/compensation-event-quotation.constants';
import {
  useAcceptQuotation,
  useConfirmQuotation,
  useRequestQuotationRevision,
} from './use-quotation';

/** The clause the alert carried, forwarded to the CE endpoints that record it. */
interface QuotationClauseSource {
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
}

interface UseQuotationLinkActionsArgs {
  /** The alert the quotation arrived on — every endpoint here is keyed on it. */
  alertId?: string;
  /** The record picked in the link card, which confirm links the quotation to. */
  linkedEventId?: string;
  /** Set once a link is confirmed; accept and revision both act on this quotation. */
  confirmedQuotationId?: string;
  /** A PMI quotation takes the pmi-quotations endpoints rather than the CE ones. */
  isPmi: boolean;
  alertClauseSource?: QuotationClauseSource;
  onConfirmed: (eventId: string, quotationId: string) => void;
  onRevisionSent: () => void;
}

export interface QuotationRevisionValues {
  comment: string;
  attachments: File[];
}

// Confirm, accept and request-revision share one shape: check the link is settled, pick the
// CE or PMI endpoint, then report and route. Keeping them together means the CE and PMI
// paths cannot drift apart, and leaves the page to rendering.
export const useQuotationLinkActions = ({
  alertId,
  linkedEventId,
  confirmedQuotationId,
  isPmi,
  alertClauseSource,
  onConfirmed,
  onRevisionSent,
}: UseQuotationLinkActionsArgs) => {
  const router = useRouter();

  const acceptQuotation = useAcceptQuotation();
  const confirmQuotation = useConfirmQuotation();
  const requestRevision = useRequestQuotationRevision();

  const acceptPmiQuotation = useAcceptPmiQuotation();
  const confirmPmiQuotation = useConfirmPmiQuotation();
  const requestPmiRevision = useRequestPmiQuotationRevision();

  // A settled PMI sits in its own register, so every PMI path returns there instead.
  const pmiRegisterPath = '/contract-control-agent/project-management-instruction';

  const performConfirmReference = async () => {
    if (!alertId || !linkedEventId) {
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.confirmUnavailable });
      return;
    }

    try {
      if (isPmi) {
        const { quotationId } = await confirmPmiQuotation.mutateAsync({
          projectAlertId: alertId,
          pmiId: linkedEventId,
        });
        onConfirmed(linkedEventId, quotationId);
        notification.success({ message: 'Project manager instruction linked to this quotation.' });
      } else {
        const { quotationId } = await confirmQuotation.mutateAsync({
          projectAlertId: alertId,
          compensationEventId: linkedEventId,
        });
        onConfirmed(linkedEventId, quotationId);
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.confirmed });
      }
    } catch {
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.confirmFailed });
    }
  };

  // The modal collects no subject of its own — the endpoint still requires one, so every
  // request goes out under the same fixed line.
  const performSendRevisionRequest = async (values: QuotationRevisionValues) => {
    if (!alertId) {
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.revisionUnavailable });
      return;
    }

    if (!confirmedQuotationId) {
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.actions.linkRequired });
      return;
    }

    try {
      if (isPmi) {
        await requestPmiRevision.mutateAsync({
          quotationId: confirmedQuotationId,
          subject: CONTRACTOR_QUOTATION_COPY.revisionEmail.subject,
          description: values.comment,
          attachments: values.attachments,
        });
        onRevisionSent();
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.revisionRequested });
        router.replace(pmiRegisterPath);
      } else {
        await requestRevision.mutateAsync({
          projectAlertId: alertId,
          quotationId: confirmedQuotationId,
          subject: CONTRACTOR_QUOTATION_COPY.revisionEmail.subject,
          description: values.comment,
          attachments: values.attachments,
          clauseNumber: alertClauseSource?.clauseNumber ?? undefined,
          clauseTitle: alertClauseSource?.clauseTitle ?? undefined,
          clauseDescription: alertClauseSource?.clauseDescription ?? undefined,
        });
        onRevisionSent();
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.revisionRequested });
        // The event now sits in the register awaiting the revised quotation, so send the
        // user there rather than back to whichever screen opened this quotation.
        router.replace(MENU_PATH.COMPENSATION_EVENT.pathname);
      }
    } catch {
      // Keep the modal open so the comment is not lost on a failed send.
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.revisionFailed });
    }
  };

  const performAccept = async () => {
    if (!alertId) {
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.acceptUnavailable });
      return;
    }

    if (!confirmedQuotationId) {
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.actions.linkRequired });
      return;
    }

    try {
      if (isPmi) {
        await acceptPmiQuotation.mutateAsync({ quotationId: confirmedQuotationId });
        notification.success({ message: 'Quotation accepted.' });
        router.replace(pmiRegisterPath);
      } else {
        await acceptQuotation.mutateAsync({
          projectAlertId: alertId,
          quotationId: confirmedQuotationId,
          clauseNumber: alertClauseSource?.clauseNumber ?? undefined,
          clauseTitle: alertClauseSource?.clauseTitle ?? undefined,
          clauseDescription: alertClauseSource?.clauseDescription ?? undefined,
        });
        notification.success({ message: CONTRACTOR_QUOTATION_COPY.messages.accepted });
        // The quotation is settled, so the screen behind it is stale — send the user to the
        // register (same destination as a revision request) rather than back into history,
        // which lands wherever the user happened to come from.
        router.replace(MENU_PATH.COMPENSATION_EVENT.pathname);
      }
    } catch {
      // The global error handler surfaces the reason; keep the user on the quotation.
      notification.error({ message: CONTRACTOR_QUOTATION_COPY.messages.acceptFailed });
    }
  };

  return {
    performConfirmReference,
    performSendRevisionRequest,
    performAccept,
    confirmingCe: confirmQuotation.isPending,
    confirmingPmi: confirmPmiQuotation.isPending,
    accepting: isPmi ? acceptPmiQuotation.isPending : acceptQuotation.isPending,
    sendingRevision: isPmi ? requestPmiRevision.isPending : requestRevision.isPending,
  };
};
