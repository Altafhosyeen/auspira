import { describe, expect, it } from 'vitest';
import { ProjectAlertType } from '@/constants';
import { getAlertDetailHref } from '@/lib/utils/org-dashboard.utils';

describe('programme detail navigation', () => {
  it('marks an Awareness programme row with the source flag', () => {
    expect(getAlertDetailHref(ProjectAlertType.Programee, 'alert-uuid')).toBe(
      '/operational-control-agent/program-health/alert-uuid?source=Awareness'
    );
  });

  it('keeps other awareness rows on their existing screens', () => {
    expect(getAlertDetailHref(ProjectAlertType.Meeting, 'alert-uuid')).toBe(
      '/contract-control-agent/early-warning-register/risk-reduction-meeting/alert-uuid'
    );
    expect(getAlertDetailHref(ProjectAlertType.Quotation, 'alert-uuid')).toBe(
      '/contract-control-agent/compensation-event/quotation/alert-uuid'
    );
    expect(getAlertDetailHref(ProjectAlertType.EarlyWarning, 'alert-uuid')).toBe(
      '/projects/awareness/alert-uuid'
    );
  });
});
