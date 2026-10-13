import React, { useCallback, useMemo, useState } from 'react';
import { Typography, Collapse, Alert } from 'antd';
import { CaretRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { MainOptionSelector } from './MainOptionSelector';
import { OptionSpecificDocuments } from './OptionSpecificDocuments';
import { MAIN_OPTIONS, OPTION_SPECIFIC_DOCS } from '@/constants/project.constants';
import { MainOption, UploadedDocument } from '@/types/project/create.types';
import { RcFile } from 'antd/es/upload';

const { Text } = Typography;
const { Panel } = Collapse;

interface MainOptionComponentProps {
  selectedOption: MainOption | null;
  onSelectOption: (option: MainOption) => void;
  uploadedMap?: Record<string, boolean>;

  // Layout mode
  mode?: 'collapsible' | 'card';

  // Collapsible mode props
  collapsibleHeader?: React.ReactNode;
  collapsibleDefaultOpen?: boolean;

  // Card mode props
  cardHeader?: React.ReactNode;
  cardHeaderClassName?: string;
  cardBodyClassName?: string;

  // Selector display
  selectorVariant?: 'compact' | 'card';
  showDescriptionsAsTooltip?: boolean;

  // Option-specific documents (collapsible mode only)
  loadingMap?: Record<string, boolean>;
  deletingMap?: Record<string, boolean>;
  progressMap?: Record<string, number>;
  onUpload?: (id: string, file: RcFile) => Promise<void>;
  disabled?: boolean;
  onView?: (id: string | number) => void;
  onReplace?: (id: string | number) => void;
  onRemove?: (id: string | number) => void;
  uploadedDocuments?: UploadedDocument[];
  supportingDocsCountMap?: Record<string, number>;
  onOpenSupportingDocs?: (docTypeId: string) => void;
  columns?: 1 | 2;

  // Generic slot for children (card mode)
  children?: React.ReactNode;

  // Container styling
  className?: string;
}

export const MainOptionComponent: React.FC<MainOptionComponentProps> = ({
  selectedOption,
  onSelectOption,
  uploadedMap = {},
  mode = 'collapsible',
  collapsibleHeader,
  collapsibleDefaultOpen = false,
  cardHeader,
  cardHeaderClassName,
  cardBodyClassName,
  selectorVariant = 'compact',
  showDescriptionsAsTooltip = false,
  loadingMap = {},
  deletingMap = {},
  progressMap = {},
  onUpload,
  disabled = false,
  onView,
  onReplace,
  onRemove,
  uploadedDocuments = [],
  supportingDocsCountMap = {},
  onOpenSupportingDocs,
  columns = 2,
  children,
  className,
}) => {
  const [optionChangeWarning, setOptionChangeWarning] = useState<string | null>(null);

  const hasUploadedDocumentForCurrentOption = useMemo(() => {
    if (!selectedOption) return false;
    const optionDocs = OPTION_SPECIFIC_DOCS[selectedOption] ?? [];
    return optionDocs.some((doc) => !!uploadedMap[String(doc.id)]);
  }, [selectedOption, uploadedMap]);

  // Collapsed-header summary: once the user has picked an option and uploaded at
  // least one of its documents, the header shows the option + upload status
  // instead of the generic prompt.
  const optionSummary = useMemo(() => {
    if (!selectedOption) return null;
    const optionDef = MAIN_OPTIONS.find((o) => o.id === selectedOption);
    const optionDocs = OPTION_SPECIFIC_DOCS[selectedOption] ?? [];
    const uploadedCount = optionDocs.filter((doc) => !!uploadedMap[String(doc.id)]).length;
    if (uploadedCount === 0) return null;
    return {
      label: optionDef?.label ?? `Option ${selectedOption}`,
      uploadedCount,
      total: optionDocs.length,
      allUploaded: optionDocs.length > 0 && uploadedCount === optionDocs.length,
    };
  }, [selectedOption, uploadedMap]);

  const defaultCollapsibleHeader = optionSummary ? (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="bg-main-p ds-caption! flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 font-bold! text-white">
        {selectedOption}
      </span>
      <Text className="text-theme-primary! font-semibold!">{optionSummary.label}</Text>
      <span
        className={`ds-caption! inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold! whitespace-nowrap ${
          optionSummary.allUploaded
            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
            : 'border-amber-200 bg-amber-50 text-amber-600'
        }`}
      >
        {optionSummary.allUploaded && <CheckCircleFilled />}
        {optionSummary.allUploaded
          ? 'Document uploaded'
          : `${optionSummary.uploadedCount} of ${optionSummary.total} uploaded`}
      </span>
    </div>
  ) : (
    <div className="text-text! flex items-center gap-2">
      <Text className="text-theme-primary! font-semibold!">Pick the main option (A-F)</Text>
      <span className="ds-body! text-text! font-medium!">
        — Required before you can confirm stage B
      </span>
    </div>
  );

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

  if (mode === 'collapsible') {
    return (
      <div className={`mt-3 ${className ?? ''}`}>
        <Collapse
          defaultActiveKey={collapsibleDefaultOpen ? ['1'] : []}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          className="rounded-xl border border-gray-200"
        >
          <Panel key="1" header={collapsibleHeader || defaultCollapsibleHeader}>
            <div className="">
              <MainOptionSelector
                selectedOption={selectedOption}
                onSelect={handleSelectOption}
                variant={selectorVariant}
                showDescriptionsAsTooltip={showDescriptionsAsTooltip}
              />

              {optionChangeWarning && hasUploadedDocumentForCurrentOption && (
                <Alert
                  className="mt-4!"
                  type="warning"
                  showIcon
                  title={optionChangeWarning}
                  closable
                />
              )}

              {onUpload && (
                <>
                  <OptionSpecificDocuments
                    selectedOption={selectedOption}
                    uploadedMap={uploadedMap}
                    loadingMap={loadingMap}
                    deletingMap={deletingMap}
                    progressMap={progressMap}
                    onUpload={onUpload}
                    disabled={disabled}
                    onView={onView}
                    onReplace={onReplace}
                    onRemove={onRemove}
                    uploadedDocuments={uploadedDocuments}
                    supportingDocsCountMap={supportingDocsCountMap}
                    onOpenSupportingDocs={onOpenSupportingDocs}
                    columns={columns}
                  />
                </>
              )}

              {children}
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }

  // Card layout
  const containerClasses = ['mt-3 overflow-hidden rounded-xl border border-gray-200', className]
    .filter(Boolean)
    .join(' ');

  const headerClasses = ['border-b border-gray-100 bg-blue-50 px-4 py-3', cardHeaderClassName]
    .filter(Boolean)
    .join(' ');

  const bodyClasses = ['p-4', cardBodyClassName].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {cardHeader && <div className={headerClasses}>{cardHeader}</div>}
      <div className={bodyClasses}>
        <MainOptionSelector
          selectedOption={selectedOption}
          onSelect={handleSelectOption}
          variant={selectorVariant}
          showDescriptionsAsTooltip={showDescriptionsAsTooltip}
        />

        {optionChangeWarning && hasUploadedDocumentForCurrentOption && (
          <Alert className="mt-4" type="warning" showIcon title={optionChangeWarning} closable />
        )}

        {children}
      </div>
    </div>
  );
};

MainOptionComponent.displayName = 'MainOptionComponent';

export default MainOptionComponent;
