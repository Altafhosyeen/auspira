import React from 'react';
import { Popconfirm, Typography } from 'antd';

const { Text } = Typography;

interface ExecuteStagContractSecondaryOptionsProps {
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
}

export const ExecuteStagContractSecondaryOptions: React.FC<
  ExecuteStagContractSecondaryOptionsProps
> = ({ options, selectedOptions, onToggle }) => (
  <div className="my-3">
    <Text className="ds-caption! mb-2 block font-bold! tracking-[1px] text-slate-500 uppercase">
      Secondary Options
    </Text>

    <div className="flex flex-wrap gap-1.5">
      {options.map((item) => {
        const active = selectedOptions.includes(item);
        return (
          <Popconfirm
            key={item}
            title={active ? `Remove ${item}?` : `Add ${item}?`}
            description={
              active
                ? `Remove secondary option ${item} from this contract?`
                : `Add secondary option ${item} to this contract?`
            }
            okText="Yes"
            cancelText="No"
            onConfirm={() => onToggle(item)}
          >
            <button
              type="button"
              className={`ds-caption! cursor-pointer rounded-md border px-2.5 py-1 font-medium! transition-colors select-none ${
                active
                  ? 'border-main-p bg-main-p/10 text-main-p hover:bg-main-p/15'
                  : 'border-theme-border hover:bg-surface-subtle bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {item}
            </button>
          </Popconfirm>
        );
      })}
    </div>
  </div>
);

ExecuteStagContractSecondaryOptions.displayName = 'ExecuteStagContractSecondaryOptions';
