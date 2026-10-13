import { Alert } from 'antd';

interface NoticeBannerProps {
  message?: string | null;
}

// Shared light-blue info banner, used in the same place across every module.
const NoticeBanner = ({ message }: NoticeBannerProps) => {
  if (!message?.trim()) return null;
  return <Alert type="info" message={message} />;
};

export default NoticeBanner;
