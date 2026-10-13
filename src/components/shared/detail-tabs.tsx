'use client';

import { Button, Flex } from 'antd';
import type { ReactNode } from 'react';

export interface DetailTabConfig<TKey extends string> {
  key: TKey;
  label: string;
  icon: ReactNode;
}

export interface DetailTabsTone {
  tabBarBg: string;
  main: string;
  activeIndicator: string;
}

// The purple-to-red gradient every detail screen's active-tab indicator uses (Compensation
// Event, Early Warning, Request For Information) — the one true value for `activeIndicator`
// unless a module has an explicit reason to diverge.
export const DETAIL_TABS_ACTIVE_GRADIENT = 'linear-gradient(90deg, #6B21A8 0%, #EF4444 100%)';

interface DetailTabsProps<TKey extends string> {
  tabs: DetailTabConfig<TKey>[];
  activeKey: TKey;
  onChange: (key: TKey) => void;
  tone: DetailTabsTone;
  barHeight?: number;
  indicatorHeight?: number;
  // How much each tab holds, rendered as zero-padded text after the label, e.g. "(06)".
  // Only a count the tab actually has is shown: a key missing from the map, and an empty
  // tab, both render no count rather than a "(00)" that reads as a broken figure.
  counts?: Partial<Record<TKey, number>>;
  // Defaults to spreading tabs evenly (the existing CE/RFI/EW look). Program Health's design
  // packs tabs to the left instead, so this is opt-in rather than a default-changing prop.
  justify?: 'space-around' | 'flex-start';
}

/** Zero-padded count per the design, e.g. 6 → "(06)". */
const formatCount = (count: number) => `(${String(count).padStart(2, '0')})`;

// Presentational — the tinted tab bar with an indicator under the active tab. Shared by
// every detail screen's tab strip (Compensation Event, Request For Information, Early
// Warning) so they stay one component instead of per-module copies that can drift apart.
export const DetailTabs = <TKey extends string>({
  tabs,
  activeKey,
  onChange,
  tone,
  barHeight = 46,
  indicatorHeight = 3,
  counts,
  justify = 'space-around',
}: DetailTabsProps<TKey>) => (
  <Flex
    role="tablist"
    align="stretch"
    justify={justify}
    gap={justify === 'flex-start' ? 8 : undefined}
    style={{
      background: tone.tabBarBg,
      borderRadius: 6,
      height: barHeight,
      overflow: 'hidden',
      paddingInline: justify === 'flex-start' ? 8 : undefined,
    }}
  >
    {tabs.map(({ key, label, icon }) => {
      const count = counts?.[key];

      return (
        <Flex
          key={key}
          vertical
          justify="space-between"
          align="center"
          // Evenly split rather than sized to each label — otherwise "Overview" and
          // "Email Threads (02)" leave uneven gaps between tabs instead of equal ones.
          flex={justify === 'space-around' ? 1 : undefined}
        >
          <Button
            role="tab"
            aria-selected={key === activeKey}
            type="text"
            icon={icon}
            onClick={() => onChange(key)}
            style={{
              color: tone.main,
              fontWeight: 600,
              height: barHeight - indicatorHeight,
              width: justify === 'space-around' ? '100%' : undefined,
            }}
          >
            {label}
            {count ? ` ${formatCount(count)}` : null}
          </Button>
          <div
            style={{
              width: '100%',
              height: indicatorHeight,
              borderRadius: 99,
              background: key === activeKey ? tone.activeIndicator : 'transparent',
            }}
          />
        </Flex>
      );
    })}
  </Flex>
);
