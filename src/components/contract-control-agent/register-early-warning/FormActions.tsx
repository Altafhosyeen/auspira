import ButtonX from '@/components/antd/ButtonX';
import { EW_FORM_COPY } from '../early-warning-form.data';
import { EW_FORM_STYLES as S } from '../early-warning-form.styles';

const { actions } = EW_FORM_COPY;

/** Label stays fixed — the reference the user is typing is already visible in its own field. */
export const FormActions = ({ loading }: { loading?: boolean }) => (
  <div className={S.actionsRow}>
    <ButtonX htmlType="submit" type="primary" loading={loading}>
      {actions.register}
    </ButtonX>
  </div>
);
