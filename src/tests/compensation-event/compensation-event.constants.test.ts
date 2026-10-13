import { describe, expect, it } from 'vitest';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  COMPENSATION_EVENT_ENDPOINTS,
  COMPENSATION_EVENT_LEGACY_STATE_MAP,
  COMPENSATION_EVENT_REGISTER_STATES,
  COMPENSATION_EVENT_STATE_TONES,
  COMPENSATION_EVENT_STATUS_COLORS,
  COMPENSATION_EVENT_STATUS_LABELS,
  COMPENSATION_EVENT_STATUS_OPTIONS,
} from '@/modules/compensation-event/constants/compensation-event.constants';
import type { CompensationEventStatus } from '@/modules/compensation-event/types/compensation-event.types';

const STATUSES: CompensationEventStatus[] = [
  'DRAFT',
  'QUOTATION_TO_BE_SUBMITTED',
  'QUOTATION_SUBMITTED',
  'IMPLEMENTED',
  'REVISED_QUOTATION_TO_BE_SUBMITTED',
  'PROJECT_MANAGER_ASSESSMENT',
  'EXTENSION_OF_TIME_REQUESTED',
  'NOT_ACCEPTED',
  'DISCARDED',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'PAID',
];

describe('compensation-event constants', () => {
  it('declares module-owned endpoints', () => {
    expect(COMPENSATION_EVENT_ENDPOINTS.LIST).toBe('/api/compensation-events');
    expect(COMPENSATION_EVENT_ENDPOINTS.BY_ID).toBe('/api/compensation-events/:id');
  });

  it('covers every status with a label and a color', () => {
    for (const status of STATUSES) {
      expect(COMPENSATION_EVENT_STATUS_LABELS[status]).toEqual(expect.any(String));
      expect(COMPENSATION_EVENT_STATUS_COLORS[status]).toEqual(expect.any(String));
    }
    expect(Object.keys(COMPENSATION_EVENT_STATUS_LABELS)).toHaveLength(STATUSES.length);
    expect(Object.keys(COMPENSATION_EVENT_STATUS_COLORS)).toHaveLength(STATUSES.length);
  });

  it('covers every register state with a tone', () => {
    for (const state of COMPENSATION_EVENT_REGISTER_STATES) {
      expect(COMPENSATION_EVENT_STATE_TONES[state]).toEqual(expect.any(String));
    }
    expect(Object.keys(COMPENSATION_EVENT_STATE_TONES)).toHaveLength(
      COMPENSATION_EVENT_REGISTER_STATES.length
    );
  });

  it('folds every legacy status into a register state', () => {
    for (const state of Object.values(COMPENSATION_EVENT_LEGACY_STATE_MAP)) {
      expect(COMPENSATION_EVENT_REGISTER_STATES).toContain(state);
    }
  });

  it('derives the select options from the register states', () => {
    expect(COMPENSATION_EVENT_STATUS_OPTIONS).toEqual([
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Quotation to be submitted', value: 'QUOTATION_TO_BE_SUBMITTED' },
      { label: 'Quotation submitted', value: 'QUOTATION_SUBMITTED' },
      { label: 'Implemented', value: 'IMPLEMENTED' },
      { label: 'Revised quotation to be submitted', value: 'REVISED_QUOTATION_TO_BE_SUBMITTED' },
      { label: 'Project manager assessment', value: 'PROJECT_MANAGER_ASSESSMENT' },
      { label: 'Extension of time requested', value: 'EXTENSION_OF_TIME_REQUESTED' },
      { label: 'Not accepted', value: 'NOT_ACCEPTED' },
      { label: 'Discarded', value: 'DISCARDED' },
    ]);
  });
});
