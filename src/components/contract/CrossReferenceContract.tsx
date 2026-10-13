'use client';

import { FileSearchOutlined } from '@ant-design/icons';
import { notification, Skeleton } from 'antd';
import { AlertTriangle, CalendarDays, CheckCircle2, Layers, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { ContractRouteConfirmModal } from '@/components/module/project/third-step/cross-reference/ContractRouteConfirmModal';
import { CrossReferenceToolbar } from '@/components/module/project/third-step/cross-reference/CrossReferenceToolbar';
import { DataPointDrawer } from '@/components/module/project/third-step/cross-reference/DataPointDrawer';
import { DataPointTable } from '@/components/module/project/third-step/cross-reference/DataPointTable';
import { FindingCardGrid } from '@/components/module/project/third-step/cross-reference/FindingCardGrid';
import { mapCrossReferenceGroupsToFindings } from '@/components/module/project/third-step/cross-reference/mapApiFindings';
import { useCrossReferenceFilters } from '@/components/module/project/third-step/cross-reference/useCrossReferenceFilters';
import {
  buildPmiRegisterPathFromCrossReference,
  CONTRACT_REGISTRY_CROSS_REFERENCE_PARAM,
  MENU_PATH,
} from '@/constants/routes.constants';
import {
  useGetCrossReferenceGroups,
  useGetKeysDescriptions,
  useSetCrossReferenceContractRoute,
} from '@/hooks/modules/cross-reference';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { ContractKpiRow, type KpiItem } from './cross-reference-contract/ContractKpiRow';
import { CrossreferenceComposeEmailModal } from './cross-reference-contract/CrossreferenceComposeEmailModal';
import { EmailThreadModal } from './cross-reference-contract/EmailThreadModal/EmailThreadModal';
import type { ContractFinding } from './cross-reference-contract/types';

/**
 * How long to keep polling/showing the skeleton while the backend returns an
 * empty array. The backend gives no "extraction finished" signal, so once this
 * window elapses with no findings we treat it as "no data" and stop polling.
 */
const EXTRACTION_TIMEOUT_MS = 5_000;

/** KPI key → predicate used to filter the findings list. */
const KPI_FILTERS: Record<string, (f: ContractFinding) => boolean> = {
  errors: (f) => f.type === 'error',
  quantitative: (f) => f.tab === 'quantitative',
  date: (f) => f.tab === 'date',
  // `awaiting` is route-aware and defined per-render inside the component; this
  // is a placeholder so the key exists in the static map.
  awaiting: () => false,
};

const CrossReferenceContract: React.FC = () => {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const mailboxConnected = useAuthStore((state) => !!state.user?.emailInboxConnected);

  // Once the extraction window elapses with no findings, stop treating an empty
  // response as "still extracting" — otherwise the skeleton/poll runs forever.
  const [extractionExpired, setExtractionExpired] = useState(false);

  useEffect(() => {
    setExtractionExpired(false);
    if (!selectedProjectId) return;
    const timer = setTimeout(() => setExtractionExpired(true), EXTRACTION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [selectedProjectId]);

  const { data: resolvedGroups } = useGetCrossReferenceGroups(
    {
      id: selectedProjectId ?? '',
      enabled: !!selectedProjectId,
    },
    {
      // The backend returns an empty array while it's still extracting groups.
      // Poll every 2s until it returns findings; stop once data arrives or the
      // extraction window elapses (no "finished" signal from the backend).
      refetchInterval: (query) => (query.state.data?.length || extractionExpired ? false : 2000),
    }
  );

  const hasFindings = !!resolvedGroups?.length;

  // The groups query uses `skipLoader`, so the global overlay never shows.
  // Render a skeleton while the backend is still extracting: no findings yet and
  // the extraction window hasn't elapsed. Once it elapses with no data we show a
  // professional empty state instead of an endless skeleton.
  const isExtracting = !!selectedProjectId && !hasFindings && !extractionExpired;

  const { data: keysDescriptions } = useGetKeysDescriptions({
    id: selectedProjectId ?? '',
    enabled: !!selectedProjectId,
  });

  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  // Workflow status overrides keyed by finding id (email flow moves them to "pending").
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ContractFinding['status']>>(
    {}
  );
  const [resolvedChoices, setResolvedChoices] = useState<Record<string, string>>({});
  const [contractRoutes, setContractRoutes] = useState<Record<string, boolean>>({});
  // Row detail drawer. `selectedId` is kept after close so the drawer keeps its
  // content while it animates out; the row highlight keys off `drawerOpen` instead.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const [emailFindingId, setEmailFindingId] = useState<string | null>(null);
  // Finding whose sent-email conversation is open in the thread viewer.
  const [threadFindingId, setThreadFindingId] = useState<string | null>(null);

  // Contract route confirmation dialog.
  const [contractRouteModal, setContractRouteModal] = useState<{
    open: boolean;
    findingId: string;
    title: string;
  }>({ open: false, findingId: '', title: '' });

  const { mutateAsync: setContractRoute, isPending: isSavingRoute } =
    useSetCrossReferenceContractRoute();

  // Derive the workflow list from the API; each finding starts "needs-action" unless overridden.
  // Descriptions come from the separate keys-descriptions endpoint, as on the project step.
  const findings = useMemo<ContractFinding[]>(
    () =>
      mapCrossReferenceGroupsToFindings(resolvedGroups).map((f) => ({
        ...f,
        status: statusOverrides[f.id] ?? '',
        description: keysDescriptions?.description ?? f.description,
      })),
    [resolvedGroups, statusOverrides, keysDescriptions]
  );

  const emailFinding = useMemo(
    () => findings.find((f) => f.id === emailFindingId) ?? null,
    [findings, emailFindingId]
  );

  // Route selection lives in local state (seeded by the API's `isContractRoute`).
  const isRouteSelected = React.useCallback(
    (f: ContractFinding) => contractRoutes[f.id] ?? !!f.isContractRoute,
    [contractRoutes]
  );

  // A finding's badge status: "resolved" once it has a value (local override or API),
  // otherwise its raw severity type — mirrors the status badge shown in DataPointTable,
  // so a resolved error/warning counts as Resolved here too, not double-counted as both.
  const statusOf = React.useCallback(
    (f: ContractFinding): ContractFinding['type'] | 'resolved' =>
      (resolvedChoices[f.id] ?? f.resolvedValue) ? 'resolved' : f.type,
    [resolvedChoices]
  );

  // `awaiting` counts findings whose contract route is selected but not yet emailed/accepted.
  const kpiFilters = useMemo<Record<string, (f: ContractFinding) => boolean>>(
    () => ({
      ...KPI_FILTERS,
      total: () => true,
      errors: (f) => statusOf(f) === 'error',
      warning: (f) => statusOf(f) === 'warning',
      passed: (f) => statusOf(f) === 'passed',
      resolved: (f) => statusOf(f) === 'resolved',
      awaiting: (f) => isRouteSelected(f) && f.status !== 'accepted',
    }),
    [isRouteSelected, statusOf]
  );

  const kpis: KpiItem[] = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total',
        count: findings.length,
        valueClassName: 'text-text',
        icon: Layers,
        iconBg: 'bg-slate-100',
        iconFg: 'text-slate-500',
      },
      {
        key: 'errors',
        label: 'Errors',
        count: findings.filter(kpiFilters.errors).length,
        valueClassName: 'text-red-600',
        icon: AlertTriangle,
        iconBg: 'bg-red-50',
        iconFg: 'text-red-500',
      },
      // {
      //   key: 'warning',
      //   label: 'Warnings',
      //   count: findings.filter(kpiFilters.warning).length,
      //   valueClassName: 'text-amber-600',
      // },
      // {
      //   key: 'passed',
      //   label: 'Passed',
      //   count: findings.filter(kpiFilters.passed).length,
      //   valueClassName: 'text-emerald-600',
      // },
      {
        key: 'resolved',
        label: 'Resolved',
        count: findings.filter(kpiFilters.resolved).length,
        valueClassName: 'text-emerald-700',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50',
        iconFg: 'text-emerald-600',
      },
      // {
      //   key: 'quantitative',
      //   label: 'Quantitative',
      //   count: findings.filter(kpiFilters.quantitative).length,
      //   valueClassName: 'text-blue-600',
      // },
      {
        key: 'date',
        label: 'Date',
        count: findings.filter(kpiFilters.date).length,
        valueClassName: 'text-red-500',
        icon: CalendarDays,
        iconBg: 'bg-violet-50',
        iconFg: 'text-violet-500',
      },
      {
        key: 'awaiting',
        label: 'Awaiting email',
        count: findings.filter(kpiFilters.awaiting).length,
        valueClassName: 'text-red-500',
        icon: Mail,
        iconBg: 'bg-amber-50',
        iconFg: 'text-amber-500',
      },
    ],
    [findings, kpiFilters]
  );

  const visibleFindings = useMemo(
    () => (activeKpi && activeKpi !== 'all' ? findings.filter(kpiFilters[activeKpi]) : findings),
    [findings, activeKpi, kpiFilters]
  );

  // Status cells read from the same local-then-API resolution state the drawer uses.
  const resolvedValues = useMemo(
    () => Object.fromEntries(findings.map((f) => [f.id, resolvedChoices[f.id] ?? f.resolvedValue])),
    [findings, resolvedChoices]
  );

  // Drives the Email action in both views — only the contract route can be emailed.
  const contractRouteValues = useMemo(
    () => Object.fromEntries(findings.map((f) => [f.id, isRouteSelected(f)])),
    [findings, isRouteSelected]
  );

  // Search / filter / sort / grouping shared with the project-onboarding step, applied
  // on top of the KPI card selection so both screens offer identical toolbar controls.
  const { toolbarProps, view, emptyText, groupedFindings } = useCrossReferenceFilters({
    findings: visibleFindings,
    resolvedValues,
    contractRoutes: contractRouteValues,
  });

  const findingTitle = (id: string) => findings.find((f) => f.id === id)?.title ?? '';

  // "Notify PMI" makes no API call of its own: the agreed value is issued as an instruction,
  // so hand the user straight to the PMI register with the data point carried across in the
  // query string, and let raising that PMI be what records it.
  const handleResolve = (id: string, value: string) => {
    setDrawerOpen(false);
    router.push(buildPmiRegisterPathFromCrossReference(id, value, findingTitle(id)));
  };

  const handleMarkNotApplicable = (id: string) =>
    setResolvedChoices((prev) => ({ ...prev, [id]: 'N/A' }));

  // Toggling contract route opens a confirmation dialog instead of directly setting state.
  const handleToggleContractRoute = (id: string, checked: boolean) => {
    if (checked) {
      setContractRouteModal({ open: true, findingId: id, title: findingTitle(id) });
    } else {
      // Unchecking doesn't require confirmation — just toggle off immediately.
      setContractRoutes((prev) => ({ ...prev, [id]: false }));
    }
  };

  const closeContractRouteModal = () => setContractRouteModal((prev) => ({ ...prev, open: false }));

  // Confirm marking as contract route → PATCH endpoint, then reflect locally.
  const handleConfirmContractRoute = async () => {
    const { findingId } = contractRouteModal;
    try {
      await setContractRoute({ projectCrossReferenceId: findingId });
      setContractRoutes((prev) => ({ ...prev, [findingId]: true }));
      notification.success({ message: 'Marked as contract route.' });
      closeContractRouteModal();
    } catch {
      notification.error({ message: 'Could not update contract route. Please try again.' });
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  // Deep link from a PMI's "View Cross Reference": open the finding it was raised over once
  // the findings (polled while extraction runs) include it, then drop the param so a reload
  // or tab switch doesn't reopen it.
  const linkedFindingId = useSearchParams().get(CONTRACT_REGISTRY_CROSS_REFERENCE_PARAM);
  useEffect(() => {
    if (!linkedFindingId || !findings.some((f) => f.id === linkedFindingId)) return;
    setSelectedId(linkedFindingId);
    setDrawerOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.delete(CONTRACT_REGISTRY_CROSS_REFERENCE_PARAM);
    window.history.replaceState(window.history.state, '', url);
  }, [linkedFindingId, findings]);

  const selectedFinding = useMemo(
    () => findings.find((f) => f.id === selectedId) ?? null,
    [findings, selectedId]
  );

  // Clicking Email/Resend opens the compose modal for that finding.
  const handleEmail = (id: string) => setEmailFindingId(id);

  // "View Thread" opens the Outlook-style conversation viewer for that finding.
  const threadFinding = useMemo(
    () => findings.find((f) => f.id === threadFindingId) ?? null,
    [findings, threadFindingId]
  );
  const handleViewThread = (id: string) => setThreadFindingId(id);

  // "View PMI" jumps straight to the instruction already raised from this finding.
  const handleViewPmi = (projectManagerInstructionId: string) =>
    router.push(
      `${MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.pathname}/${projectManagerInstructionId}`
    );

  // Sending the email moves the finding into the "pending" workflow state.
  const handleSendEmail = (id: string) =>
    setStatusOverrides((prev) => (prev[id] === 'accepted' ? prev : { ...prev, [id]: 'pending' }));

  return (
    <div className="bg-surface-subtle space-y-3 font-sans text-slate-900">
      <ContractKpiRow items={kpis} activeKey={activeKpi} onSelect={setActiveKpi} />

      {isExtracting ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : hasFindings ? (
        <div className="space-y-3">
          <CrossReferenceToolbar {...toolbarProps} />

          {view === 'grid' ? (
            <FindingCardGrid
              groups={groupedFindings}
              selectedId={drawerOpen ? selectedId : null}
              resolvedValues={resolvedValues}
              emptyText={emptyText}
              contractRoutes={contractRouteValues}
              onEmail={handleEmail}
              onViewThread={handleViewThread}
              onViewPmi={handleViewPmi}
              onView={handleRowClick}
            />
          ) : groupedFindings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              {emptyText}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedFindings.map(([groupLabel, groupItems]) => (
                <DataPointTable
                  key={groupLabel}
                  findings={groupItems}
                  selectedId={drawerOpen ? selectedId : null}
                  resolvedValues={resolvedValues}
                  emptyText={emptyText}
                  contractRoutes={contractRouteValues}
                  onEmail={handleEmail}
                  onViewThread={handleViewThread}
                  onViewPmi={handleViewPmi}
                  onRowClick={handleRowClick}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
          <span className="bg-surface-subtle mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <FileSearchOutlined className="text-2xl text-slate-400" />
          </span>
          <h3 className="heading-card">No cross-reference issues found</h3>
          <p className="mt-1.5 max-w-md text-sm text-slate-500">
            Auspira compared the contract data points and found no discrepancies to resolve. Any
            quantitative, qualitative, or date errors detected will appear here.
          </p>
        </div>
      )}

      <DataPointDrawer
        finding={selectedFinding}
        open={drawerOpen}
        // Fall back to the API's own resolution state until the user overrides it locally.
        resolvedValue={selectedFinding ? resolvedValues[selectedFinding.id] : undefined}
        contractRoute={
          selectedFinding
            ? (contractRoutes[selectedFinding.id] ?? !!selectedFinding.isContractRoute)
            : false
        }
        // The route is chosen during project onboarding; this screen only reports it.
        contractRouteDisabled
        emailStatus={selectedFinding?.status}
        mailboxConnected={mailboxConnected}
        onEmail={handleEmail}
        onClose={closeDrawer}
        onResolve={handleResolve}
        onMarkNotApplicable={handleMarkNotApplicable}
        onToggleContractRoute={handleToggleContractRoute}
      />

      <CrossreferenceComposeEmailModal
        open={!!emailFinding}
        finding={emailFinding}
        onClose={() => setEmailFindingId(null)}
        onSend={handleSendEmail}
      />

      <EmailThreadModal
        open={!!threadFinding}
        projectId={selectedProjectId}
        conversationId={threadFinding?.conversationId}
        subjectFallback={threadFinding?.title}
        onClose={() => setThreadFindingId(null)}
      />

      <ContractRouteConfirmModal
        open={contractRouteModal.open}
        title={contractRouteModal.title}
        loading={isSavingRoute}
        onCancel={closeContractRouteModal}
        onConfirm={handleConfirmContractRoute}
      />
    </div>
  );
};

export default CrossReferenceContract;
