import { notification } from 'antd';

// The one place the attachment rules live. Every "Upload Documents" card reads these, so
// the formats a card advertises, the picker's own filter and what is actually accepted
// cannot drift apart.

/** Exactly the formats the upload cards advertise — no archives, and no SVG, which can
 *  carry script and is opened straight from a blob URL by the View action. */
export const ALLOWED_UPLOAD_EXTENSIONS = [
  // Documents & Spreadsheets
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.ppt',
  '.pptx',
  // Images — `.jpeg` is the same format as `.jpg`, so both spellings are taken.
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
];

/** Value for an `<Upload accept>` — filters the OS picker to the same set. */
export const UPLOAD_ACCEPT = ALLOWED_UPLOAD_EXTENSIONS.join(',');

export const MAX_UPLOAD_SIZE_MB = 50;
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

// The MIME types the allowed extensions legitimately carry. The browser reads this from
// the file itself rather than its name, so a renamed executable fails here even though its
// extension passes. Some pickers report an empty type for known-good files (Office formats
// on Windows especially), so only a type that is present and unrecognised is rejected.
const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  // Windows reports CSV as one of these depending on what is installed.
  'application/csv',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
];

/** The caption shown under an empty upload card — the same set, in reading order. */
export const UPLOAD_SUPPORTED_HINT = `Supported: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), CSV, PowerPoint, Images (PNG/JPG/WEBP) · Up to ${MAX_UPLOAD_SIZE_MB}MB`;

/**
 * True when the file may be attached. Rejections raise the notification themselves, so a
 * caller can gate on this alone and the person always learns why a pick was dropped.
 */
export const isAllowedUploadFile = (file: File): boolean => {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;

  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(extension)) {
    notification.error({
      message: `"${file.name}" has an unsupported format. Only PDF, Word, Excel, CSV, PowerPoint and PNG/JPG/WEBP images are allowed.`,
    });
    return false;
  }

  if (file.type && !ALLOWED_UPLOAD_MIME_TYPES.includes(file.type)) {
    notification.error({
      message: `"${file.name}" does not look like a ${extension.slice(1).toUpperCase()} file.`,
    });
    return false;
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    notification.error({
      message: `"${file.name}" exceeds the ${MAX_UPLOAD_SIZE_MB}MB size limit.`,
    });
    return false;
  }

  return true;
};
