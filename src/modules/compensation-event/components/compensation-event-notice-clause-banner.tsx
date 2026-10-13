import { Card, Typography } from 'antd';
import { COMPENSATION_EVENT_NOTICE_COPY } from '../constants/compensation-event-notice.constants';
import { NOTICE_COLORS } from '../constants/compensation-event-notice.theme';

interface CompensationEventNoticeClauseBannerProps {
  /** Each workflow screen banners its own clause copy; the notice text is the default. */
  text?: string;
}

const CompensationEventNoticeClauseBanner = ({
  text = COMPENSATION_EVENT_NOTICE_COPY.banner,
}: CompensationEventNoticeClauseBannerProps) => (
  <Card
    style={{ backgroundColor: NOTICE_COLORS.mainSoft, borderColor: NOTICE_COLORS.bannerBorder }}
    styles={{ body: { padding: '16px 22px' } }}
  >
    <Typography.Text>{text}</Typography.Text>
  </Card>
);

export default CompensationEventNoticeClauseBanner;
