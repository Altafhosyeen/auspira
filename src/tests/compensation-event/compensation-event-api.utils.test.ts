import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { COMPENSATION_EVENT_TYPE } from '@/modules/compensation-event/constants/compensation-event-notice.constants';
import type { CompensationEventResponseDto } from '@/modules/compensation-event/types/compensation-event-api.types';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  buildNoticeTitle,
  matchCompensationEventReference,
  resolveApiClauses,
  resolveApiStatus,
  resolveCompensationEventRegisterState,
  resolveCompensationEventStatusLabel,
  resolveNoticeTypeValue,
  splitContractClause,
  toCompensationEvent,
  toCompensationEventListResponse,
  toCompensationEventLookupOptions,
  toCompensationEventNoticeInput,
  toNumber,
} from '@/modules/compensation-event/utils/compensation-event-api.utils';

const buildDto = (
  overrides: Partial<CompensationEventResponseDto> = {}
): CompensationEventResponseDto => ({
  id: 'ce-1',
  projectId: 'p-1',
  reference: 'CEN-014',
  title: 'Ground conditions',
  clauseNumber: '60.1(12)',
  clauseTitle: 'Physical conditions',
  clauseDescription: '',
  additionalClauseReferences: null,
  type: 0,
  description: 'Unforeseen obstructions',
  proposedEffectDescription: 'Revised sequence',
  estimatedValue: '48400',
  estimatedDays: '6',
  currency: 'GBP',
  isQuotationRequired: true,
  requiresPmDecision: true,
  isRaisedManually: true,
  implementedValue: null,
  implementedDays: null,
  implementedOn: null,
  earlyWarningReference: 'EWN-021',
  earlyWarningId: null,
  raisedBy: 'Sarah Price',
  notes: null,
  status: 7,
  statusName: 'Quoted',
  createdOn: '2024-07-07T09:15:00.000Z',
  updatedOn: '2024-07-16T16:30:00.000Z',
  ...overrides,
});

describe('toNumber', () => {
  it('passes numbers through', () => {
    expect(toNumber(48_400)).toBe(48_400);
  });

  it('parses the string form the serialiser may send', () => {
    expect(toNumber('17450.5')).toBe(17450.5);
  });

  it('returns null for missing, empty and unparseable values', () => {
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber('')).toBeNull();
    expect(toNumber('abc')).toBeNull();
  });

  it('keeps zero rather than nulling it', () => {
    expect(toNumber('0')).toBe(0);
  });
});

describe('toCompensationEvent — lifecycle dates', () => {
  it('reads the quotation date off quotationSubmittedOn', () => {
    const event = toCompensationEvent(
      buildDto({ quotationSubmittedOn: '2026-07-10T09:00:00Z' } as never)
    );

    expect(event.quoteReceivedDate).toBe('2026-07-10T09:00:00Z');
  });

  it('leaves the quotation date null when the record has no quotation yet', () => {
    expect(toCompensationEvent(buildDto()).quoteReceivedDate).toBeNull();
  });
});

describe('resolveApiStatus', () => {
  it('passes register states through, whatever the casing', () => {
    expect(resolveApiStatus('Quotation Submitted')).toBe('QUOTATION_SUBMITTED');
    expect(resolveApiStatus('implemented')).toBe('IMPLEMENTED');
  });

  it('keeps legacy statuses the register already folds', () => {
    expect(resolveApiStatus('Approved')).toBe('APPROVED');
  });

  it('maps unknown backend wording onto the closest state', () => {
    expect(resolveApiStatus('Quote Submitted')).toBe('QUOTATION_SUBMITTED');
    expect(resolveApiStatus('Notified')).toBe('QUOTATION_TO_BE_SUBMITTED');
    expect(resolveApiStatus('Closed Out')).toBe('IMPLEMENTED');
  });

  it('reads a withdrawn event as discarded rather than a live draft', () => {
    expect(resolveApiStatus('Discard')).toBe('DISCARDED');
    expect(resolveApiStatus('Discarded')).toBe('DISCARDED');
    expect(resolveApiStatus('discard')).toBe('DISCARDED');
  });

  it('falls back to draft for missing or unrecognised values', () => {
    expect(resolveApiStatus(null)).toBe('DRAFT');
    expect(resolveApiStatus('Something Else')).toBe('DRAFT');
  });
});

