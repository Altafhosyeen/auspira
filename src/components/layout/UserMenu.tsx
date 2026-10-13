import Link from 'next/link';
import { useAuthGuard } from '@/hooks';
import { signOutWithBackend } from '@/lib/auth/sign-out';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, MenuProps } from 'antd';
import { ChevronDown } from 'lucide-react';

const UserMenu = () => {
  // ─── HOOKS ───────────────────────────────────────────────────────────────

  const { session } = useAuthGuard();

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  const menuItems: MenuProps['items'] = [
    {
      label: (
        <Link href="/settings/profile" className="flex items-center gap-2">
          <UserOutlined />
          Profile Settings
        </Link>
      ),
      key: '0',
    },
    {
      type: 'divider',
    },
    {
      label: 'Logout',
      danger: true,
      icon: <LogoutOutlined />,
      key: '2',
      onClick: () => {
        signOutWithBackend('/login');
      },
    },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: menuItems,
      }}
    >
      <Button
        size="large"
        className="bg-theme-text-secondary! flex items-center gap-1 border-none! p-3!"
      >
        <Avatar size={24} src="https://avatars.githubusercontent.com/u/112619820?v=4" />
        {session?.user?.name}
        <ChevronDown size={16} />
      </Button>
    </Dropdown>
  );
};

export default UserMenu;
