import { FileTextOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import AppPageTitle from '@/components/shared/app-page-title';
import NoticeBanner from '@/components/shared/notice-banner';
import { EARLY_WARNING_REGISTER_FORM_COPY } from '../../constants/early-warning.constants';

const { title, clauseBadge, banner } = EARLY_WARNING_REGISTER_FORM_COPY;

interface EwFormHeaderProps {
  clauseNumber?: string | null;
  clauseTitle?: string | null;
  clauseDescription?: string | null;
  bannerMessage?: string;
}

const EwFormHeader = ({
  clauseNumber,
  clauseTitle,
  clauseDescription,
  bannerMessage,
}: EwFormHeaderProps) => {
  const num = clauseNumber
    ? clauseNumber.replace(/^(nec4\s*cl\.?\s*|cl\.?\s*)/i, '').trim()
    : undefined;

  return (
    <Flex vertical gap={16}>
      <AppPageTitle
        icon={<FileTextOutlined />}
        title={title}
        clause={
          num
            ? {
                number: num,
                title: clauseTitle || undefined,
                description: clauseDescription || undefined,
              }
            : undefined
        }
      />
      {bannerMessage && <NoticeBanner message={bannerMessage} />}
    </Flex>
  );
};

export default EwFormHeader;
