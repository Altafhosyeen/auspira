'use client';

import { SkinOutlined } from '@ant-design/icons';
import { Button, Flex, Popover, Select, Typography } from 'antd';
import { useUISettings } from '@/store/ui-settings.store';

// Header entry: user UI preferences (component size, border radius, font family)
// for the new modules — the store feeds straight into the module ConfigProviders.
const ThemeCustomizer = () => {
  const settings = useUISettings();
  const setSettings = useUISettings((state) => state.setSettings);

  const panel = (
    <Flex vertical gap={10} style={{ width: 220 }}>
      <Flex vertical gap={4}>
        <Typography.Text style={{ fontSize: 12 }}>Component size</Typography.Text>
        <Select
          size="small"
          value={settings.size}
          onChange={(size) => setSettings({ size })}
          options={[
            { label: 'Compact', value: 'small' },
            { label: 'Comfortable', value: 'medium' },
            { label: 'Large', value: 'large' },
          ]}
        />
      </Flex>

      <Flex vertical gap={4}>
        <Typography.Text style={{ fontSize: 12 }}>Border radius</Typography.Text>
        <Select
          size="small"
          value={settings.radius}
          onChange={(radius) => setSettings({ radius })}
          options={[
            { label: 'Square', value: 'square' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ]}
        />
      </Flex>

      <Flex vertical gap={4}>
        <Typography.Text style={{ fontSize: 12 }}>Font family</Typography.Text>
        <Select
          size="small"
          value={settings.font}
          onChange={(font) => setSettings({ font })}
          options={[
            { label: 'System', value: 'system' },
            { label: 'Inter', value: 'inter' },
            { label: 'Geist', value: 'geist' },
          ]}
        />
      </Flex>

      <Button
        size="small"
        onClick={() => setSettings({ size: 'medium', radius: 'medium', font: 'inter' })}
      >
        Reset to defaults
      </Button>
    </Flex>
  );

  return (
    <Popover content={panel} trigger="click" placement="bottomRight" title="UI settings">
      <Button
        type="text"
        className="flex h-10 w-10 items-center justify-center rounded-full p-0! text-gray-600 transition-all duration-300 hover:bg-gray-200 hover:text-gray-900"
        aria-label="UI settings"
        icon={<SkinOutlined className="text-lg" />}
      />
    </Popover>
  );
};

export default ThemeCustomizer;
