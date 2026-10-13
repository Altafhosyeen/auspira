'use client';

import { Button, Flex, notification, Result } from 'antd';
import { useRouter } from 'nextjs-toploader/app';
import { useMemo, useState } from 'react';
import { DETAIL_TABS_ACTIVE_GRADIENT, DetailTabs } from '@/components/shared/detail-tabs';
import { MENU_PATH, PROGRAMME_SOURCE_AWARENESS } from '@/constants';
import { APP_COLORS } from '@/constants/app.theme';
import {
  PROGRAMME_ACCEPT_REJECT_CLAUSES,
  PROGRAMME_ACCEPT_REJECT_COPY,
  PROGRAMME_CLIENT_OBLIGATIONS_COPY,
  PROGRAMME_DETAIL_COPY,
  PROGRAMME_DETAIL_TABS,
  PROGRAMME_EXTRACT_COPY,
  PROGRAMME_NON_ACCEPTANCE_GROUNDS,
  PROGRAMME_PM_VIEW_COPY,
  PROGRAMME_VARIANCE_COPY,
  type ProgrammeDetailTabKey,
} from '../constants/programme.constants';
import {
  useAcceptProgramme,
  useGetProgrammeAlert,
  useGetProgrammeById,
  useGetProgrammeList,
  useGetProgrammeRecordAlert,
  useGetProgrammeSummary,
  useProgrammeEmail,
} from '../hooks/use-programme';
import {
  toClientObligationGroups,
  toExtractedFields,
  toHealthCheck,
  toPmViewContractDates,
  toProgrammeExtract,
  toProgrammeRevisionLabel,
  toSectionalCompletions,
  toVarianceView,
} from '../utils/programme-alert.utils';
import { matchBySourceIds, recordedProgrammeDecision } from '../utils/programme-api.utils';
import ProgrammeAcceptRejectTab from './programme-accept-reject-tab';
import ProgrammeClientObligationsTab from './programme-client-obligations-tab';
import ProgrammeDetailHeader from './programme-detail-header';
import ProgrammeDetailSkeleton from './programme-detail-skeleton';
import ProgrammeExtractAndCheckTab from './programme-extract-and-check-tab';
import ProgrammePmViewTab from './programme-pm-view-tab';
import ProgrammeReceivedTab from './programme-received-tab';
import ProgrammeThemeProvider from './programme-theme-provider';
import ProgrammeVarianceTab from './programme-variance-tab';

// The register publishes no single-record status route — `GET /api/programme/{id}` has no
// status field, and the summary pages server-side with its own default page size. So the
// decision is read off a deliberately wide first page of the register.
const STATUS_LOOKUP_PAGE_SIZE = 100;

