export type FilterPrimitive = string | number | boolean;
export type FilterValue = FilterPrimitive | FilterPrimitive[] | null | undefined;
export type FilterRecord = Record<string, FilterValue>;
export type FilterArrayOptions = Record<string, FilterPrimitive[]>;

export type FilterFieldType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]';
export type FilterSchema = Record<string, FilterFieldType>;

export type FilterUrlOptions = {
  arrayOptions?: FilterArrayOptions;
  allToken?: string;
};
