'use client';

import { ClockCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { AuditTrailList } from '@/components/shared/audit-trail';
import {
  AUDIT_ACTION_BY_ORDINAL,
  AUDIT_ACTION_LABELS,
} from '@/components/shared/audit-trail/audit-actions';
import { DetailListToolbar } from '@/components/shared/detail-list-toolbar';
import { PROJECT_DAILY_REPORT_DETAIL_COPY } from '../constants/project-daily-report.constants';
import { useGetProjectDailyReportAuditTrail } from '../hooks/use-project-daily-reports';
import ProjectDailyReportSectionCard from './project-daily-report-section-card';

// The trail's action vocabulary, as the endpoint's own `actionType` ordinals. Taken from the
// full enum, not from the rows on screen — once the endpoint narrows to one action the loaded
// rows no longer name the others.
const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_BY_ORDINAL).map(([ordinal, action]) => ({
  value: ordinal,
  label: AUDIT_ACTION_LABELS[action],
}));

interface ProjectDailyReportAuditTrailTabProps {
  reportId: string;
}

// Container — the Audit Trail tab: the shared `AuditTrailList` over the shared audit-log
// endpoint, exactly what the Early Warning, PMI and Defect Notice detail screens render
// through. Both the search and the action filter are the endpoint's own, so neither narrows
// in the browser.
const ProjectDailyReportAuditTrailTab = ({ reportId }: ProjectDailyReportAuditTrailTabProps) => {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  // The endpoint takes one actionType, so the dropdown holds at most one choice.
  const [action, setAction] = useState<string[]>([]);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedTerm(term.trim()), 400);
    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const { data: entries } = useGetProjectDailyReportAuditTrail({
    id: reportId,
    term: debouncedTerm,
    actionType: action.length ? Number(action[0]) : undefined,
    enabled: !!reportId,
  });

  return (
    <ProjectDailyReportSectionCard
      icon={<ClockCircleOutlined />}
      title={PROJECT_DAILY_REPORT_DETAIL_COPY.auditTrailTitle}
      headerDivider
      // Matches the Compensation Event audit tab's rhythm: a snug rule under the header,
      // then clear room before the first timeline row.
      gap={16}
      extra={
        <DetailListToolbar
          term={term}
          onTermChange={setTerm}
          searchPlaceholder="Search by user or details..."
          filterOptions={AUDIT_ACTION_OPTIONS}
          selected={action}
          // Only the newly ticked action survives — the endpoint narrows to one.
          onSelectedChange={(values) => setAction(values.slice(-1))}
          onClearAll={() => {
            setTerm('');
            setAction([]);
          }}
        />
      }
    >
      <AuditTrailList
        entries={entries ?? []}
        emptyDescription={
          debouncedTerm || action.length
            ? 'No activity matches this search.'
            : 'No audit activity yet'
        }
      />
    </ProjectDailyReportSectionCard>
  );
};

export default ProjectDailyReportAuditTrailTab;
