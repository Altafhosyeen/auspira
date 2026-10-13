'use client';
import React from 'react';
import { Dropdown, Button, type MenuProps, type DropdownProps } from 'antd';

interface DropdownXProps extends Omit<DropdownProps, 'menu'> {
  /** Menu items to display in the dropdown */
  items: MenuProps['items'];
  /** Optional icon for the default button trigger */
  icon?: React.ReactNode;
  /** Optional label for the default button trigger */
  label?: string;
  /** Optional props for the default button trigger */
  buttonProps?: React.ComponentProps<typeof Button>;
  /** If provided, will be used as the trigger instead of the default button */
  children?: React.ReactNode;
}

const DropdownX: React.FC<DropdownXProps> = ({
  items,

  children,
  ...dropdownProps // allows full Dropdown API extension
}) => {
  return (
    <Dropdown
      menu={{ items }}
      {...dropdownProps} // extend props like placement, trigger, etc.
    >
      {
        children && children // use custom trigger if provided
      }
    </Dropdown>
  );
};

export default DropdownX;
