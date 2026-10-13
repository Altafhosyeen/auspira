'use client';
import { Card, type CardProps } from 'antd';
import React, { ReactNode } from 'react';

interface Props extends CardProps {
  desc?: string;
  titleIcon?: React.ReactNode | string;
  action?: ReactNode; // Changed from Action to action (lowercase for consistency)
}

function CardX({ className, action, children, title, desc, titleIcon, ...props }: Props) {
  const renderIcon = () => {
    if (!titleIcon) return null;

    if (typeof titleIcon === 'string') {
      return <img src={titleIcon} alt="title-icon" className="h-5 w-5 object-contain" />;
    }
    return <span className="flex items-center">{titleIcon}</span>;
  };

  const renderTitle = () => {
    if (!title && !titleIcon) return null;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderIcon()}
            {title && (
              <span className={`text-[20px] leading-7 font-semibold ${titleIcon ? '-mt-0.5' : ''}`}>
                {title}
              </span>
            )}
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
        {desc && <p className="mb-2 text-xs text-wrap text-[#666666]">{desc}</p>}
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col gap-y-2">
      <Card
        className={`w-full rounded-xl! p-2! shadow-none! ${className || ''}`}
        title={renderTitle()}
        {...props}
      >
        {children}
      </Card>
    </div>
  );
}

export default CardX;
