/**
 * Document Upload Utilities
 * Helpers for preparing document uploads with FormData
 */

import type { RcFile } from 'antd/es/upload';

/**
 * Normalise a file name for keyword matching: drop the extension, lowercase,
 * and turn any run of non-alphanumeric characters into a single space.
 * e.g. "Form-of-Agreement_v2.PDF" -> "form of agreement v2"
 */
const normaliseName = (filename: string): string =>
  filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Returns true when the file name looks like it matches the expected document,
 * i.e. its normalised name contains at least one of the given keywords.
 * When no keywords are provided, matching is skipped (always true).
 */
export const fileNameMatchesKeywords = (filename: string, keywords?: string[]): boolean => {
  if (!keywords || keywords.length === 0) return true;
  const name = normaliseName(filename);
  return keywords.some((keyword) => name.includes(normaliseName(keyword)));
};

/**
 * Create FormData for document upload
 * @param file - The file to upload
 * @param documentType - The document type ID/code (number or string)
 * @returns FormData with file and documentType
 */
export const createDocumentUploadFormData = (
  file: RcFile,
  documentType: number | string
): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', String(documentType));
  return formData;
};

/**
 * Create FormData for a supporting document upload.
 * Supporting docs are linked to a main document via ParentId.
 */
export const createSupportingDocUploadFormData = (
  file: RcFile,
  ParentId: string | number,
  documentType: string | number
): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ParentId', String(ParentId));
  formData.append('DocumentType', String(documentType));
  return formData;
};
