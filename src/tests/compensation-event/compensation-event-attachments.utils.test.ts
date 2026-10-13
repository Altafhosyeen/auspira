import { describe, expect, it } from 'vitest';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  resolveEvidenceKind,
  toConversationEvidenceFiles,
  toEvidenceFile,
} from '@/modules/compensation-event/utils/compensation-event-api.utils';

describe('resolveEvidenceKind', () => {
  it('maps known extensions onto their icon kind', () => {
    expect(resolveEvidenceKind('PDF')).toBe('PDF');
    expect(resolveEvidenceKind('xlsx')).toBe('XLSX');
    expect(resolveEvidenceKind('docx')).toBe('DOCX');
    expect(resolveEvidenceKind('ZIP')).toBe('ZIP');
    expect(resolveEvidenceKind('png')).toBe('IMAGE');
  });

  it('falls back to a generic FILE for anything outside the catalogue', () => {
    expect(resolveEvidenceKind('txt')).toBe('FILE');
    expect(resolveEvidenceKind('')).toBe('FILE');
    expect(resolveEvidenceKind(undefined)).toBe('FILE');
  });
});

describe('toEvidenceFile', () => {
  it('maps the attachment DTO onto the evidence row, keeping the blob URL for download', () => {
    expect(
      toEvidenceFile({
        id: 'att-1',
        projectId: 'p-1',
        entityId: 'ce-1',
        entityType: 2,
        fileName: 'Impact Analysis.xlsx',
        fileExtension: 'xlsx',
        filePath: 'https://blob.example.com/impact.xlsx',
        fileSizeBytes: 2048,
        fileSizeMb: 0.002,
        uploadedAt: '2026-08-19T20:59:06.236Z',
        role: 0,
        uploadedByName: 'Sarah Price',
        isEmailAttachment: false,
      })
    ).toEqual({
      id: 'att-1',
      name: 'Impact Analysis.xlsx',
      kind: 'XLSX',
      sizeBytes: 2048,
      uploadedAt: '2026-08-19T20:59:06.236Z',
      filePath: 'https://blob.example.com/impact.xlsx',
      uploadedByName: 'Sarah Price',
    });
  });
});

describe('toConversationEvidenceFiles', () => {
  const attachments = [
    {
      url: 'https://blob/quote.pdf',
      name: 'Contractor Quotation.pdf',
      contentType: 'application/pdf',
    },
    { url: 'https://blob/notes.txt', name: 'Site notes.txt', contentType: 'text/plain' },
  ];

  const message = {
    id: 'email-1',
    senderEmail: 'john.smith@contractor.com',
    userEmail: 'pm@auspira.com',
    timestampUtc: '2026-07-15T14:32:00Z',
    attachmentUrls: [{ url: 'https://blob/quote.pdf', name: 'Contractor Quotation.pdf' }],
  } as never;

  it('reads the sender and stamp off the message each file rode in on', () => {
    const [quote] = toConversationEvidenceFiles(attachments, [message]);

    expect(quote).toEqual({
      id: 'https://blob/quote.pdf',
      name: 'Contractor Quotation.pdf',
      kind: 'PDF',
      uploadedAt: '2026-07-15T14:32:00Z',
      filePath: 'https://blob/quote.pdf',
      uploadedByName: 'john.smith@contractor.com',
    });
  });

  it('still lists a file no message in the thread claims, with no uploader or stamp', () => {
    const [, notes] = toConversationEvidenceFiles(attachments, [message]);

    expect(notes.name).toBe('Site notes.txt');
    expect(notes.kind).toBe('FILE');
    expect(notes.uploadedAt).toBeUndefined();
    expect(notes.uploadedByName).toBeUndefined();
  });

  it('maps every attachment when the thread has not been fetched', () => {
    expect(toConversationEvidenceFiles(attachments)).toHaveLength(2);
  });
});
