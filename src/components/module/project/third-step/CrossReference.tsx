import { notification } from 'antd';
import { AlertTriangle, CalendarDays, CheckCircle2, Layers, Mail } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ContractKpiRow,
  type KpiItem,
} from '@/components/contract/cross-reference-contract/ContractKpiRow';
import { ExtractingIndicator } from '@/components/shared/ExtractingIndicator';
import { StepFooterNav } from '@/components/shared/StepFooterNav';
import { buildPmiRegisterPathFromCrossReference, MENU_PATH } from '@/constants/routes.constants';
import {
  useGetKeysDescriptions,
  useGetUnresolvedCrossReferenceGroups,
  useSetCrossReferenceContractRoute,
} from '@/hooks/modules/cross-reference';
import { CrossReferenceToolbar } from './cross-reference/CrossReferenceToolbar';
import { DataPointDrawer } from './cross-reference/DataPointDrawer';
import { DataPointTable } from './cross-reference/DataPointTable';
import { FindingCardGrid } from './cross-reference/FindingCardGrid';
import { mapCrossReferenceGroupsToFindings } from './cross-reference/mapApiFindings';
import type { Finding } from './cross-reference/types';
import { useCrossReferenceFilters } from './cross-reference/useCrossReferenceFilters';

export default function CrossReferenceDashboard({
  onComplete,
  onBack,
  isActive = true,
}: {
  onComplete: () => void;
  onBack: () => void;
  isActive?: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params?.id === 'string' ? params.id : undefined;

  const POLL_INTERVAL_MS = 2000;
  const POLL_TIMEOUT_MS = 5000;
  const pollDeadlineRef = useRef<number>(0);
  const [, forcePollTick] = useState(0);

  useEffect(() => {
    if (!isActive || !projectId || projectId === 'new') return;
    pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS;
    const timer = setTimeout(() => forcePollTick((n) => n + 1), POLL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isActive, projectId]);

  const pollTimedOut = pollDeadlineRef.current !== 0 && Date.now() >= pollDeadlineRef.current;

  const { data: groups, isFetching } = useGetUnresolvedCrossReferenceGroups(
    {
      id: projectId ?? '',
      enabled: !!projectId && projectId !== 'new' && isActive,
    },
    {
      refetchInterval: (query) =>
        query.state.data?.length || pollTimedOut ? false : POLL_INTERVAL_MS,
    }
  );

  const findings = useMemo(() => mapCrossReferenceGroupsToFindings(groups), [groups]);

  const [resolvedChoices, setResolvedChoices] = useState<Record<string, string>>({});
  const [contractRoutes, setContractRoutes] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: keysDescriptions } = useGetKeysDescriptions({
    id: projectId ?? '',
    enabled: !!projectId && projectId !== 'new' && isActive,
  });

  const enrichedFindings = useMemo(() => {
    if (!keysDescriptions?.description || !findings.length) return findings;

    return findings.map((finding) => ({
      ...finding,
      description: keysDescriptions.description,
    }));
  }, [findings, keysDescriptions]);

  const { mutateAsync: setContractRoute, isPending: isSavingRoute } =
    useSetCrossReferenceContractRoute();

  const [contractRouteModal, setContractRouteModal] = useState<{
    open: boolean;
    findingId: string;
    title: string;
  }>({ open: false, findingId: '', title: '' });

  const resolvedValues = useMemo(
    () =>
      Object.fromEntries(
        enrichedFindings.map((f) => [f.id, resolvedChoices[f.id] ?? f.resolvedValue])
      ),
    [enrichedFindings, resolvedChoices]
  );

  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  // Mirrors the Contract Registry's cross-reference tab: a resolved error/warning
  // counts as "resolved" here too, so it isn't double-counted under its raw type.
  const statusOf = React.useCallback(
    (f: Finding): Finding['type'] | 'resolved' =>
      (resolvedChoices[f.id] ?? f.resolvedValue) ? 'resolved' : f.type,
    [resolvedChoices]
  );

  const isRouteSelected = React.useCallback(
    (f: Finding) => contractRoutes[f.id] ?? !!f.isContractRoute,
    [contractRoutes]
  );

  const kpiFilters = useMemo<Record<string, (f: Finding) => boolean>>(
    () => ({
      total: () => true,
      errors: (f) => statusOf(f) === 'error',
      resolved: (f) => statusOf(f) === 'resolved',
      date: (f) => f.tab === 'date',
      // Onboarding has no send-email step yet, so this counts contract-route
      // findings still waiting to be resolved rather than a real email status.
      awaiting: (f) => isRouteSelected(f) && statusOf(f) !== 'resolved',
    }),
    [statusOf, isRouteSelected]
  );

  const kpis: KpiItem[] = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total',
        count: enrichedFindings.length,
        valueClassName: 'text-text',
        icon: Layers,
        iconBg: 'bg-slate-100',
        iconFg: 'text-slate-500',
      },
      {
        key: 'errors',
        label: 'Errors',
        count: enrichedFindings.filter(kpiFilters.errors).length,
        valueClassName: 'text-red-600',
        icon: AlertTriangle,
        iconBg: 'bg-red-50',
        iconFg: 'text-red-500',
      },
      {
        key: 'resolved',
        label: 'Resolved',
        count: enrichedFindings.filter(kpiFilters.resolved).length,
        valueClassName: 'text-emerald-700',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50',
        iconFg: 'text-emerald-600',
      },
      {
        key: 'date',
        label: 'Date',
        count: enrichedFindings.filter(kpiFilters.date).length,
        valueClassName: 'text-red-500',
        icon: CalendarDays,
        iconBg: 'bg-violet-50',
        iconFg: 'text-violet-500',
      },
      {
        key: 'awaiting',
        label: 'Awaiting email',
        count: enrichedFindings.filter(kpiFilters.awaiting).length,
        valueClassName: 'text-red-500',
        icon: Mail,
        iconBg: 'bg-amber-50',
        iconFg: 'text-amber-500',
      },
    ],
    [enrichedFindings, kpiFilters]
  );

  const visibleFindings = useMemo(
    () => (activeKpi ? enrichedFindings.filter(kpiFilters[activeKpi]) : enrichedFindings),
    [enrichedFindings, activeKpi, kpiFilters]
  );

  // Search / filter / sort / grouping is shared with the Contract Registry's
  // cross-reference tab so both screens offer the same toolbar and ordering.
  const { toolbarProps, view, emptyText, groupedFindings } = useCrossReferenceFilters({
    findings: visibleFindings,
    resolvedValues,
    contractRoutes,
  });

  const selectedFinding = useMemo(
    () => enrichedFindings.find((finding) => finding.id === selectedId) ?? null,
    [enrichedFindings, selectedId]
  );

  // "Notify PMI" makes no API call of its own: the agreed value is issued as an instruction,
  // so hand the user straight to the PMI register with the data point carried across in the
  // query string, and let raising that PMI be what records it.
  const handleResolveChoice = (id: string, value: string) => {
    setDrawerOpen(false);
    const dataPointName = enrichedFindings.find((f) => f.id === id)?.title ?? '';
    router.push(buildPmiRegisterPathFromCrossReference(id, value, dataPointName));
  };

  const handleMarkNotApplicable = (id: string) =>
    setResolvedChoices((prev) => ({ ...prev, [id]: 'N/A' }));

  const handleToggleContractRoute = (id: string, checked: boolean) => {
    if (checked) {
      const finding = enrichedFindings.find((f) => f.id === id);
      setContractRouteModal({
        open: true,
        findingId: id,
        title: finding?.title ?? '',
      });
    } else {
      setContractRoutes((prev) => ({ ...prev, [id]: false }));
    }
  };

  const closeContractRouteModal = () => setContractRouteModal((prev) => ({ ...prev, open: false }));

  const handleConfirmContractRoute = async () => {
    const { findingId } = contractRouteModal;
    try {
      await setContractRoute({ projectCrossReferenceId: findingId });
      setContractRoutes((prev) => ({ ...prev, [findingId]: true }));
      notification.success({ message: 'Marked as contract route. Project manager notified.' });
      closeContractRouteModal();
      setDrawerOpen(false);
      // The route is confirmed, so the follow-up lives in the PMI register — take
      // the user straight there, carrying the data point the same way the resolve
      // path does so the register names itself and can link the two records.
      router.push(
        buildPmiRegisterPathFromCrossReference(
          findingId,
          resolvedValues[findingId] ?? '',
          contractRouteModal.title,
          true
        )
      );
    } catch {
      notification.error({ message: 'Could not update contract route. Please try again.' });
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedId(null);
  };

  // "View PMI" jumps straight to the instruction already raised from this finding.
  const handleViewPmi = (projectManagerInstructionId: string) =>
    router.push(
      `${MENU_PATH.CCA_PROJECT_MANAGEMENT_INSTRUCTION.pathname}/${projectManagerInstructionId}`
    );

  const isPolling = !pollTimedOut && (isFetching || !groups?.length);

  return (
    <div className="bg-surface-subtle text-text flex min-h-screen flex-col font-sans">
      <div className="w-full flex-1 space-y-4 py-6">
        <ContractKpiRow items={kpis} activeKey={activeKpi} onSelect={setActiveKpi} />

        {isPolling ? (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border bg-white p-12 text-center shadow-sm"
            style={{ borderColor: '#dfe3e6' }}
          >
            <ExtractingIndicator active label="Analyzing cross-references" />
            <span className="ds-caption! font-medium!" style={{ color: '#627d98' }}>
              This may take a few moments.
            </span>
          </div>
        ) : enrichedFindings.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-3xl border bg-white px-8 py-16 text-center shadow-sm"
            style={{ borderColor: '#dfe3e6' }}
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#f0f4f8', color: '#829ab1' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="m8.5 8.5 5 5" />
                <path d="m13.5 8.5-5 5" />
              </svg>
            </span>
            <h2 className="ds-heading-3! font-semibold!" style={{ color: '#122741' }}>
              No cross-reference issues found
            </h2>
            <p className="ds-body!" style={{ color: '#627d98' }}>
              Your project references are clean. No unresolved cross-reference issues were detected.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <section className="space-y-4">
              <CrossReferenceToolbar {...toolbarProps} />

              <div
                className="rounded-3xl border bg-white p-5 shadow-sm"
                style={{ borderColor: '#dfe3e6' }}
              >
                {view === 'grid' ? (
                  <FindingCardGrid
                    groups={groupedFindings}
                    selectedId={drawerOpen ? selectedId : null}
                    resolvedValues={resolvedValues}
                    emptyText={emptyText}
                    contractRoutes={contractRoutes}
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
                      <div key={groupLabel} className="space-y-3">
                        <DataPointTable
                          findings={groupItems}
                          selectedId={drawerOpen ? selectedId : null}
                          resolvedValues={resolvedValues}
                          emptyText={emptyText}
                          contractRoutes={contractRoutes}
                          onViewPmi={handleViewPmi}
                          onRowClick={handleRowClick}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <StepFooterNav onBack={onBack} onNext={onComplete} nextLabel="Next" />

      {/* Detail Drawer Modal */}
      <DataPointDrawer
        finding={selectedFinding}
        open={drawerOpen}
        resolvedValue={selectedFinding ? resolvedValues[selectedFinding.id] : undefined}
        contractRoute={
          selectedFinding
            ? (contractRoutes[selectedFinding.id] ?? !!selectedFinding.isContractRoute)
            : false
        }
        onClose={closeDrawer}
        onResolve={handleResolveChoice}
        onMarkNotApplicable={handleMarkNotApplicable}
        onToggleContractRoute={handleToggleContractRoute}
        contractRouteConfirm={{
          open: contractRouteModal.open,
          title: contractRouteModal.title,
          loading: isSavingRoute,
          confirmLabel: 'Notify PMI',
          description:
            'This data point will be flagged as the agreed reference across all contract documents, and the project manager will be notified. You will be taken to the PMI register to raise the instruction.',
          onCancel: closeContractRouteModal,
          onConfirm: handleConfirmContractRoute,
        }}
      />
    </div>
  );
}
