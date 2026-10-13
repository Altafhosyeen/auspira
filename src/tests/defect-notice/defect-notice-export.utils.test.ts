import { describe, expect, it } from 'vitest';
import type { DefectNotice } from '@/modules/defect-notice/types/defect-notice.types';
import { DefectNoticeStatus } from '@/modules/defect-notice/types/defect-notice.types';
import { DEFECT_NOTICE_EXPORT_COLUMNS } from '@/modules/defect-notice/utils/defect-notice-export.utils';

const baseFixture: DefectNotice = {
  id: '1',
  reference: 'DN-024',
  title: 'Lap length for 32mm bars, capping beam',
  raisedByName: 'Sarah Mitchell',
  raisedByRole: "Employer's PM",
  dateIssued: '20 Jul 2026',
  dueDate: '20 Aug 2026',
  status: DefectNoticeStatus.Open,
  statusLabel: 'OPEN',
  referenceClause: 'Clause 17.1',
  description: 'Lap length does not meet the specified minimum.',
};

const cellFor = (header: string, notice: DefectNotice) => {
  const column = DEFECT_NOTICE_EXPORT_COLUMNS.find((entry) => entry.header === header);
  if (!column) throw new Error(`No export column named "${header}"`);
  return column.value(notice);
};

describe('DEFECT_NOTICE_EXPORT_COLUMNS', () => {
  it('exports the register columns in the order the table shows them', () => {
    expect(DEFECT_NOTICE_EXPORT_COLUMNS.map((column) => column.header)).toEqual([
      'Defect Ref',
      'Title',
      'Raised By',
      'Role',
      'Date Issued',
      'Due Date',
      'Status',
      'Reference Clause',
      'Description',
    ]);
  });

  // The register carries dates as "20 Jul 2026" display strings, so they have to reach the
  // sheet as real Date cells or Excel sorts them alphabetically.
  it('parses display-format dates into sortable date cells', () => {
    const issued = cellFor('Date Issued', baseFixture);

    expect(issued).toBeInstanceOf(Date);
    expect((issued as Date).getFullYear()).toBe(2026);
    expect((issued as Date).getMonth()).toBe(6); // July
    expect((issued as Date).getDate()).toBe(20);
  });

  it('passes an unrecognised date through verbatim rather than blanking it', () => {
    expect(cellFor('Due Date', { ...baseFixture, dueDate: 'TBC' })).toBe('TBC');
  });

  it('emits an empty cell when a date is missing', () => {
    expect(cellFor('Due Date', { ...baseFixture, dueDate: '' })).toBeNull();
  });

  it('writes the human-readable status label, not the raw enum', () => {
    expect(cellFor('Status', baseFixture)).toBe('Open');
    expect(cellFor('Status', { ...baseFixture, status: DefectNoticeStatus.Closed })).toBe('Closed');
    expect(cellFor('Status', { ...baseFixture, status: DefectNoticeStatus.NotAccepted })).toBe(
      'Not Accepted'
    );
    expect(cellFor('Status', { ...baseFixture, status: DefectNoticeStatus.Discard })).toBe(
      'Discarded'
    );
  });

  it('emits empty cells for the optional detail fields', () => {
    const sparse: DefectNotice = {
      ...baseFixture,
      referenceClause: undefined,
      description: undefined,
    };

    expect(cellFor('Reference Clause', sparse)).toBeNull();
    expect(cellFor('Description', sparse)).toBeNull();
  });
});
