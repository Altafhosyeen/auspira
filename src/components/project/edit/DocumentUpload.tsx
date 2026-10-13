import React from 'react';
import UploadSection from './upload-document/UploadSection';
import SpecificDocuments from './upload-document/SpecificDocuments';
import UploadCard from './upload-document/UploadCard';
import { File } from 'lucide-react';

const SPECIFIC_DOC_UPLOADS = [
  {
    title: 'Priced Contract with Activity Schedule',
    subtitle: 'Upload the priced contract with activity schedule.',
    required: true,
    icon: <File />,
  },
  {
    title: 'Priced Contract with Bill of Quantities',
    subtitle: 'Upload the priced contract with bill of quantities.',
    required: true,
    icon: <span className="mr-2">📄</span>,
  },
  {
    title: 'Priced Contract with Activity Schedule',
    subtitle: 'Upload the priced contract with activity schedule.',
    required: true,
    icon: <span className="mr-2">📄</span>,
  },
  {
    title: 'Priced Contract with Activity Schedule',
    subtitle: 'Upload the priced contract with activity schedule.',
    required: true,
    icon: <span className="mr-2">📄</span>,
  },
];

const DocumentUpload: React.FC = () => {
  const [selectedSpecific, setSelectedSpecific] = React.useState<number | null>(0);

  return (
    <div className="space-y-6">
      {/* Main upload grid (uses existing UploadSection) */}
      <UploadSection />

      {/* Specific Documents selector (uses existing SpecificDocuments) */}
      <div>
        <div className="mb-2">
          <h4 className="text-sm font-bold">Specific Documents</h4>
        </div>
        <SpecificDocuments selected={selectedSpecific} onSelect={setSelectedSpecific} />
      </div>

      {/* Render upload card for selected specific document */}
      {selectedSpecific !== null && (
        <div>
          <UploadCard
            title={SPECIFIC_DOC_UPLOADS[selectedSpecific].title}
            subtitle={SPECIFIC_DOC_UPLOADS[selectedSpecific].subtitle}
            required={SPECIFIC_DOC_UPLOADS[selectedSpecific].required}
            fullWidth
            icon={SPECIFIC_DOC_UPLOADS[selectedSpecific].icon}
          />
        </div>
      )}

      {/* Bill of Quantities (reuses UploadCard) */}
      {/* <div>
        <UploadCard
          title="Bill of Quantities"
          subtitle="The primary executing document."
          required
          fullWidth
        />
      </div> */}
    </div>
  );
};

export default DocumentUpload;
