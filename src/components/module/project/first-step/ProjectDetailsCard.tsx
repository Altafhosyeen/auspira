/**
 * Project Details Card
 * Read-only view displaying saved project information with edit action
 */

import React from 'react';
import { Button } from 'antd';
import { SectionCard } from '@/components/shared/SectionCard';
import { ProjectData } from '@/types/project/create.types';
import { getProjectClassificationLabel } from '@/utils/project-display';
import { Pen } from 'lucide-react';

interface ProjectDetailsCardProps {
  data: ProjectData;
  onEdit?: () => void;
}

interface DetailFieldProps {
  label: string;
  value: string;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, value }) => (
  <div className="h-fit min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1">
    <p className="ds-caption! my-0 font-semibold! tracking-wider text-slate-700 uppercase">
      {label}
    </p>
    <p className="ds-body! text-text mb-0! truncate font-semibold!">{value}</p>
  </div>
);

export const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({ data, onEdit }) => {
  const projectTypeLabel = getProjectClassificationLabel(data.necForm);

  return (
    <SectionCard className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Details + Edit action on a single row (wraps on narrow screens) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <DetailField label="Project Name" value={data.name} />
        <DetailField label="Reference Number" value={data.referenceId} />
        <DetailField label="Contract Type" value={projectTypeLabel} />

        <Button
          size="large"
          aria-label="Edit Project"
          icon={<Pen className="h-3.5 w-3.5" />}
          onClick={onEdit}
          className="border-main-p! ds-body! text-main-p! hover:bg-main-p/5! shrink-0 rounded-xl! font-semibold!"
        >
          Edit
        </Button>
      </div>
    </SectionCard>
  );
};

ProjectDetailsCard.displayName = 'ProjectDetailsCard';
