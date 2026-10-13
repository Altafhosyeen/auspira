import { describe, expect, it } from 'vitest';
import type { RequestForInformation } from '@/modules/request-for-information/types/request-for-information.types';
import {
  filterRequestForInformationList,
  paginateRequestForInformationList,
} from '@/modules/request-for-information/utils/request-for-information.utils';

const baseFixture: RequestForInformation = {
  id: 'rfi-1',
  reference: 'RFI-024',
  title: 'Lap length for 32mm bars, capping beam',
  description: 'Confirm the required lap length in the capping beam.',
  status: 'OPEN',
  raisedByName: 'David Thompson',
  raisedByRole: "Employer's PM",
  raisedToName: 'Sarah Mitchell',
  dueDate: '2026-07-20',
  dateIssued: '2026-08-20',
  createdAt: '2026-07-20T09:00:00Z',
  updatedAt: '2026-07-20T09:00:00Z',
};

const rows: RequestForInformation[] = [
  baseFixture,
  {
    ...baseFixture,
    id: 'rfi-2',
    reference: 'RFI-023',
    title: 'Fender chain grade clarification',
    description: 'Clarification on the fender chain assembly at Berth 2.',
    status: 'CLOSED',
    raisedByName: 'Sarah Mitchell',
    raisedToName: 'David Thompson',
  },
  {
    ...baseFixture,
    id: 'rfi-3',
    reference: 'RFI-022',
    title: 'Dolphin pile toe level',
    description: 'Confirmation required on the design toe level.',
    status: 'CLOSED',
    raisedByName: 'Alan Grant',
    raisedToName: 'Sarah Mitchell',
  },
];

describe('filterRequestForInformationList', () => {
  it('returns every row when no params are given', () => {
    expect(filterRequestForInformationList(rows)).toHaveLength(3);
  });

  it('matches the search term against reference, title, description and people', () => {
    expect(filterRequestForInformationList(rows, { term: 'RFI-023' })).toHaveLength(1);
    expect(filterRequestForInformationList(rows, { term: 'dolphin' })).toHaveLength(1);
    expect(filterRequestForInformationList(rows, { term: 'Berth 2' })).toHaveLength(1);
    expect(filterRequestForInformationList(rows, { term: 'Alan Grant' })).toHaveLength(1);
  });

  it('ignores case and surrounding whitespace in the search term', () => {
    expect(filterRequestForInformationList(rows, { term: '  LAP LENGTH  ' })).toHaveLength(1);
  });

  it('returns nothing when the term matches no row', () => {
    expect(filterRequestForInformationList(rows, { term: 'no-such-row' })).toHaveLength(0);
  });

  it('filters by status and treats an empty status list as no filter', () => {
    expect(filterRequestForInformationList(rows, { statuses: ['CLOSED'] })).toHaveLength(2);
    expect(filterRequestForInformationList(rows, { statuses: [] })).toHaveLength(3);
  });

  it('compares status case-insensitively, since the backend casing is inconsistent', () => {
    expect(filterRequestForInformationList(rows, { statuses: ['closed'] })).toHaveLength(2);
  });

  it('applies the search term and the status filter together', () => {
    const matches = filterRequestForInformationList(rows, {
      term: 'Sarah Mitchell',
      statuses: ['CLOSED'],
    });

    expect(matches.map((row) => row.id)).toEqual(['rfi-2', 'rfi-3']);
  });
});

describe('paginateRequestForInformationList', () => {
  it('slices to the requested page', () => {
    expect(paginateRequestForInformationList(rows, { skip: 0, top: 2 })).toHaveLength(2);
    expect(paginateRequestForInformationList(rows, { skip: 2, top: 2 })).toHaveLength(1);
  });

  it('returns every row for the export path, which asks for all of them', () => {
    expect(paginateRequestForInformationList(rows, { includeAll: true, skip: 0 })).toHaveLength(3);
  });

  it('still honours an explicit page size even when includeAll is set', () => {
    expect(paginateRequestForInformationList(rows, { includeAll: true, top: 1 })).toHaveLength(1);
  });
});
