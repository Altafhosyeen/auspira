'use client';

import { FileTextOutlined } from '@ant-design/icons';
import AppPageTitle from '@/components/shared/app-page-title';
import { REQUEST_FOR_INFORMATION_FORM_COPY } from '../constants/request-for-information.constants';

// Presentational — the title bar above the Create RFI form.
const RequestForInformationFormHeader = () => (
  <AppPageTitle icon={<FileTextOutlined />} title={REQUEST_FOR_INFORMATION_FORM_COPY.title} />
);

export default RequestForInformationFormHeader;