// Container — owns the alert and stored programme-record fetches. Every tab below is
// presentational; the mapping from the payload onto their props lives in
// `utils/programme-alert.utils.ts`.
//
// `source` names which API the route id belongs to. Coming from Awareness the id is a project
// alert and the signal has not been accepted, so there is no programme health record to read —
// the review is fed by GET /api/project-alerts/{id}, which carries the programme extract, the
// health check, the variance and the obligations. Coming from the register the id is a
// programme health id, and only then is GET /api/programme/{id} called. Without the flag the
// route is treated as the register, so an older link still lands on the stored record.
const ProgrammeDetailPage = ({ id, source }: { id: string; source?: string }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProgrammeDetailTabKey>('ProgrammeReceived');
  // The Cl. 31.3 grounds the PM has ticked, and the justification written against each —
  // held here so a part-made decision survives a tab switch.
  const [nonAcceptanceKeys, setNonAcceptanceKeys] = useState<string[]>([]);
  const [nonAcceptanceJustifications, setNonAcceptanceJustifications] = useState<
    Record<string, string>
  >({});

  const openedFromAlert = source === PROGRAMME_SOURCE_AWARENESS;

  const {
    data: alert,
    isLoading: isLoadingAlert,
    isError: isAlertError,
  } = useGetProgrammeAlert({ id, enabled: openedFromAlert && !!id });

  const {
    data: record,
    isLoading: isLoadingRecord,
    isError: isRecordError,
  } = useGetProgrammeById({ id, enabled: !openedFromAlert && !!id }, { retry: false });

  // The alert behind a stored record, joined on the source conversation/project-email id — the
  // only key the two share. Only the register path pays for it, and only to fill the Programme
  // Received tab, which reads fields the record itself does not carry.
  const recordAlert = useGetProgrammeRecordAlert(record);
  const sourceAlert = alert ?? recordAlert;
  const isLoading = openedFromAlert ? isLoadingAlert : isLoadingRecord;
  const isLoadError = openedFromAlert ? isAlertError : isRecordError;

  // The register row for an alert that has already been accepted — carrying the decision the
  // Accept / Reject tab reports and the revision label. Fetched in the same direction only.
  const { data: programmeRecords } = useGetProgrammeList({
    projectId: alert?.projectId,
    params: { includeAll: true },
    enabled: openedFromAlert && !!alert?.projectId,
  });

  const alertMatchedRecord = useMemo(
    () => (alert ? matchBySourceIds(programmeRecords?.items, alert) : undefined),
    [alert, programmeRecords?.items]
  );

  const programmeRecord = record ?? alertMatchedRecord;

  // Reads the mail thread of whichever record was resolved — the alert's own conversation id,
  // or the stored record's when the alert join came up empty.
  const { email, attachments } = useProgrammeEmail(sourceAlert, programmeRecord);

  // The record DTO carries no status, so whether this revision was accepted is only readable
  // off its own register row.
  const { data: registerSummary } = useGetProgrammeSummary(
    {
      projectId: programmeRecord?.projectId,
      params: { top: STATUS_LOOKUP_PAGE_SIZE, includeAll: true },
      enabled: !!programmeRecord?.projectId,
    },
    { retry: false }
  );

  const recordedDecision = useMemo(
    () => recordedProgrammeDecision(registerSummary?.items, programmeRecord?.id),
    [registerSummary?.items, programmeRecord?.id]
  );

  // The programme as submitted: the alert hands it over JSON-encoded (on the Awareness path),
  // and a stored record keeps the same bytes in its `json` column (the register path). Both go
  // through the same parse.
  const extract = useMemo(
    () => toProgrammeExtract(alert?.programme) ?? toProgrammeExtract(programmeRecord?.json),
    [alert?.programme, programmeRecord?.json]
  );

  const extractedFields = useMemo(() => toExtractedFields(extract), [extract]);
  const obligations = alert?.obligations ?? extract?.obligations;
  const aiHealthCheck = alert?.aiProgrammeHealthCheck ?? extract?.aiProgrammeHealthCheck;
  const healthCheck = useMemo(
    () => toHealthCheck(aiHealthCheck, extract),
    [aiHealthCheck, extract]
  );
  const contractDates = useMemo(() => toPmViewContractDates(extract), [extract]);
  const sectionalCompletions = useMemo(() => toSectionalCompletions(extract), [extract]);
  const variance = useMemo(() => toVarianceView(extract), [extract]);
  const obligationGroups = useMemo(() => toClientObligationGroups(obligations), [obligations]);
  const revisionLabel = useMemo(
    () => toProgrammeRevisionLabel(programmeRecord, extract),
    [programmeRecord, extract]
  );

  // POST /api/programme/accept takes the alert id alone. Accepting stores the programme as a new
  // version, so it lands on the register it appears in.
  const { mutateAsync: acceptProgramme, isPending: acceptingProgramme } = useAcceptProgramme();

  const handleAccept = async () => {
    if (!sourceAlert) return;

    try {
      await acceptProgramme({ projectAlertId: sourceAlert.id });
      notification.success({ message: PROGRAMME_DETAIL_COPY.accepted });
      router.push(MENU_PATH.OCA_PROGRAM_HEALTH.pathname);
    } catch {
      // handled globally
    }
  };

  const clauseNumbers = useMemo(
    () => (sourceAlert?.clauseNumber ? [sourceAlert.clauseNumber] : []),
    [sourceAlert?.clauseNumber]
  );

  // Each tab prefers the clause list its own payload section carries — the variance assessment
  // and the obligations assessment each cite their own — falling back to the clause the alert
  // was raised under.
  const clausesFor = (clauses?: string[] | null) =>
    clauses && clauses.length > 0 ? clauses : clauseNumbers;

  // Nothing to render and the lookup has settled — the id belongs to neither space.
  if (isLoadError && !programmeRecord && !sourceAlert) {
    return <Result status="404" title={PROGRAMME_DETAIL_COPY.notFound} />;
  }

  const tabContent: Record<ProgrammeDetailTabKey, React.ReactNode> = {
    // Either record is enough: a revision whose signal cannot be joined still names itself off
    // the stored programme, so it is only an empty pair that leaves the tab out.
    ProgrammeReceived: (sourceAlert || programmeRecord) && (
      <Flex vertical gap={20}>
        <ProgrammeDetailHeader
          title={PROGRAMME_DETAIL_COPY.titlePrefix}
          clauseNumbers={clauseNumbers}
        />
        <ProgrammeReceivedTab
          alert={sourceAlert}
          email={email}
          attachments={attachments}
          record={programmeRecord}
          revisionLabel={revisionLabel}
        />
      </Flex>
    ),
    ExtractAndCheck: (
      <Flex vertical gap={20}>
        <ProgrammeDetailHeader title={PROGRAMME_EXTRACT_COPY.title} clauseNumbers={clauseNumbers} />
        <ProgrammeExtractAndCheckTab
          revisionLabel={revisionLabel}
          fields={extractedFields}
          healthCheck={healthCheck}
        />
      </Flex>
    ),
    PmView: (
      <Flex vertical gap={20}>
        <ProgrammeDetailHeader title={PROGRAMME_PM_VIEW_COPY.title} clauseNumbers={clauseNumbers} />
        <ProgrammePmViewTab
          revisionLabel={revisionLabel}
          contractDates={contractDates}
          sectionalCompletions={sectionalCompletions}
        />
      </Flex>
    ),
    Variance: (
      <Flex vertical gap={20}>
        <ProgrammeDetailHeader
          title={PROGRAMME_VARIANCE_COPY.title}
          clauseNumbers={clausesFor(extract?.variance?.clauses)}
        />
        <ProgrammeVarianceTab {...variance} />
      </Flex>
    ),
    ClientObligations: (
      <Flex vertical gap={20}>
        <ProgrammeDetailHeader
          title={PROGRAMME_CLIENT_OBLIGATIONS_COPY.title}
          clauseNumbers={clausesFor(obligations?.clauses)}
        />
        <ProgrammeClientObligationsTab
          title={obligations?.title ?? PROGRAMME_CLIENT_OBLIGATIONS_COPY.title}
          summary={obligations?.summary ?? undefined}
          groups={obligationGroups}
        />
      </Flex>
    ),
    // The grounds and the accept action are real; only the non-acceptance notification is
    // still inert, because the backend publishes no route for it.
    AcceptReject: (
      <Flex vertical gap={20}>
        <ProgrammeDetailHeader
          title={PROGRAMME_ACCEPT_REJECT_COPY.title}
          clauseNumbers={PROGRAMME_ACCEPT_REJECT_CLAUSES}
        />
        <ProgrammeAcceptRejectTab
          reasons={PROGRAMME_NON_ACCEPTANCE_GROUNDS}
          selectedKeys={nonAcceptanceKeys}
          onSelectionChange={setNonAcceptanceKeys}
          justifications={nonAcceptanceJustifications}
          onJustificationChange={(key, value) =>
            setNonAcceptanceJustifications((current) => ({ ...current, [key]: value }))
          }
          onAccept={handleAccept}
          submitting={acceptingProgramme}
          decisionRecordedLabel={recordedDecision}
          // TODO: post the Cl. 31.3 non-acceptance notification once the backend exposes one.
          onNotifyNonAcceptance={() => {}}
        />
      </Flex>
    ),
  };

  // The footer walks the tabs in the order they are shown, so it stays correct if a tab is
  // added or reordered — the disabled ends are read off the same index.
  const activeTabIndex = PROGRAMME_DETAIL_TABS.findIndex((tab) => tab.key === activeTab);
  const stepTab = (offset: number) => {
    const target = PROGRAMME_DETAIL_TABS[activeTabIndex + offset];
    if (target) setActiveTab(target.key);
  };

  return (
    <ProgrammeThemeProvider>
      <Flex vertical gap={20}>
        <DetailTabs
          tabs={PROGRAMME_DETAIL_TABS.map(({ key, label }) => ({ key, label, icon: null }))}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ProgrammeDetailTabKey)}
          tone={{
            tabBarBg: APP_COLORS.mainSoft,
            main: APP_COLORS.main,
            activeIndicator: DETAIL_TABS_ACTIVE_GRADIENT,
          }}
          justify="flex-start"
        />

        {isLoading || (!programmeRecord && !sourceAlert) ? (
          <ProgrammeDetailSkeleton />
        ) : (
          tabContent[activeTab]
        )}

        <Flex justify="flex-end" gap={12}>
          <Button disabled={activeTabIndex === 0} onClick={() => stepTab(-1)}>
            Previous
          </Button>
          <Button
            type="primary"
            disabled={activeTabIndex === PROGRAMME_DETAIL_TABS.length - 1}
            onClick={() => stepTab(1)}
          >
            Next
          </Button>
        </Flex>
      </Flex>
    </ProgrammeThemeProvider>
  );
};

export default ProgrammeDetailPage;
