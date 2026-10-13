import React from 'react';
import Image from 'next/image';
import { Popconfirm, Upload } from 'antd';
import type { RcFile, UploadChangeParam } from 'antd/es/upload';
import { Download, Trash2 } from 'lucide-react';
import { UploadOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const ACCEPTED_FORMATS = '.xer,.xml,.mpp,.pdf,.xlsx,.xls';

const getFileTypeIcon = (name: string) => {
  const ext = name.toLowerCase();
  if (ext.endsWith('.pdf')) {
    return { src: '/assets/images/pdf.png', alt: 'PDF file icon' };
  }
  if (ext.endsWith('.xml')) {
    return { src: '/assets/images/xml.png', alt: 'XML file icon' };
  }
  if (
    ext.endsWith('.xls') ||
    ext.endsWith('.xlsx') ||
    ext.endsWith('.xer') ||
    ext.endsWith('.mpp')
  ) {
    return { src: '/assets/images/excel.png', alt: 'Spreadsheet file icon' };
  }
  return { src: '/assets/images/xml.png', alt: 'File icon' };
};

// ─── Uploaded file row ────────────────────────────────────────────────────────

interface UploadedFileRowProps {
  fileName: string;
  fileSize: number | null;
  deleting?: boolean;
  downloading?: boolean;
  onDownload?: () => void;
  onDelete: () => void;
}

const actionBtn =
  'flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 ds-caption! font-medium! text-slate-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const UploadedFileRow: React.FC<UploadedFileRowProps> = ({
  fileName,
  fileSize,
  deleting = false,
  downloading = false,
  onDownload,
  onDelete,
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        <Image
          src={'/assets/images/orcla.png'}
          alt={getFileTypeIcon(fileName).alt}
          width={30}
          height={30}
          className="h-8 w-8 object-contain"
          unoptimized
        />
      </div>
      <div className="min-w-0">
        <p className="ds-body! text-text truncate font-semibold!">{fileName}</p>
        <p className="ds-caption! text-slate-700">
          {fileSize ? `${(fileSize / 1024).toFixed(1)} KB · ` : ''}
          XER (PRIMAVERA), XML OR .MPP (MS PROJECT), OR PDF
        </p>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {onDownload && (
        <button
          onClick={onDownload}
          disabled={downloading}
          className={`${actionBtn} hover:border-indigo-300 hover:text-indigo-600`}
        >
          <Download size={13} />
          {downloading ? 'Downloading…' : 'Download'}
        </button>
      )}
      <Popconfirm
        title="Remove document"
        description="Are you sure you want to remove this programme file?"
        okText="Yes"
        cancelText="No"
        disabled={deleting}
        onConfirm={onDelete}
      >
        <button
          disabled={deleting}
          className={`${actionBtn} hover:border-red-300 hover:text-red-500`}
        >
          <Trash2 size={13} />
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </Popconfirm>
    </div>
  </div>
);

// ─── Empty drop state ─────────────────────────────────────────────────────────

const FORMAT_ICON_TILES = [
  {
    key: 'oracle',
    src: '/assets/images/orcla.png',
    alt: 'Oracle Primavera',
    imgClassName: 'h-4 w-auto',
  },
  {
    key: 'xml',
    src: '/assets/images/xml.png',
    alt: 'XML format',
    imgClassName: 'h-7 w-auto',
  },
  {
    key: 'pdf',
    src: '/assets/images/pdf.png',
    alt: 'PDF format',
    imgClassName: 'h-7 w-auto',
  },
  {
    key: 'xls',
    src: '/assets/images/excel.png',
    alt: 'Excel format',
    imgClassName: 'h-7 w-auto',
  },
] as const;

const EmptyDropState: React.FC = () => (
  <div className="flex flex-col items-center gap-3 text-center">
    <div className="ds-micro! inline-flex items-center gap-1 rounded-sm border border-[#1677ff] px-2 py-0.5 font-medium! text-[#1677ff]">
      <UploadOutlined className="text-[10px]" />
      Upload
    </div>

    <div>
      <p className="ds-body-large! text-text font-semibold!">Drag & drop programme file</p>
      <p className="ds-body! mt-1 text-slate-500">
        or{' '}
        <span className="font-semibold! text-indigo-600 underline underline-offset-2">
          browse files
        </span>{' '}
        from your computer
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-2 pt-1">
      {FORMAT_ICON_TILES.map(({ key, src, alt, imgClassName }) => (
        <div
          key={key}
          className={`flex h-9 w-[88px] items-center justify-center rounded border border-slate-200 px-2 ${
            key === 'oracle' ? 'bg-white' : 'bg-slate-50 opacity-70'
          }`}
        >
          <Image src={src} alt={alt} width={96} height={28} className={imgClassName} unoptimized />
        </div>
      ))}
    </div>
  </div>
);

// ─── Drop zone ────────────────────────────────────────────────────────────────

export interface ProgrammeDropZoneProps {
  uploadedFile: File | null;
  showData: boolean;
  dataName: string;
  disabled?: boolean;
  deleting?: boolean;
  downloading?: boolean;
  onFile: (file: RcFile) => void;
  onDownload?: () => void;
  onDelete: () => void;
}

export const ProgrammeDropZone: React.FC<ProgrammeDropZoneProps> = ({
  uploadedFile,
  showData,
  dataName,
  disabled = false,
  deleting = false,
  downloading = false,
  onFile,
  onDownload,
  onDelete,
}) => {
  const handleChange = (info: UploadChangeParam) => {
    if (info.file) onFile(info.file as RcFile);
  };

  return (
    <div
      className={[
        'rounded-xl border-2 border-dashed transition-all duration-200',
        showData ? 'border-slate-200 bg-white p-4' : 'border-slate-300 bg-white',
      ].join(' ')}
    >
      {showData ? (
        <UploadedFileRow
          fileName={uploadedFile ? uploadedFile.name : dataName}
          fileSize={uploadedFile ? uploadedFile.size : null}
          deleting={deleting}
          downloading={downloading}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ) : (
        <Dragger
          name="file"
          multiple={false}
          showUploadList={false}
          accept={ACCEPTED_FORMATS}
          disabled={disabled}
          // Returning false stops antd's own auto-upload — onChange still fires with the file
          // so the caller can run its own (real) upload mutation.
          beforeUpload={() => false}
          onChange={handleChange}
          className="border-none! bg-transparent! p-6!"
        >
          <EmptyDropState />
        </Dragger>
      )}
    </div>
  );
};

ProgrammeDropZone.displayName = 'ProgrammeDropZone';
