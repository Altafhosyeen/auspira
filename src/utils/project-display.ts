import type { CSSProperties } from 'react';

import { Status } from '@/constants/status.constant';

export interface ProjectClassification {
  id: number;
  code: string;
  label: string;
}

export interface ProjectNecTagConfig {
  label: string;
  className: string;
  style?: CSSProperties;
}

// Mirrors the backend's `NECForm` enum exactly — ids are the enum's own numeric values,
// not a display order, so they must stay in lockstep with that definition.
export const documentClassifications: ProjectClassification[] = [
  {
    id: 0,
    code: 'ECC',
    label: 'ECC Contractor',
  },
  {
    id: 1,
    code: 'ECC',
    label: 'ECC Client',
  },
  {
    id: 2,
    code: 'ECS',
    label: 'ECS — Engineering and Construction Subcontract',
  },
  {
    id: 3,
    code: 'ECSC',
    label: 'ECSC — Engineering and Construction Short Contract',
  },
  {
    id: 4,
    code: 'PSC',
    label: 'PSC — Professional Service Contract',
  },
  {
    id: 5,
    code: 'TSC',
    label: 'TSC — Term Service Contract',
  },
  {
    id: 6,
    code: 'DBOC',
    label: 'DBOC — Design Build and Operate Contract',
  },
  {
    id: 7,
    code: 'FMC',
    label: 'FMC — Facilities Management Contract',
  },
  {
    id: 8,
    code: 'SC',
    label: 'SC — Supply Contract',
  },
  {
    id: 9,
    code: 'AC',
    label: 'AC — Alliance Contract',
  },
];

// High-contrast, dynamic color presets matching Ant Design enterprise styles
const tagStylesMap: Record<number, { label?: string; style: CSSProperties }> = {
  0: {
    label: 'NEC4 ECC', // Keep user-defined custom labels
    style: { color: '#096dd9', background: '#e6f7ff' },
  },
  1: {
    label: 'NEC4 ECC', // Keep user-defined custom labels
    style: { color: '#096dd9', background: '#e6f7ff' },
  },
  2: {
    label: 'NEC3 ECS', // Keep user-defined custom labels
    style: { color: '#b25900', background: '#ffeec2' },
  },
  3: {
    style: { color: '#006d75', background: '#e6fffb' },
  }, // ECSC (Cyan/Teal)
  4: {
    style: { color: '#531dab', background: '#f9f0ff' },
  }, // PSC (Purple)
  5: {
    style: { color: '#c41d7f', background: '#fff0f6' },
  }, // TSC (Magenta)
  6: {
    style: { color: '#d4380d', background: '#fff2e8' },
  }, // DBOC (Volcano/Orange-red)
  7: {
    style: { color: '#389e0d', background: '#f6ffed' },
  }, // FMC (Green)
  8: {
    style: { color: '#7ea100', background: '#fcffe6' },
  }, // SC (Lime)
  9: {
    style: { color: '#1d39c4', background: '#f0f5ff' },
  }, // AC (Geekblue)
};

export const getProjectNecTagConfig = (
  necForm: number | string | null | undefined
): ProjectNecTagConfig | null => {
  const normalizedNecForm = typeof necForm === 'string' ? necForm.trim() : necForm;

  const classification = documentClassifications.find(
    (item) => item.id === normalizedNecForm || item.code === String(normalizedNecForm)
  );

  if (!classification) {
    return null;
  }

  const customConfig = tagStylesMap[classification.id];

  return {
    // Falls back to the standard classification code (e.g. "ECSC") if no custom label is set
    label: customConfig?.label ?? classification.code,
    className: 'm-0! rounded-[4px] px-2 text-xs font-semibold',
    style: customConfig?.style,
  };
};

export const getProjectClassificationLabel = (
  necForm: number | string | null | undefined
): string => {
  const normalizedNecForm = typeof necForm === 'string' ? necForm.trim() : necForm;

  return (
    documentClassifications.find(
      (item) => item.id === normalizedNecForm || item.code === String(normalizedNecForm)
    )?.label ?? String(necForm)
  );
};

export const isProjectActive = (status?: number | string | null) =>
  Number(status) === Status.Active;
