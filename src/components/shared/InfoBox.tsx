import { ExclamationCircleOutlined } from '@ant-design/icons';

type Props = {
  title: string;
  description: string;
  extended_description?: string;
};

const InfoBox = ({ title, description, extended_description }: Props) => {
  return (
    <div className="mt-2 flex items-start gap-4 rounded-xl bg-[#EFF6FF] p-4">
      <ExclamationCircleOutlined className="mt-1 text-2xl text-blue-800!" />

      <div>
        <p className="text-xl font-semibold">{title}</p>
        <p className="mt-1 text-sm">{description}</p>
        <p className="text-sm">{extended_description}</p>
      </div>
    </div>
  );
};

export default InfoBox;
