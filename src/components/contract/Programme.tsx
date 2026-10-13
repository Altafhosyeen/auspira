'use client';

import React, { useState } from 'react';
import { Empty } from 'antd';
import { VariantToggle } from './programme/VariantToggle';
import { RevisedProgrammeView } from './programme/RevisedProgrammeView';
import type { ProgrammeVariant, ProgrammeComparison } from './programme/types';
import type {
  ApiProgrammeJsonData,
  ProgrammeData,
} from '@/components/module/project/second-step/programme-ingestion/types';
import { mapProgrammeJson } from '@/components/module/project/second-step/programme-ingestion/mapProgrammeJson';
import { ProgrammePostUploadPanels } from '@/components/module/project/second-step/programme-ingestion/ProgrammePostUploadPanels';
import { useGetPrimaveraComparison } from '@/hooks/modules/project';
import { useProjectStore } from '@/store/project.store';

export interface ProgrammeProps {
  /** Controlled variant — when provided alongside onVariantChange, the parent owns the toggle state (e.g. to drive a page heading). */
  variant?: ProgrammeVariant;
  onVariantChange?: (variant: ProgrammeVariant) => void;
}

/** Primavera-comparison response: accepted programme carries the raw extractor `jsonData`. */
interface PrimaveraProgrammeResponse {
  projectId: string;
  acceptedProgramme: {
    documentId: string;
    fileName: string;
    version: number;
    uploadedAt: string;
    jsonData: ApiProgrammeJsonData;
  } | null;
  revisedProgramme: {
    documentId: string;
    fileName: string;
    version: number;
    uploadedAt: string;
    jsonData: ProgrammeComparison;
  } | null;
}

const Programme: React.FC<ProgrammeProps> = ({ variant: controlledVariant, onVariantChange }) => {
  const [internalVariant, setInternalVariant] = useState<ProgrammeVariant>('accepted');
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);

  const { data: primaveraComparison, isLoading } =
    useGetPrimaveraComparison<PrimaveraProgrammeResponse>({
      projectId: selectedProjectId ?? '',
      enabled: !!selectedProjectId,
    });
  const variant = controlledVariant ?? internalVariant;
  const handleChange = onVariantChange ?? setInternalVariant;

  const acceptedProgramme = primaveraComparison?.acceptedProgramme ?? null;
  const acceptedJson = acceptedProgramme?.jsonData;
  const revisedJson = primaveraComparison?.revisedProgramme?.jsonData;

  // Map the raw extractor `jsonData` into the panel shape (mapProgrammeJson guards missing sections).
  // Same data + UI as the onboarding Programme Ingestion step.
  const acceptedData: ProgrammeData | null = acceptedJson
    ? { name: acceptedProgramme?.fileName || 'Programme', ...mapProgrammeJson(acceptedJson) }
    : null;

  const revisedData: ProgrammeComparison | null = revisedJson
    ? {
        fromRevision: revisedJson.fromRevision,
        toRevision: revisedJson.toRevision,
        deltaMetrics: revisedJson.deltaMetrics ?? [],
        stats: revisedJson.stats ?? [],
        movedActivities: revisedJson.movedActivities ?? [],
        movedActivitiesTotal: revisedJson.movedActivitiesTotal,
        baselineActivitiesTotal: revisedJson.baselineActivitiesTotal,
        addedActivities: revisedJson.addedActivities ?? [],
        addedActivitiesTotal: revisedJson.addedActivitiesTotal,
        addedActivitiesSummary: revisedJson.addedActivitiesSummary,
        criticalPathChange: revisedJson.criticalPathChange,
        healthAlerts: revisedJson.healthAlerts ?? [],
      }
    : null;

  const activeData = variant === 'accepted' ? acceptedData : revisedData;

  return (
    <div className="space-y-6">
      <VariantToggle variant={variant} onChange={handleChange} />

      {!activeData ? (
        <Empty
          className="py-12"
          description={
            isLoading
              ? 'Loading programme…'
              : `No ${variant} programme available for this project yet.`
          }
        />
      ) : variant === 'accepted' ? (
        <ProgrammePostUploadPanels data={acceptedData!} />
      ) : (
        <RevisedProgrammeView data={revisedData!} />
      )}
    </div>
  );
};

export default Programme;
