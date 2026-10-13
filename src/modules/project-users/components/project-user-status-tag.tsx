import { Tag } from 'antd';
import { getStatusConfig } from '@/constants/status.constant';

interface ProjectUserStatusTagProps {
  status: number;
}

const ProjectUserStatusTag = ({ status }: ProjectUserStatusTagProps) => {
  const { label, color } = getStatusConfig(status);
  return <Tag color={color}>{label}</Tag>;
};

export default ProjectUserStatusTag;
