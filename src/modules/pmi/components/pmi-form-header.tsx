import { FileTextOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import AppPageTitle from '@/components/shared/app-page-title';
import { PMI_FORM_COPY } from '../constants/pmi-form.constants';

const copy = PMI_FORM_COPY;

// Presentational — the title bar above the Create PMI form: icon + title, plus an
// optional right-hand slot (the cross-reference origin badge). `title` overrides the
// default heading when the instruction is raised from somewhere that names itself.
const PmiFormHeader = ({ title, actions }: { title?: string; actions?: ReactNode }) => (
  <AppPageTitle icon={<FileTextOutlined />} title={title || copy.title} actions={actions} />
);

export default PmiFormHeader;
