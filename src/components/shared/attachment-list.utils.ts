import { parseBackendDate } from '@/lib/utils';

export type FileKind = 'pdf' | 'excel' | 'word' | 'powerpoint' | 'image' | 'text' | 'zip' | 'other';

const BY_EXTENSION: Record<string, FileKind> = {
  pdf: 'pdf',
  xlsx: 'excel',
  xls: 'excel',
  xlsm: 'excel',
  csv: 'excel',
  doc: 'word',
  docx: 'word',
  rtf: 'word',
  ppt: 'powerpoint',
  pptx: 'powerpoint',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  bmp: 'image',
  webp: 'image',
  svg: 'image',
  heic: 'image',
  tif: 'image',
  tiff: 'image',
  txt: 'text',
  md: 'text',
  json: 'text',
  xml: 'text',
  eml: 'text',
  msg: 'text',
  zip: 'zip',
  rar: 'zip',
  '7z': 'zip',
  tar: 'zip',
  gz: 'zip',
};

// Fallback when the backend omits fileExtension but sends a MIME content type.
const BY_MIME_PREFIX: Array<[string, FileKind]> = [
  ['image/', 'image'],
  ['text/', 'text'],
  ['application/pdf', 'pdf'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml', 'word'],
  ['application/msword', 'word'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml', 'excel'],
  ['application/vnd.ms-excel', 'excel'],
  ['application/vnd.openxmlformats-officedocument.presentationml', 'powerpoint'],
  ['application/vnd.ms-powerpoint', 'powerpoint'],
  ['application/zip', 'zip'],
  ['application/x-zip', 'zip'],
];

// Extension wins; a MIME content type is used only when the extension is unknown.
export const fileKind = (extension?: string | null, contentType?: string): FileKind => {
  const byExt = extension ? BY_EXTENSION[extension.replace(/^\./, '').toLowerCase()] : undefined;
  if (byExt) return byExt;

  const mime = contentType?.toLowerCase().trim();
  if (mime) {
    const match = BY_MIME_PREFIX.find(([prefix]) => mime.startsWith(prefix));
    if (match) return match[1];
  }

  return 'other';
};

export const FILE_LABEL: Record<FileKind, string> = {
  pdf: 'PDF',
  excel: 'XLSX',
  word: 'DOCX',
  powerpoint: 'PPTX',
  image: 'IMAGE',
  text: 'TEXT',
  zip: 'ZIP',
  other: 'FILE',
};

export const FILE_TONE: Record<FileKind, { color: string; background: string }> = {
  pdf: { color: '#C0392B', background: '#FDECEA' },
  excel: { color: '#1E7B34', background: '#E8F6EC' },
  word: { color: '#1D4F91', background: '#E8F0FB' },
  powerpoint: { color: '#C05621', background: '#FDF0E6' },
  image: { color: '#0E7490', background: '#E6F6FA' },
  text: { color: '#475467', background: '#F2F4F7' },
  zip: { color: '#7A3E9D', background: '#F3E8FA' },
  other: { color: '#667085', background: '#F1F3F7' },
};

// Office kinds keep their canonical label; images/text/archives show their real extension instead.
export const fileTypeLabel = (extension?: string | null, contentType?: string): string => {
  const kind = fileKind(extension, contentType);
  const ext = extension?.replace(/^\./, '').trim().toUpperCase();

  if (kind === 'other') return ext || FILE_LABEL.other;
  if (kind === 'image' || kind === 'text' || kind === 'zip') return ext || FILE_LABEL[kind];
  return FILE_LABEL[kind];
};

/** Bytes → human size, e.g. 1_258_291 → "1.2 MB", 897_024 → "876 KB". Handles string numerics. */
export const formatFileSize = (bytes?: number | string | null): string => {
  const size = Number(bytes);
  if (!Number.isFinite(size)) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

/** ISO → "15 Jul 2026, 14:32". */
export const formatFileDate = (iso?: string | null): string => {
  const date = parseBackendDate(iso);
  if (!date) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
