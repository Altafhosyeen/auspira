import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface KpiItem {
  key: string;
  label: string;
  count: number;
  valueClassName: string;
  icon: LucideIcon;
  /** Icon-box tone, e.g. `{ bg: 'bg-red-50', fg: 'text-red-500' }`. */
  iconBg: string;
  iconFg: string;
}

interface ContractKpiRowProps {
  items: KpiItem[];
  activeKey: string | null;
  onSelect: (key: string | null) => void;
}

export const ContractKpiRow: React.FC<ContractKpiRowProps> = ({ items, activeKey, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    {items.map((item) => {
      const isActive = activeKey === item.key;
      const Icon = item.icon;
      return (
        <button
          key={item.key}
          onClick={() => onSelect(isActive ? null : item.key)}
          className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-xs transition-all ${
            isActive
              ? 'border-slate-400 ring-2 ring-slate-100'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${item.iconFg}`} />
          </span>
          <span className="min-w-0">
            <span className="ds-caption! block font-medium! text-slate-700">{item.label}</span>
            <span className={`ds-heading-2! block ${item.valueClassName}`}>{item.count}</span>
          </span>
        </button>
      );
    })}
  </div>
);

ContractKpiRow.displayName = 'ContractKpiRow';
