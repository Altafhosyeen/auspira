'use client';

import { ReactNode } from 'react';
import ButtonX from '../antd/ButtonX';

type ActionButton = {
  label: string;
  onClick?: () => void;
  type?: 'primary' | 'default';
  icon?: ReactNode;
  loading?: boolean;
  danger?: boolean;
};

type Props = {
  actions: ActionButton[];
  align?: 'left' | 'center' | 'right';
};

const ActionButtons = ({ actions, align = 'center' }: Props) => {
  const justifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <div
      className={`mt-5 flex items-center gap-2 ${justifyClass} rounded-xl bg-[#FFFFFF] p-6 shadow-sm`}
    >
      {actions.map((action) => (
        <ButtonX
          key={action.label}
          type={action.type || 'default'}
          icon={action.icon}
          onClick={action.onClick}
          loading={action.loading}
          danger={action.danger}
        >
          {action.label}
        </ButtonX>
      ))}
    </div>
  );
};

export default ActionButtons;