describe('resolveCompensationEventRegisterState', () => {
  it('resolves the register state from the numeric status code', () => {
    expect(resolveCompensationEventRegisterState(5, 'anything')).toBe('QUOTATION_TO_BE_SUBMITTED');
    expect(resolveCompensationEventRegisterState(7, null)).toBe('QUOTATION_SUBMITTED');
    expect(resolveCompensationEventRegisterState(10, null)).toBe('IMPLEMENTED');
  });

  it('falls back to the text resolver when the code is missing or unrecognised', () => {
    expect(resolveCompensationEventRegisterState(null, 'Quotation Submitted')).toBe(
      'QUOTATION_SUBMITTED'
    );
    expect(resolveCompensationEventRegisterState(99, 'Implemented')).toBe('IMPLEMENTED');
  });
});

describe('resolveCompensationEventStatusLabel', () => {
  it('derives the proper name from the numeric status code', () => {
    expect(resolveCompensationEventStatusLabel(5, 'Quote Requested')).toBe('Quotation Requested');
    expect(resolveCompensationEventStatusLabel(2, null)).toBe('Awaiting PM Decision');
  });

  it('falls back to the raw statusName when the code is missing or unrecognised', () => {
    expect(resolveCompensationEventStatusLabel(null, 'Notified')).toBe('Notified');
    expect(resolveCompensationEventStatusLabel(99, ' Custom ')).toBe('Custom');
    expect(resolveCompensationEventStatusLabel(null, null)).toBeUndefined();
  });
});

describe('resolveApiClauses', () => {
  it('returns the primary clause on its own', () => {
    expect(resolveApiClauses(buildDto())).toEqual(['60.1(12)']);
  });

  it('splits the additional references on commas and semicolons', () => {
    const clauses = resolveApiClauses(
      buildDto({ additionalClauseReferences: '61.3, 62.3; 60.1(1)' })
    );
    expect(clauses).toEqual(['60.1(12)', '61.3', '62.3', '60.1(1)']);
  });

  it('drops blank entries', () => {
    expect(resolveApiClauses(buildDto({ additionalClauseReferences: ' , ' }))).toEqual([
      '60.1(12)',
    ]);
  });
});

describe('toCompensationEvent', () => {
  it('maps the wire shape onto the register model', () => {
    const event = toCompensationEvent(buildDto());

    expect(event.id).toBe('ce-1');
    expect(event.amount).toBe(48_400);
    expect(event.status).toBe('QUOTATION_SUBMITTED');
    expect(event.timeImpactDays).toBe(6);
    expect(event.parentEarlyWarningReference).toBe('EWN-021');
    expect(event.raisedByName).toBe('Sarah Price');
  });

  it('carries implemented figures into the financials fields', () => {
    const event = toCompensationEvent(
      buildDto({
        implementedValue: '46464',
        implementedDays: '4',
        implementedOn: '2024-07-16T00:00:00.000Z',
        statusName: 'Implemented',
      })
    );

    expect(event.finalApprovedAmount).toBe(46_464);
    expect(event.approvedTimeImpactDays).toBe(4);
    expect(event.decisionDate).toBe('2024-07-16T00:00:00.000Z');
  });

  it('leaves approved figures unset while the event is not implemented', () => {
    const event = toCompensationEvent(buildDto());
    expect(event.finalApprovedAmount).toBeNull();
  });

  it('falls back to the created date when the record was never updated', () => {
    const event = toCompensationEvent(buildDto({ updatedOn: null }));
    expect(event.updatedAt).toBe('2024-07-07T09:15:00.000Z');
  });

  it('defaults a missing currency', () => {
    expect(toCompensationEvent(buildDto({ currency: '' })).currency).toBe('GBP');
  });

  it('carries the notice fields the Overview tab reads', () => {
    const event = toCompensationEvent(
      buildDto({
        type: 1,
        additionalClauseReferences: '61.3, 62.3',
        notes: 'Date issued: 2024-07-07',
      })
    );

    expect(event.typeValue).toBe(1);
    // status:7 (QuotationSubmitted) is authoritative, so the proper code name wins over
    // the raw statusName text sent alongside it.
    expect(event.statusName).toBe('Quotation Submitted');
    expect(event.clauseNumber).toBe('60.1(12)');
    expect(event.clauseTitle).toBe('Physical conditions');
    expect(event.additionalClauses).toEqual(['61.3', '62.3']);
    expect(event.proposedEffect).toBe('Revised sequence');
    expect(event.isQuotationRequired).toBe(true);
    expect(event.requiresPmDecision).toBe(true);
    expect(event.isRaisedManually).toBe(true);
    expect(event.notes).toBe('Date issued: 2024-07-07');
  });

  it('leaves blank text fields unset rather than empty', () => {
    const event = toCompensationEvent(
      buildDto({ clauseDescription: '   ', proposedEffectDescription: '', notes: null })
    );

    expect(event.clauseDescription).toBeUndefined();
    expect(event.proposedEffect).toBeUndefined();
    expect(event.notes).toBeUndefined();
    expect(event.additionalClauses).toEqual([]);
  });
});

