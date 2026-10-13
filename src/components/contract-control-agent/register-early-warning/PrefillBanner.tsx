import { CheckCircleFilled } from '@ant-design/icons';
import { EW_FORM_COPY } from '../early-warning-form.data';
import { EW_FORM_STYLES as S } from '../early-warning-form.styles';

const { banner } = EW_FORM_COPY;

export const PrefillBanner = () => (
  <div className={S.bannerWrap}>
    <CheckCircleFilled className={S.bannerIcon} />
    <div className={S.bannerText}>{banner}</div>
  </div>
);
