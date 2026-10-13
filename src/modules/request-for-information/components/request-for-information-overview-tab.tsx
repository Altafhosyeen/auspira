import { Col, Row } from 'antd';
import type { RequestForInformation } from '../types/request-for-information.types';
import RequestForInformationLifecycle from './request-for-information-lifecycle';
import RequestForInformationOverviewPanel from './request-for-information-overview-panel';

interface RequestForInformationOverviewTabProps {
  rfi: RequestForInformation;
}

// Presentational — the Overview tab: the Event Summary card beside the Lifecycle rail —
// same layout as the Compensation Event detail's Overview tab.
const RequestForInformationOverviewTab = ({ rfi }: RequestForInformationOverviewTabProps) => (
  <Row gutter={[20, 20]}>
    <Col xs={24} lg={16}>
      <RequestForInformationOverviewPanel rfi={rfi} />
    </Col>
    <Col xs={24} lg={8}>
      <RequestForInformationLifecycle rfi={rfi} />
    </Col>
  </Row>
);

export default RequestForInformationOverviewTab;
