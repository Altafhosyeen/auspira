'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Col, Flex, notification, Row } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useMemo, useState } from 'react';
import AppPageTitle from '@/components/shared/app-page-title';
import NoticeBanner from '@/components/shared/notice-banner';
import { useDeleteProjectAlert, useGetProjectAlertById } from '@/hooks/modules/project-alerts';
import { useCreateRiskReductionMeeting } from '@/hooks/modules/risk-reduction-meeting';
import { EARLY_WARNING_REGISTER_FORM_COPY } from '../constants/early-warning.constants';
import {
  useGetAgreedActionsByEarlyWarningId,
  useGetEarlyWarningConversations,
  useGetEarlyWarningDetail,
  useGetRrmMeetingsByEarlyWarningId,
} from '../hooks/use-early-warnings';
import { toRrmDetailFromAlert, toRrmDetailFromMeetingDto } from '../utils/early-warning-rrm.utils';
import EarlyWarningRrmSkeleton from './early-warning-rrm-skeleton';
import EwThemeProvider from './ew-theme-provider';
import RrmMeetingDetailsCard from './rrm/rrm-meeting-details-card';
import RrmMitigationSidebar from './rrm/rrm-mitigation-sidebar';
import RrmStatCards from './rrm/rrm-stat-cards';

/** Validate and normalize dates — converts valid dates to ISO string, replaces '-', '—', or invalid dates with null. */
const sanitizeDueDate = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed === '-' ||
    trimmed === '—' ||
    trimmed.toLowerCase() === 'n/a' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined'
  ) {
    return null;
  }
  const parsed = dayjs(trimmed);
  if (!parsed.isValid() || parsed.year() < 1900) {
    return null;
  }
  return parsed.toISOString();
};

