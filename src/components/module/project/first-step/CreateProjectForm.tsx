/**
 * Create Project Form
 * Orchestrates between ProjectDetailsCard (view) and ProjectFormCard (edit/create)
 */

import React from 'react';
import { CreateProjectFormProps } from '@/types/project/create.types';
import { ProjectDetailsCard } from './ProjectDetailsCard';
import { ProjectFormCard } from './ProjectFormCard';

interface CreateProjectFormExtendedProps extends CreateProjectFormProps {
  isLoading?: boolean;
}

export const CreateProjectForm: React.FC<CreateProjectFormExtendedProps> = ({
  onSave,
  onBack,
  initialData,
  isEditMode,
  onEdit,
  onCancel,
  isLoading = false,
}) => {
  // Show read-only view when project is saved and not in edit mode
  if (!isEditMode && initialData?.name) {
    return <ProjectDetailsCard data={initialData} onEdit={onEdit} />;
  }

  // Show form for create or edit
  // key forces a fresh mount when switching between projects so initialValues always applies
  return (
    <ProjectFormCard
      key={initialData?.id ?? 'new'}
      initialData={initialData}
      isLoading={isLoading}
      onSave={onSave}
      onCancel={initialData?.id ? onCancel : onBack}
    />
  );
};

CreateProjectForm.displayName = 'CreateProjectForm';
