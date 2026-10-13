import { describe, expect, it } from 'vitest';
import { ProjectAlertType } from '@/constants';
import type { ImpactAssessmentDetail, ProjectAlert } from '@/hooks/modules/project-alerts';
import { toAssessmentView } from '@/modules/awareness/utils/awareness-assessment.utils';

// The signal from the live payload: an Early Warning whose impact assessment carries the three
// free-text findings and leaves all four boolean flags unset.
const alert = (overrides: Partial<ProjectAlert> = {}): ProjectAlert =>
  ({
    id: 'alert-1',
    alertType: ProjectAlertType.EarlyWarning,
    title: 'Potential Delay Due to Ground Conditions',
    description:
      'The piling rig work took longer than expected because of unforeseen ground conditions, potentially affecting the schedule.',
    summary:
      'The email states the piling rig work was originally scheduled to finish by the 10th of last month but took longer due to ground conditions.',
    clauseNumber: '15.1',
    ...overrides,
  }) as ProjectAlert;

const impact = (overrides: Partial<ImpactAssessmentDetail> = {}): ImpactAssessmentDetail => ({
  potentialImpacts: 'Possible delay to piling completion and subsequent activities',
  keyDatesAffected: 'Potential delay to piling completion date',
  proposedActions: 'Monitor progress closely and assess impact on overall schedule',
  impactTypes: [],
  ...overrides,
});

describe('toAssessmentView', () => {
  it("states the extractor's own findings rather than a fixed set of bullets", () => {
    const view = toAssessmentView(alert(), impact());

    expect(view?.paragraphs).toEqual([
      'The email states the piling rig work was originally scheduled to finish by the 10th of last month but took longer due to ground conditions.',
    ]);
    expect(view?.findings).toEqual([
      {
        label: 'Potential impacts',
        value: 'Possible delay to piling completion and subsequent activities',
      },
      { label: 'Key dates affected', value: 'Potential delay to piling completion date' },
      {
        label: 'Proposed actions',
        value: 'Monitor progress closely and assess impact on overall schedule',
      },
    ]);
  });

  it('falls back to the description when the extractor sent no precis', () => {
    const view = toAssessmentView(alert({ summary: null }), impact());

    expect(view?.paragraphs[0]).toBe(
      'The piling rig work took longer than expected because of unforeseen ground conditions, potentially affecting the schedule.'
    );
  });

  it('leaves out a finding the extractor did not fill in', () => {
    const view = toAssessmentView(alert(), impact({ keyDatesAffected: '   ' }));

    expect(view?.findings.map((finding) => finding.label)).toEqual([
      'Potential impacts',
      'Proposed actions',
    ]);
  });

  it('still assesses a signal with no impact assessment at all', () => {
    const view = toAssessmentView(alert(), null);

    expect(view?.paragraphs).toHaveLength(1);
    expect(view?.findings).toEqual([]);
  });

  it('drops the section entirely when there is nothing to assess', () => {
    expect(toAssessmentView(alert({ summary: null, description: null }), null)).toBeNull();
    expect(
      toAssessmentView(
        alert({ summary: null, description: null }),
        impact({ potentialImpacts: '' })
      )
    ).not.toBeNull();
  });
  it('cites the clause the alert was raised under rather than a literal 15.1', () => {
    expect(toAssessmentView(alert(), impact())?.note).toBe(
      'Note: Auspira cannot confirm this is a valid Early Warning under Clause 15.1 — that is a contractual decision for you as PM.'
    );
    expect(toAssessmentView(alert({ clauseNumber: '61.3' }), impact())?.note).toContain(
      'under Clause 61.3'
    );
  });

  it('leaves the clause out of the caveat when the alert names none', () => {
    expect(toAssessmentView(alert({ clauseNumber: null }), impact())?.note).toBe(
      'Note: Auspira cannot confirm this is a valid Early Warning — that is a contractual decision for you as PM.'
    );
  });

  it('reserves the Early Warning caveat for Early Warnings', () => {
    expect(
      toAssessmentView(alert({ alertType: ProjectAlertType.DefectNotice }), impact())?.note
    ).toBe(
      'Note: this is Auspira’s reading of the signal, not a contractual decision — that stays with you as PM.'
    );
  });

  it('assesses every type the signal screen handles, not just Early Warnings', () => {
    for (const alertType of [
      ProjectAlertType.DefectNotice,
      ProjectAlertType.DailySiteReport,
      ProjectAlertType.Programee,
      ProjectAlertType.PMI,
    ]) {
      expect(toAssessmentView(alert({ alertType }), impact())?.findings).toHaveLength(3);
    }
  });
});