describe('toCompensationEventListResponse', () => {
  it('reads the total off meta and maps every item', () => {
    const response = toCompensationEventListResponse({
      meta: { totalCount: '12' },
      items: [buildDto(), buildDto({ id: 'ce-2' })],
    });

    expect(response.count).toBe(12);
    expect(response.items.map((item) => item.id)).toEqual(['ce-1', 'ce-2']);
  });

  it('falls back to the item count when meta is absent', () => {
    const response = toCompensationEventListResponse({
      items: [buildDto()],
    } as never);

    expect(response.count).toBe(1);
  });

  it('survives an empty page', () => {
    const response = toCompensationEventListResponse({ meta: { totalCount: 0 }, items: [] });
    expect(response).toEqual({ count: 0, next: null, previous: null, items: [] });
  });
});

describe('buildNoticeTitle', () => {
  it('keeps a short description whole', () => {
    expect(buildNoticeTitle('Crane breakdown on Pier 4')).toBe('Crane breakdown on Pier 4');
  });

  it('collapses whitespace', () => {
    expect(buildNoticeTitle('  Crane   breakdown \n on Pier 4 ')).toBe('Crane breakdown on Pier 4');
  });

  it('cuts a long description on a sentence break', () => {
    const description = `${'Crane availability caused a delay to the deck pour.'.padEnd(60, ' ')} And then a much longer second sentence that runs past the limit for sure.`;
    expect(buildNoticeTitle(description)).toMatch(/\.$/);
  });

  it('ellipsises when there is no sentence break to cut on', () => {
    const title = buildNoticeTitle('x'.repeat(200));
    expect(title.endsWith('…')).toBe(true);
    expect(title.length).toBeLessThanOrEqual(121);
  });

  it('handles a missing description', () => {
    expect(buildNoticeTitle()).toBe('');
  });
});

describe('splitContractClause', () => {
  it('splits the number from the title', () => {
    expect(splitContractClause('60.1(1) - PM changes Works Information')).toEqual({
      number: '60.1(1)',
      title: 'PM changes Works Information',
    });
  });

  it('keeps hyphens inside the title', () => {
    expect(splitContractClause('60.1(2) - Employer - no access').title).toBe(
      'Employer - no access'
    );
  });

  it('handles a clause with no title', () => {
    expect(splitContractClause('60.1(19)')).toEqual({ number: '60.1(19)', title: '' });
  });
});

describe('resolveNoticeTypeValue', () => {
  it('passes the backend enum values through', () => {
    expect(resolveNoticeTypeValue(COMPENSATION_EVENT_TYPE.CONTRACTOR_NOTIFICATION)).toBe(1);
    expect(resolveNoticeTypeValue(COMPENSATION_EVENT_TYPE.EARLY_WARNING)).toBe(2);
    expect(resolveNoticeTypeValue(COMPENSATION_EVENT_TYPE.PROJECT_MANAGER_INSTRUCTION)).toBe(3);
    expect(resolveNoticeTypeValue(COMPENSATION_EVENT_TYPE.MANUAL)).toBe(4);
  });

  it('never sends a value outside the enum, which the backend rejects', () => {
    expect(resolveNoticeTypeValue(0 as never)).toBe(1);
    expect(resolveNoticeTypeValue(9 as never)).toBe(1);
    expect(resolveNoticeTypeValue()).toBe(1);
  });
});

