import { MainOption } from '@/types/project/create.types';

export const DEFAULT_SELECTED_OPTION: MainOption = 'E';

// Full NEC4 ECC secondary Option clauses, in contract order. `Z` is intentionally
// omitted — additional Z-clauses are handled by the dedicated Z-clauses section below.
export const SECONDARY_OPTIONS = [
  // W — dispute resolution
  'W1',
  'W2',
  'W3',
  // X — main secondary options
  'X1',
  'X2',
  'X3',
  'X4',
  'X5',
  'X6',
  'X7',
  'X8',
  'X9',
  'X10',
  'X11',
  'X12',
  'X13',
  'X14',
  'X15',
  'X16',
  'X17',
  'X18',
  'X19',
  'X20',
  'X21',
  'X22',
  // Y(UK) — UK-specific options
  'Y(UK)1',
  'Y(UK)2',
  'Y(UK)3',
];

export const DETECTED_CLAUSE_REFERENCES = ['10.1', '11.2', '13.3'];
