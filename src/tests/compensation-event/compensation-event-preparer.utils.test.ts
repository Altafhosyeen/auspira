import { describe, expect, it } from 'vitest';
// Deep import: the module barrel pulls in services/hooks, which drag .tsx files
// into the graph that rolldown-vite cannot parse in vitest yet.
import {
  buildQuotationSubmittedBy,
  resolvePreparedByName,
} from '@/modules/compensation-event/utils/compensation-event-preparer.utils';

const SUBMITTED_AT = '2026-08-01T09:00:00Z';

describe('buildQuotationSubmittedBy', () => {
  it('splits the register\'s "Name, Role" form into its two columns', () => {
    expect(
      buildQuotationSubmittedBy('q1', 'J. Whitfield, Contracts Manager', SUBMITTED_AT)
    ).toEqual([
      { id: 'q1', name: 'J. Whitfield', role: 'Contracts Manager', submittedAt: SUBMITTED_AT },
    ]);
  });

  it('decodes the rows the extractor writes as JSON', () => {
    const encoded = '[{"Name": "Altaf Hussain", "Role": "Project Team"}]';

    expect(buildQuotationSubmittedBy('q1', encoded, SUBMITTED_AT)).toEqual([
      { id: 'q1-0', name: 'Altaf Hussain', role: 'Project Team', submittedAt: SUBMITTED_AT },
    ]);
  });

  // The bug this guards: "[]" is not plain text, so it must never reach the
  // "Name, Role" branch and be drawn as a person called "[]".
  it.each(['[]', '[{}]', '[{"name": ""}]', '{}'])(
    'draws no row for the empty encoding %s',
    (preparedBy) => {
      expect(buildQuotationSubmittedBy('q1', preparedBy, SUBMITTED_AT)).toEqual([]);
    }
  );

  it.each(['', '   ', '-', ',', undefined, null])(
    'draws no row when the field carries no name (%s)',
    (preparedBy) => {
      expect(buildQuotationSubmittedBy('q1', preparedBy, SUBMITTED_AT)).toEqual([]);
    }
  );

  it('keeps only the named rows out of a mixed payload', () => {
    const rows = buildQuotationSubmittedBy(
      'q1',
      [{ name: 'Sarah Price', role: 'Contractor' }, { name: '' }, { name: '[]' }],
      SUBMITTED_AT
    );

    expect(rows).toEqual([
      { id: 'q1-0', name: 'Sarah Price', role: 'Contractor', submittedAt: SUBMITTED_AT },
    ]);
  });
});

describe('resolvePreparedByName', () => {
  it('keeps only the name out of the register form', () => {
    expect(resolvePreparedByName('J. Whitfield, Contracts Manager')).toBe('J. Whitfield');
  });

  it('joins the names the extractor encoded', () => {
    expect(resolvePreparedByName('[{"name": "A. Hussain"}, {"name": "S. Price"}]')).toBe(
      'A. Hussain, S. Price'
    );
  });

  it.each(['[]', '[{}]', '-', '', undefined, null])(
    'names nobody when the field carries no name (%s)',
    (preparedBy) => {
      expect(resolvePreparedByName(preparedBy)).toBeUndefined();
    }
  );
});
