import React, { createContext, useContext, useMemo, useState } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

/**
 * Accordion coordination: when SectionCards are wrapped in an <AccordionProvider>,
 * only one panel can be open at a time — opening one closes the others.
 * Without a provider, each SectionCard falls back to independent open/close.
 */
interface AccordionContextValue {
  activeKey: string | null;
  toggle: (key: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export const AccordionProvider: React.FC<{
  children: React.ReactNode;
  /** Key of the panel that should start open (defaults to none). */
  defaultActiveKey?: string | null;
}> = ({ children, defaultActiveKey = null }) => {
  const [activeKey, setActiveKey] = useState<string | null>(defaultActiveKey);

  const value = useMemo<AccordionContextValue>(
    () => ({
      activeKey,
      // Clicking the open panel closes it; clicking a closed one opens it and closes the rest.
      toggle: (key) => setActiveKey((prev) => (prev === key ? null : key)),
    }),
    [activeKey]
  );

  return <AccordionContext.Provider value={value}>{children}</AccordionContext.Provider>;
};

export interface SectionCardProps {
  number?: number;
  title: string;
  badge: string;
  children: React.ReactNode;
  /** Panels are collapsed by default; pass true to render one open (uncontrolled mode only). */
  defaultOpen?: boolean;
}

/**
 * Collapsible programme panel. Renders the numbered chip + title on the left and the
 * uppercase badge on the right as the clickable header, with the content in the body.
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  number,
  title,
  badge,
  children,
  defaultOpen = false,
}) => {
  const accordion = useContext(AccordionContext);
  // The title is unique per panel group, so it doubles as the accordion key.
  const isActive = accordion ? accordion.activeKey === title : undefined;

  return (
    <Collapse
      {...(accordion
        ? { activeKey: isActive ? ['1'] : [], onChange: () => accordion.toggle(title) }
        : { defaultActiveKey: defaultOpen ? ['1'] : [] })}
      expandIcon={({ isActive: panelActive }) => (
        <CaretRightOutlined rotate={panelActive ? 90 : 0} />
      )}
      size="small"
      className="rounded-xl! border! border-slate-200! bg-white!"
      classNames={{ header: 'py-2.5!', body: 'pt-2! pb-3!' }}
      items={[
        {
          key: '1',
          label: (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {number !== undefined && (
                  <span className="bg-main-p! ds-caption! flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold! text-white">
                    {number}
                  </span>
                )}
                <h3 className="heading-card m-0">{title}</h3>
              </div>
              <span className="ds-micro! font-semibold! tracking-wider text-slate-700 uppercase">
                {badge}
              </span>
            </div>
          ),
          children,
        },
      ]}
    />
  );
};

SectionCard.displayName = 'SectionCard';
