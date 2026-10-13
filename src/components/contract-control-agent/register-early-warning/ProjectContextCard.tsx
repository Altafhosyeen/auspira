import { DatePicker, Form } from 'antd';
import { SectionCard } from '../EarlyWarningFormControls';
import { DATE_RAISED_DISPLAY_FORMAT, EW_FORM_COPY } from '../early-warning-form.data';
import { EW_FORM_STYLES as S } from '../early-warning-form.styles';

const { sections, labels } = EW_FORM_COPY;

interface ProjectContextCardProps {
  /** Read-only — both are auto-filled from the selected project, not user-entered. */
  projectName?: string;
  projectReference?: string;
}

export const ProjectContextCard = ({ projectName, projectReference }: ProjectContextCardProps) => (
  <SectionCard title={sections.projectContext}>
    <div>
      <Form.Item label={labels.dateRaised} name="dateRaised">
        <DatePicker className="w-full" format={DATE_RAISED_DISPLAY_FORMAT} />
      </Form.Item>
    </div>

    <div className={S.row2}>
      <div>
        <label className={S.label} htmlFor="ew-reg-project-name">
          {labels.projectName}
        </label>
        <input
          id="ew-reg-project-name"
          type="text"
          value={projectName ?? ''}
          disabled
          placeholder="Auto-filled from project"
          className={S.inputDisabled}
        />
      </div>
      <div>
        <label className={S.label} htmlFor="ew-reg-contract-ref">
          {labels.contractReference}
        </label>
        <input
          id="ew-reg-contract-ref"
          type="text"
          value={projectReference ?? ''}
          disabled
          placeholder="Auto-filled from project"
          className={S.inputDisabled}
        />
      </div>
    </div>
  </SectionCard>
);
