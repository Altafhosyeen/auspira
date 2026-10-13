import { getLuminance } from 'polished';

export const calculateBrightness = (hexColor: string) => {
  const r = Number.parseInt(hexColor?.slice(1, 3), 16);
  const g = Number.parseInt(hexColor?.slice(3, 5), 16);
  const b = Number.parseInt(hexColor?.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

export const getDifficultyLevelColor = (name: string) => {
  switch (name?.toLocaleLowerCase()) {
    case 'easy':
      return 'green';
    case 'medium':
      return 'orange';
    case 'hard':
      return 'red';
    default:
      return 'blue';
  }
};

export function getContrastColor(hexColor: string | undefined) {
  const luminance = getLuminance(hexColor ?? '');
  return luminance > 0.5 ? 'dark' : 'light';
}

export const getExamStatusColor = (status?: string) => {
  switch (status) {
    case 'assigned':
      return 'blue';
    case 'attempted':
      return 'cyan';
    case 'submitted':
      return 'gold';
    case 'marked':
      return 'green';
    case 'scored':
      return '#87d068';
    case 'paid':
      return 'green';
    case 'pending':
      return 'orange';
    default:
      return 'red';
  }
};

export function getColorValue(color: any): string | undefined {
  if (!color) return undefined;
  if (typeof color === 'string') return color;
  if (typeof color === 'object' && typeof color.toHexString === 'function') {
    return color.toHexString();
  }
  return undefined;
}
