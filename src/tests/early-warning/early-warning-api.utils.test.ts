import { describe, expect, it } from 'vitest';
import { EwLifecycleStage, EwLifecycleStatus } from '@/constants/enum.constant';
import type {
  RegisterEarlyWarningContext,
  RegisterEarlyWarningFormValues,
} from '@/modules/early-warning/types/early-warning.types';
import type { ApiEarlyWarningDetail } from '@/modules/early-warning/types/early-warning-api.types';
import { matchesRegisterTab } from '@/modules/early-warning/utils/early-warning.utils';
import {
  deriveStatus,
  isDueDateOverdue,
  nextDueLifecycle,
  toEarlyWarning,
  toEarlyWarningListResponse,
  toRegisterEarlyWarningFormData,
  toRegisterEarlyWarningRequest,
} from '@/modules/early-warning/utils/early-warning-api.utils';

const lifecycle = (
  stage: EwLifecycleStage,
  status: EwLifecycleStatus,
  dueDate?: string
): ApiEarlyWarningDetail['earlyWarningLifecycles'] => [
  {
    id: 'l1',
    earlyWarningId: 'ew1',
    stage,
    status,
    occurredAt: null,
    dueDate: dueDate ?? null,
    note: null,
  },
];

const baseDto = (overrides: Partial<ApiEarlyWarningDetail> = {}): ApiEarlyWarningDetail => ({
  id: 'ew1',
  projectId: 'p1',
  reference: 'EW-001',
  raisedBy: 'Alice',
  title: 'Late drawings',
  description: 'Drawings are late',
  dateRaised: '2026-07-31T00:00:00Z',
  potentialImpacts: 'Delay risk',
  proposedActions: 'Chase contractor',
  keyDatesAffected: null,
  delayToCompletion: true,
  keyDateImpact: false,
  costIncrease: false,
  performanceImpairment: false,
  mitigationAgreed: false,
  projectEmailId: null,
  isRaisedManually: true,
  closingReason: null,
  closingNotes: null,
  closingDate: null,
  closedByName: null,
  status: 0,
  earlyWarningLifecycles: [],
  ...overrides,
});

describe('deriveStatus', () => {
  it('returns OPEN when the top-level status is open', () => {
    expect(deriveStatus(baseDto({ status: 0 }))).toBe('OPEN');
  });

  it('returns CLOSED when the top-level status enum says so', () => {
    expect(deriveStatus(baseDto({ status: 1 }))).toBe('CLOSED');
  });

  it('returns NOT_ACCEPTED when the top-level status enum says so', () => {
    expect(deriveStatus(baseDto({ status: 2 }))).toBe('NOT_ACCEPTED');
  });

  it('returns DISCARD when the top-level status enum says so', () => {
    expect(deriveStatus(baseDto({ status: 3 }))).toBe('DISCARD');
  });

  it('ignores the lifecycle stages — they are history, not status', () => {
    // Even with stages completed/agreed, the top-level status (0 = open) wins.
    expect(
      deriveStatus(
        baseDto({
          mitigationAgreed: true,
          earlyWarningLifecycles: [
            {
              id: 'a',
              earlyWarningId: 'ew1',
              stage: EwLifecycleStage.Close,
              status: EwLifecycleStatus.Completed,
              occurredAt: null,
              dueDate: null,
              note: null,
            },
            {
              id: 'b',
              earlyWarningId: 'ew1',
              stage: EwLifecycleStage.LinkToCE,
              status: EwLifecycleStatus.Completed,
              occurredAt: null,
              dueDate: null,
              note: null,
            },
          ],
        })
      )
    ).toBe('OPEN');
  });
});

describe('nextDueLifecycle', () => {
  it('ignores completed stages and picks the earliest outstanding due date', () => {
    const record = baseDto({
      earlyWarningLifecycles: [
        {
          id: 'a',
          earlyWarningId: 'ew1',
          stage: EwLifecycleStage.EarlyWarningMeeting,
          status: EwLifecycleStatus.Completed,
          occurredAt: null,
          dueDate: '2026-01-01',
          note: null,
        },
        {
          id: 'b',
          earlyWarningId: 'ew1',
          stage: EwLifecycleStage.LinkToCE,
          status: EwLifecycleStatus.Pending,
          occurredAt: null,
          dueDate: '2026-03-05',
          note: null,
        },
        {
          id: 'c',
          earlyWarningId: 'ew1',
          stage: EwLifecycleStage.Close,
          status: EwLifecycleStatus.Pending,
          occurredAt: null,
          dueDate: '2026-02-01',
          note: null,
        },
      ],
    });
    expect(nextDueLifecycle(record)?.dueDate).toBe('2026-02-01');
  });

  it('returns undefined when every stage is complete or undated', () => {
    expect(nextDueLifecycle(baseDto())).toBeUndefined();
  });
});

