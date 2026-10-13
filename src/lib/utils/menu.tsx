import { MenuItem } from '@/types';
import Link from 'next/link';

// convert arbitrary item-like object into Antd MenuItem recursively
export const getMenuItem = ({
  label,
  key,
  icon,
  children,
}: {
  label: React.ReactNode;
  key: React.Key;
  icon?: React.ReactNode;
  // routes pass IRoute[] but we transform them internally
  children?: any[];
}): MenuItem => {
  const mappedChildren: MenuItem[] | undefined =
    children && Array.isArray(children) ? children.map((child) => getMenuItem(child)) : undefined;

  return {
    key,
    icon,
    children: mappedChildren,
    label,
  } as MenuItem;
};

export const getLink = ({ path, label }: { path?: string; label: string }): React.ReactNode => {
  return <Link href={path ?? ''}>{label}</Link>;
};
