import type { ProjectAlert } from '@/hooks/modules/project-alerts';
import { AUSPIRA } from '@/lib/api/auspira-api';
import { buildUrl } from '@/lib/utils/request';
import type { IMetaPaginatedResponse } from '@/types';
import { AWARENESS_ENDPOINTS } from '../constants/awareness.constants';

export interface NotAcceptedPayload {
  projectAlertId: string;
  /** Free-text comment the PM typed. */
  notAcceptReason?: string;
  /** The Cl.61.3 test the event fails — its own field, not folded into the reason. */
  notAcceptReasonTitle?: string;
  /** True = Not Accepted, false = Discard. */
  isNotAccept?: boolean;
  attachments?: string[];
}

export interface AcceptCompensationEventPayload {
  projectAlertId: string;
  attachments?: string[];
}

export interface DiscardPayload {
  projectAlertId: string;
  notAcceptReason?: string;
  notAcceptReasonTitle?: string;
  attachments?: string[];
}

export interface AwarenessListParams {
  skip?: number;
  top?: number;
  term?: string;
  status?: number;
}

// Only layer that talks to the backend: components → hooks → service → AUSPIRA.
export const awarenessService = {
  getListByProject: (projectId: string, params?: AwarenessListParams) =>
    AUSPIRA<IMetaPaginatedResponse<ProjectAlert>>({
      url: buildUrl(AWARENESS_ENDPOINTS.LIST_BY_PROJECT.replace(':projectId', projectId), {
        skip: params?.skip,
        top: params?.top,
        term: params?.term?.trim(),
      }),
      method: 'GET',
      skipLoader: true, // list fetch — skip the global loader overlay
    }),

  getById: (alertId: string) =>
    AUSPIRA<ProjectAlert>({
      url: AWARENESS_ENDPOINTS.BY_ID.replace(':id', alertId),
      method: 'GET',
      skipLoader: true,
    }),

  accept: ({
    projectAlertId,
    conversationId,
  }: {
    projectAlertId: string;
    conversationId?: string | null;
  }) => {
    const formData = new FormData();
    formData.append('projectAlertId', projectAlertId);
    if (conversationId) formData.append('conversationId', conversationId);

    return AUSPIRA<void>({
      url: AWARENESS_ENDPOINTS.ACCEPT,
      method: 'POST',
      isMultipart: true,
      body: formData,
    });
  },

  // Compensation Events accept through their own endpoint, which creates the CE from the
  // alert. Unlike the Early Warning accept there is no conversation id — the body is
  // ProjectAlertId plus optional attachments.
  acceptCompensationEvent: ({ projectAlertId, attachments }: AcceptCompensationEventPayload) => {
    const formData = new FormData();
    formData.append('ProjectAlertId', projectAlertId);
    for (const attachment of attachments ?? []) formData.append('Attachments', attachment);

    return AUSPIRA<void>({
      url: AWARENESS_ENDPOINTS.ACCEPT_COMPENSATION_EVENT,
      method: 'POST',
      isMultipart: true,
      body: formData,
    });
  },

  // `isNotAccept` true records the alert as Not Accepted (backend raises the EW/CE in
  // NotAccepted status); false discards it.
  notAccepted: ({
    projectAlertId,
    notAcceptReason,
    notAcceptReasonTitle,
    isNotAccept = true,
    attachments,
  }: NotAcceptedPayload) =>
    AUSPIRA<void>({
      url: AWARENESS_ENDPOINTS.NOT_ACCEPTED.replace(':projectAlertId', projectAlertId),
      method: 'POST',
      body: {
        notAcceptReason: notAcceptReason ?? null,
        notAcceptReasonTitle: notAcceptReasonTitle ?? null,
        isNotAccept,
        attachments: attachments ?? [],
      },
    }),

  // Soft-delete — a separate endpoint to `notAccepted`. The body is multipart/form-data with
  // PascalCase keys, so it is built as FormData and sent raw: `isMultipart` skips the
  // JSON.stringify the client otherwise applies, and the axios interceptor drops the JSON
  // Content-Type so the boundary is set for us. URLSearchParams would send urlencoded here,
  // which the endpoint rejects with a 400.
  discard: ({
    projectAlertId,
    notAcceptReason,
    notAcceptReasonTitle,
    attachments,
  }: DiscardPayload) => {
    const form = new FormData();
    if (notAcceptReason) form.append('NotAcceptReason', notAcceptReason);
    if (notAcceptReasonTitle) form.append('NotAcceptReasonTitle', notAcceptReasonTitle);
    form.append('IsNotAccept', 'false');
    for (const attachment of attachments ?? []) form.append('Attachments', attachment);

    return AUSPIRA<void>({
      url: AWARENESS_ENDPOINTS.DISCARD.replace(':id', projectAlertId),
      method: 'DELETE',
      isMultipart: true,
      body: form,
    });
  },
};
