'use client';

import React from 'react';
import { type MenuProps, type DropdownProps } from 'antd';
import DropdownX from '@/components/antd/DropdownX';
import { EditOutlined } from '@ant-design/icons';

interface TableActionsProps extends Omit<DropdownProps, 'menu'> {
  /** Menu items to display in the dropdown */
  items: MenuProps['items'];
  /** Optional icon for the default button trigger */
  icon?: React.ReactNode;
  /** Optional custom trigger element */
  children?: React.ReactNode;
}

const TableActions: React.FC<TableActionsProps> = ({
  items,
  icon,
  children,
  ...dropdownProps // include all other Dropdown props
}) => {
  return (
    <DropdownX
      items={items}
      icon={icon || <EditOutlined />}
      {...dropdownProps} // pass extra dropdown props down
    >
      {children}
    </DropdownX>
  );
};

export default TableActions;