describe('isDueDateOverdue', () => {
  it('flags a past date and not a future one', () => {
    expect(isDueDateOverdue('2000-01-01')).toBe(true);
    expect(isDueDateOverdue('2999-01-01')).toBe(false);
    expect(isDueDateOverdue('not-a-date')).toBe(false);
  });
});

describe('toEarlyWarning', () => {
  it('maps the DTO onto the register row', () => {
    const ew = toEarlyWarning(baseDto());
    expect(ew).toMatchObject({
      id: 'ew1',
      reference: 'EW-001',
      title: 'Late drawings',
      source: 'Manual raise',
      raisedBy: 'Alice',
      impacts: ['DELAY'],
      status: 'OPEN',
      closed: false,
    });
  });

  it('labels email-sourced rows and closed rows accordingly', () => {
    const ew = toEarlyWarning(baseDto({ isRaisedManually: false, status: 1 }));
    expect(ew.source).toBe('From email');
    expect(ew.closed).toBe(true);
  });

  it('treats a discarded row as neither closed nor archived', () => {
    const ew = toEarlyWarning(baseDto({ status: 3 }));
    expect(ew.status).toBe('DISCARD');
    expect(ew.closed).toBe(false);
    expect(matchesRegisterTab(ew, 'DISCARDED')).toBe(true);
    expect(matchesRegisterTab(ew, 'ACTIVE')).toBe(false);
    expect(matchesRegisterTab(ew, 'ARCHIVED')).toBe(false);
  });

  it('summarises a paged response with a numeric count', () => {
    const page = toEarlyWarningListResponse({ meta: { totalCount: '3' }, items: [baseDto()] });
    expect(page.count).toBe(3);
    expect(page.items).toHaveLength(1);
  });
});

describe('register payload mapping', () => {
  const values: RegisterEarlyWarningFormValues = {
    ewReference: 'EW-009',
    raisedBy: ['pm@example.com'],
    to: ['a@x.com', 'b@x.com'],
    cc: ['c@x.com'],
    riskTitle: 'Late drawings',
    riskDescription: 'They are late',
    impactTypes: ['delay', 'cost'],
  };
  const context: RegisterEarlyWarningContext = {
    projectId: 'p1',
    projectAlertId: 'alert1',
    projectName: 'Wharf',
    projectReference: 'PRJ-1',
    attachments: [],
  };

  it('builds the PascalCase request with joined recipients and ISO date', () => {
    const request = toRegisterEarlyWarningRequest(values, context);
    expect(request).toMatchObject({
      ProjectId: 'p1',
      ProjectAlertId: 'alert1',
      Reference: 'EW-009',
      To: 'a@x.com, b@x.com',
      CC: 'c@x.com',
      BCC: '',
      Subject: 'Late drawings',
      DelayToCompletion: true,
      CostIncrease: true,
      KeyDateImpact: false,
      PerformanceImpairment: false,
    });
  });

  it('folds time and cost impact into PotentialImpacts as labeled lines', () => {
    const request = toRegisterEarlyWarningRequest(
      { ...values, timeImpact: '3-4 weeks', costImpact: 'TBC' },
      { ...context, prefillImpacts: 'Steel delay' }
    );
    expect(request.PotentialImpacts).toBe('Time impact: 3-4 weeks\nCost impact: TBC\nSteel delay');
  });

  it('passes prefill actions through to ProposedActions', () => {
    const request = toRegisterEarlyWarningRequest(values, {
      ...context,
      prefillActions: 'Chase the contractor',
    });
    expect(request.ProposedActions).toBe('Chase the contractor');
  });

  it('leaves PotentialImpacts empty when no impact inputs are set', () => {
    const request = toRegisterEarlyWarningRequest(values, context);
    expect(request.PotentialImpacts).toBe('');
  });

  it('formats the DatePicker value as YYYY-MM-DD', () => {
    const request = toRegisterEarlyWarningRequest({ ...values, dateRaised: undefined }, context);
    expect(request.DateRaised).toBe('');
  });

  it('encodes the payload as FormData with files under Attachments', () => {
    const file = new File(['bytes'], 'photo.png', { type: 'image/png' });
    const formData = toRegisterEarlyWarningFormData(values, { ...context, attachments: [file] });

    expect(formData.get('ProjectId')).toBe('p1');
    expect(formData.get('DelayToCompletion')).toBe('true');
    expect(formData.get('KeyDateImpact')).toBe('false');
    expect(formData.getAll('Attachments')).toEqual([file]);
  });
});
