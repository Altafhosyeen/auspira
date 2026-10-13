import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'antd';
import { MainOptionSelector } from './MainOptionSelector';
import { MainOption } from '@/types/project/create.types';
import { OPTION_SPECIFIC_DOCS } from '@/constants/project.constants';

interface MainOptionSelectionSectionProps {
  selectedOption: MainOption | null;
  onSelectOption: (option: MainOption) => void;
  header: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  selectorVariant?: 'compact' | 'card';
  showTooltipDescriptions?: boolean;
  uploadedMap?: Record<string, boolean>;
}

export const MainOptionSelectionSection: React.FC<MainOptionSelectionSectionProps> = ({
  selectedOption,
  onSelectOption,
  header,
  children,
  className,
  headerClassName,
  bodyClassName,
  selectorVariant = 'compact',
  showTooltipDescriptions = false,
  uploadedMap = {},
}) => {
  const [optionChangeWarning, setOptionChangeWarning] = useState<string | null>(null);

  const hasUploadedDocumentForCurrentOption = useMemo(() => {
    if (!selectedOption) {
      return false;
    }

    const optionDocs = OPTION_SPECIFIC_DOCS[selectedOption] ?? [];
    return optionDocs.some((doc) => !!uploadedMap[String(doc.id)]);
  }, [selectedOption, uploadedMap]);

  const handleSelectOption = useCallback(
    (nextOption: MainOption) => {
      if (selectedOption && nextOption !== selectedOption && hasUploadedDocumentForCurrentOption) {
        setOptionChangeWarning(
          `First delete document for Option ${selectedOption} before changing to Option ${nextOption}`
        );
        return;
      }

      setOptionChangeWarning(null);
      onSelectOption(nextOption);
    },
    [hasUploadedDocumentForCurrentOption, onSelectOption, selectedOption]
  );

  const containerClasses = ['mt-5 overflow-hidden rounded-xl border border-gray-200', className]
    .filter(Boolean)
    .join(' ');

  const resolvedHeaderClasses = ['border-b border-gray-100 bg-blue-50 px-4 py-3', headerClassName]
    .filter(Boolean)
    .join(' ');

  const resolvedBodyClasses = ['p-4', bodyClassName].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={resolvedHeaderClasses}>{header}</div>
      <div className={resolvedBodyClasses}>
        <MainOptionSelector
          selectedOption={selectedOption}
          onSelect={handleSelectOption}
          variant={selectorVariant}
          showDescriptionsAsTooltip={showTooltipDescriptions}
        />
        {optionChangeWarning && hasUploadedDocumentForCurrentOption && (
          <Alert className="mt-4!" type="warning" showIcon title={optionChangeWarning} closable />
        )}
        {children}
      </div>
    </div>
  );
};

MainOptionSelectionSection.displayName = 'MainOptionSelectionSection';
