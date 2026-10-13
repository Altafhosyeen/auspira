import type { DocumentMeta } from '../shared/types';
import { getDocumentLabel } from '@/lib/utils/document.type.code';

// ==========================================
// DOCUMENT METADATA — generic fallback for document types
// that do not yet have a dedicated metadata panel/page.
// ==========================================
export const buildGenericDocumentMeta = (label: string, documentType?: number): DocumentMeta => ({
  title: 'Salt Island Bridge Replacement',
  subtitle: `${label.toUpperCase()} | PC6884-RHD-XX-XX-GN-C-2000`,
  reference: 'PC6884-RHD-XX-XX-GN-C-2000',
  projectNumber: 'PC6884',
  revision: 'Rev C02',
  date: '17 Mar 2025',
  totalPages: 49,
  coverHeading: ['Holyhead Ferry Terminal', 'Salt Island Bridge Replacement'],
  documentType: label,
  documentSubtitle: documentType ? getDocumentLabel(documentType) || label : label,
  status: 'A3/C02',
  client: 'Stena Line Ports Ltd',
  documentTitle: 'Holyhead Ferry Terminal - Salt Island Bridge',
  fileUrl: '/projects/view-document-scope?file=document.pdf',
});