describe('toCompensationEventNoticeInput', () => {
  const values = {
    compensationEventType: COMPENSATION_EVENT_TYPE.EARLY_WARNING,
    relevantContractClause: '60.1(1) - PM changes Works Information',
    descriptionOfEvent: 'Crane availability caused a reschedule.',
    proposedEffect: 'Four days of delay.',
    from: 'Sarah Price',
    to: ['david.moore@employer.test', '  '],
    cc: ['clare@contractor.test', '  '],
    bcc: [],
    role: "Contractor's Representative",
    dateIssued: dayjs('2024-07-07'),
  };

  const context = {
    projectId: 'p-1',
    projectName: 'Riverside',
    projectReference: 'RIP-IC-01',
  };

  it('maps the form onto the multipart payload', () => {
    const input = toCompensationEventNoticeInput(values, context);

    expect(input.projectId).toBe('p-1');
    // Not collected on the form — the backend assigns the CE reference on create.
    expect(input.reference).toBe('');
    expect(input.clauseNumber).toBe('60.1(1)');
    expect(input.clauseTitle).toBe('PM changes Works Information');
    expect(input.clauseDescription).toBe('60.1(1) - PM changes Works Information');
    // The type select holds the enum value itself, so it reaches the payload as picked.
    expect(input.type).toBe(COMPENSATION_EVENT_TYPE.EARLY_WARNING);
    expect(input.raisedBy).toBe('Sarah Price');
    expect(input.to).toBe('david.moore@employer.test');
    expect(input.cc).toBe('clare@contractor.test');
    // An empty recipient list is left off the payload rather than sent blank.
    expect(input.bcc).toBeUndefined();
  });

  it('sends the impact fields at zero — the notice screen does not collect them', () => {
    const input = toCompensationEventNoticeInput(values, context);

    expect(input.estimatedValue).toBe(0);
    expect(input.estimatedDays).toBe(0);
    expect(input.isQuotationRequired).toBe(false);
  });

  it('uses the description for both the title and the email subject', () => {
    const input = toCompensationEventNoticeInput(values, context);
    expect(input.title).toBe('Crane availability caused a reschedule.');
    expect(input.subject).toBe(input.title);
  });

  it('preserves the role and issue date the DTO has no fields for', () => {
    const input = toCompensationEventNoticeInput(values, context);
    expect(input.notes).toBe("Role: Contractor's Representative | Date issued: 2024-07-07");
  });

  it('leaves notes unset when neither of them is filled in', () => {
    const input = toCompensationEventNoticeInput({}, context);
    expect(input.notes).toBeUndefined();
  });

  it('defaults the recipient fields when nothing is filled in', () => {
    const input = toCompensationEventNoticeInput({}, context);
    expect(input.raisedBy).toBe('');
    expect(input.to).toBe('');
    expect(input.cc).toBeUndefined();
    expect(input.bcc).toBeUndefined();
  });
});

describe('toCompensationEventLookupOptions', () => {
  it('labels each option "<reference> - <title>" and keeps the id as the value', () => {
    expect(
      toCompensationEventLookupOptions([
        { id: 'ce-1', reference: 'CE-2024-015', title: 'Access delay' },
      ])
    ).toEqual([{ label: 'CE-2024-015 - Access delay', value: 'ce-1', reference: 'CE-2024-015' }]);
  });

  it('falls back to the id when the row carries no reference or title', () => {
    expect(toCompensationEventLookupOptions([{ id: 'ce-2', reference: '', title: '' }])).toEqual([
      { label: 'ce-2', value: 'ce-2', reference: 'ce-2' },
    ]);
  });

  it('handles an absent list', () => {
    expect(toCompensationEventLookupOptions()).toEqual([]);
  });
});

describe('matchCompensationEventReference', () => {
  const lookup = [
    { id: 'ce-1', reference: 'CE-014', title: 'Rock strata' },
    { id: 'ce-2', reference: 'CE-015', title: 'Access delay' },
  ];

  it('ignores the extractor note after the reference', () => {
    expect(
      matchCompensationEventReference(
        'CE-014 (not linked with any known Compensation Event in Auspira)',
        lookup
      )
    ).toBe('ce-1');
  });

  it('matches on the identifying characters only', () => {
    expect(matchCompensationEventReference(' ce 015 ', lookup)).toBe('ce-2');
  });

  it('is undefined when the reference is empty or names no event on the project', () => {
    expect(matchCompensationEventReference('', lookup)).toBeUndefined();
    expect(matchCompensationEventReference(null, lookup)).toBeUndefined();
    expect(matchCompensationEventReference('(none found)', lookup)).toBeUndefined();
    expect(matchCompensationEventReference('CE-099', lookup)).toBeUndefined();
    expect(matchCompensationEventReference('CE-014')).toBeUndefined();
  });
});