// Container — meeting detail from GET /api/risk-reduction-meetings/early-warning/{earlyWarningId}
const EarlyWarningRrmPage = () => {
  const router = useRouter();
  const params = useParams();
  const meetingId = String(params?.meetingId ?? '');
  const idParam = String(params?.id ?? '');

  // If meetingId is present in params, idParam is an earlyWarningId (/early-warning/[id]/meeting/[meetingId]).
  // Otherwise, idParam is a projectAlertId (/risk-reduction-meeting/[id]).
  const isRegisteredEwMeeting = Boolean(meetingId);
  const earlyWarningId = isRegisteredEwMeeting ? idParam : '';
  const alertId = !isRegisteredEwMeeting ? idParam : '';

  const [localCheckedOverrides, setLocalCheckedOverrides] = useState<Record<string, boolean>>({});

  // 1. Registered EW: GET /api/early-warnings/{earlyWarningId}
  const { data: ew } = useGetEarlyWarningDetail({
    id: earlyWarningId,
    enabled: Boolean(earlyWarningId),
  });

  // 2. Registered EW: GET /api/risk-reduction-meetings/early-warning/{earlyWarningId}
  const { data: ewMeetings, isLoading: loadingEwMeetings } = useGetRrmMeetingsByEarlyWarningId({
    earlyWarningId,
    enabled: Boolean(earlyWarningId),
  });

  // 3. Registered EW: GET /api/agreed-actions/{earlyWarningId}
  const { data: agreedActions } = useGetAgreedActionsByEarlyWarningId({
    earlyWarningId,
    enabled: Boolean(earlyWarningId),
  });

  // 4. Incoming Alert: GET /api/project-alerts/{id}
  const { data: alert, isLoading: loadingAlert } = useGetProjectAlertById({
    id: alertId,
    enabled: Boolean(alertId),
  });

  // 5. Mail conversations: GET /api/project-emails/{earlyWarningId}/conversations
  const { data: conversations } = useGetEarlyWarningConversations({
    id: earlyWarningId,
    enabled: Boolean(earlyWarningId),
  });

  const projectId = ew?.projectId ?? alert?.projectId;
  const conversationId =
    alert?.conversationId ??
    (conversations?.[0] as { conversationId?: string | null } | undefined)?.conversationId ??
    null;

  const { mutateAsync: createMeeting, isPending: isCreatingMeeting } =
    useCreateRiskReductionMeeting();
  const { mutateAsync: dismissAlert, isPending: isDismissingAlert } = useDeleteProjectAlert();

  const activeMeeting = useMemo(() => {
    if (!ewMeetings || ewMeetings.length === 0) return undefined;
    if (meetingId) {
      return ewMeetings.find((m) => m.id === meetingId) ?? ewMeetings[0];
    }
    return ewMeetings[0];
  }, [ewMeetings, meetingId]);

  const rawDetail = useMemo(() => {
    if (activeMeeting) {
      return toRrmDetailFromMeetingDto(activeMeeting, agreedActions);
    }
    if (alert) return toRrmDetailFromAlert(alert);
    return undefined;
  }, [activeMeeting, agreedActions, alert]);

  const detail = useMemo(() => {
    if (!rawDetail) return undefined;
    const actions = rawDetail.agreedActions.map((action) => {
      const checked =
        action.id in localCheckedOverrides ? localCheckedOverrides[action.id] : action.checked;
      return {
        ...action,
        checked,
      };
    });
    const completedCount = actions.filter((a) => a.checked).length;
    return {
      ...rawDetail,
      agreedActions: actions,
      completedCount,
    };
  }, [rawDetail, localCheckedOverrides]);

  const isLoading = (loadingEwMeetings || loadingAlert) && !detail;

  if (isLoading || !detail) {
    return <EarlyWarningRrmSkeleton />;
  }

  const toggleAction = (actionId: string) => {
    setLocalCheckedOverrides((prev) => {
      const initialChecked =
        rawDetail?.agreedActions.find((a) => a.id === actionId)?.checked ?? false;
      const currentChecked = prev[actionId] ?? initialChecked;
      return {
        ...prev,
        [actionId]: !currentChecked,
      };
    });
  };

  const handleAccept = async (chosenReference?: string) => {
    if (alert) {
      try {
        await createMeeting({
          projectAlertId: alert.id,
          earlyWarningReference:
            chosenReference ||
            ew?.reference ||
            alert.earlyWarningReference ||
            activeMeeting?.earlyWarningReference ||
            'EW',
          projectEmailId: (alert as any).projectEmailId ?? null,
          clauseNumber: detail.clauseNumber || '15.1',
          clauseTitle: detail.clauseTitle || 'Risk reduction meeting',
          clauseDescription: detail.clauseDescription || '',
          meetingDetailObject: {
            meetingDate:
              sanitizeDueDate(detail.rawMeetingDate || detail.meetingDate) ||
              new Date().toISOString(),
            location: detail.format,
            participants: detail.participantsText,
            summary: detail.summary,
            outcomeSoFar: detail.outcomeSoFar || '',
          },
          agreedActions: detail.agreedActions.map((action) => ({
            description: action.label,
            isCompleted: action.checked,
            responsibleParty: action.assignee,
            dueDate: sanitizeDueDate(action.rawDueDate || action.dueDate),
          })),
        });
        notification.success({ message: 'Early Warning Meeting accepted.' });
        router.push(
          earlyWarningId
            ? `/contract-control-agent/early-warning/${earlyWarningId}`
            : '/contract-control-agent/early-warning'
        );
      } catch {
        // handled globally
      }
      return;
    }
    notification.success({ message: 'Early Warning Meeting accepted.' });
    router.push(
      earlyWarningId
        ? `/contract-control-agent/early-warning/${earlyWarningId}`
        : '/contract-control-agent/early-warning'
    );
  };

  const handleDismiss = async () => {
    if (alert) {
      try {
        await dismissAlert({ id: alert.id });
        notification.info({ message: 'Meeting alert dismissed.' });
        router.push('/contract-control-agent/early-warning');
      } catch {
        // handled globally
      }
      return;
    }
    notification.info({ message: 'Meeting dismissed.' });
    router.push(
      earlyWarningId
        ? `/contract-control-agent/early-warning/${earlyWarningId}`
        : '/contract-control-agent/early-warning'
    );
  };

  const bannerText = detail.clauseDescription || EARLY_WARNING_REGISTER_FORM_COPY.banner;

  return (
    <EwThemeProvider>
      <Flex vertical gap={16}>
        <AppPageTitle
          icon={<FileTextOutlined />}
          title="Early Warning Meeting"
          clause={{
            number: detail.clauseNumber || '15.1',
            reference:
              ew?.reference ||
              activeMeeting?.earlyWarningReference ||
              alert?.earlyWarningReference ||
              undefined,
            title: detail.clauseTitle,
            description: bannerText,
          }}
        />

        <NoticeBanner message={bannerText} />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Flex vertical gap={16}>
              <RrmStatCards detail={detail} />
              <RrmMeetingDetailsCard detail={detail} onToggleAction={toggleAction} />
            </Flex>
          </Col>

          <Col xs={24} lg={8}>
            <RrmMitigationSidebar
              projectId={projectId}
              conversationId={conversationId}
              subject={ew?.title ?? alert?.title}
              currentReference={ew?.reference}
              suggestedReference={alert?.earlyWarningReference}
              deadline={alert?.overdueDateTime}
              isCreatingMeeting={isCreatingMeeting}
              isDismissingAlert={isDismissingAlert}
              onAccept={handleAccept}
              onDismiss={handleDismiss}
            />
          </Col>
        </Row>
      </Flex>
    </EwThemeProvider>
  );
};

export default EarlyWarningRrmPage;
