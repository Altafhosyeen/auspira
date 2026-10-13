import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Radio } from 'antd';

const ModeCard = ({
  title,
  desc,
  features,
  value,
  selected,
  onChange,
  recommended,
}: {
  title?: string;
  desc?: string;
  features?: { type: 'good' | 'bad'; text: string }[];
  value?: string;
  selected?: boolean;
  onChange?: (value: string) => void;
  recommended?: boolean;
}) => (
  <div
    onClick={() => onChange?.(value || '')}
    className={`relative cursor-pointer rounded-2xl border p-6 transition-all ${
      selected ? 'border-blue-600 bg-white shadow-md' : 'border-gray-200 bg-white hover:shadow-sm'
    }`}
  >
    {recommended && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-700 px-3 py-1 text-xs text-white">
        Recommended
      </span>
    )}

    <div className="mb-4 flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
        âš™ï¸
      </div>
      <Radio checked={selected} />
    </div>

    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{desc}</p>

    <div className="mt-4 space-y-2 text-sm">
      {features?.map((f) => (
        <div key={f.text} className="flex items-center gap-2">
          {f.type === 'good' ? (
            <CheckOutlined className="text-blue-600" />
          ) : (
            <CloseOutlined className="text-gray-400" />
          )}
          <span className="text-gray-600">{f.text}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ModeCard;
