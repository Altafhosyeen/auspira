/**
 * Main Option Selector
 * Component for selecting contract main option (A-F)
 */

import React from 'react';
import { Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { MAIN_OPTIONS } from '@/constants/project.constants';
import { MainOption } from '@/types/project/create.types';

const { Text } = Typography;

interface MainOptionSelectorProps {
  selectedOption: MainOption | null;
  onSelect: (option: MainOption) => void;
  variant?: 'compact' | 'card';
  showDescriptionsAsTooltip?: boolean;
}

export const MainOptionSelector: React.FC<MainOptionSelectorProps> = ({
  selectedOption,
  onSelect,
  variant = 'compact',
  showDescriptionsAsTooltip = false,
}) => {
  const gridClassName =
    variant === 'card'
      ? 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
      : 'grid grid-cols-1 gap-2 md:grid-cols-3';

  return (
    <div className={gridClassName}>
      {MAIN_OPTIONS.map((opt) => {
        const isSelected = selectedOption === opt.id;

        const button = (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={
              variant === 'card'
                ? `group rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-main-p bg-main-p/5 shadow-sm'
                      : 'border-theme-border hover:border-main-p/40 hover:bg-main-p/5 bg-white'
                  }`
                : `ds-body! flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-main-p bg-main-p/10 text-main-p shadow-sm'
                      : 'hover:border-main-p/40 hover:bg-main-p/5 border-gray-200 text-gray-700'
                  }`
            }
          >
            {variant === 'card' ? (
              <div className="flex items-start gap-3">
                <div
                  className={`ds-caption! flex h-6 w-6 items-center justify-center rounded-md font-bold! ${
                    isSelected ? 'bg-main-p text-white' : 'bg-main-p/10 text-slate-600'
                  }`}
                >
                  {opt.id}
                </div>

                <div>
                  <Text
                    className={`ds-body! block font-medium! ${
                      isSelected ? 'text-main-p' : 'text-text'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </div>

                {opt.description && (
                  <Tooltip title={opt.description} placement="top">
                    <InfoCircleOutlined
                      className={`mt-0.5 shrink-0 cursor-help transition-colors ${
                        isSelected ? 'text-main-p' : 'hover:text-main-p text-gray-400'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Tooltip>
                )}
              </div>
            ) : (
              <>
                <span
                  className={`ds-caption! flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold! transition-colors ${
                    isSelected ? 'bg-main-p text-white' : 'bg-main-p/10 text-main-p'
                  }`}
                >
                  {opt.id}
                </span>
                <span>{opt.label}</span>
                {opt.description && (
                  <Tooltip title={opt.description} placement="top">
                    <InfoCircleOutlined
                      className={`shrink-0 cursor-help transition-colors ${
                        isSelected ? 'text-main-p' : 'hover:text-main-p text-gray-400'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Tooltip>
                )}
              </>
            )}
          </button>
        );

        if (showDescriptionsAsTooltip && opt.description) {
          return (
            <Tooltip key={opt.id} title={opt.description} placement="top">
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </div>
  );
};

MainOptionSelector.displayName = 'MainOptionSelector';
