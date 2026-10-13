'use client';

import { FileTextOutlined } from '@ant-design/icons';
import AppPageTitle from '@/components/shared/app-page-title';
import { DEFECT_NOTICE_FORM_COPY } from '../constants/defect-notice.constants';

// Presentational — the title bar above the Create Defect Notice form.
const DefectNoticeFormHeader = () => (
  <AppPageTitle
    icon={<FileTextOutlined />}
    title={DEFECT_NOTICE_FORM_COPY.title}
    clause={{ label: DEFECT_NOTICE_FORM_COPY.contractTag }}
  />
);

export default DefectNoticeFormHeader;
