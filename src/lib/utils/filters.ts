import {
  FilterValue,
  FilterFieldType,
  FilterRecord,
  FilterUrlOptions,
  FilterSchema,
} from '@/types/urlFilterHandler.types';

const DEFAULT_ALL_TOKEN = 'all';

const isValueActive = (value: FilterValue): boolean => {
  if (value === undefined || value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
};

const castFromString = (value: string, type: FilterFieldType): FilterValue => {
  switch (type) {
    case 'number': {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    case 'boolean':
      return value === 'true';
    case 'string':
      return value;
    default:
      return value;
  }
};

export const toFilterSearchParams = (
  filters: FilterRecord,
  options: FilterUrlOptions = {}
): URLSearchParams => {
  const params = new URLSearchParams();
  const allToken = (options.allToken ?? DEFAULT_ALL_TOKEN).trim().toLowerCase();

  Object.entries(filters).forEach(([key, rawValue]) => {
    if (!isValueActive(rawValue)) {
      return;
    }

    if (Array.isArray(rawValue)) {
      const values = rawValue
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0);

      if (values.length === 0) {
        return;
      }

      const configuredOptions = options.arrayOptions?.[key]?.map((value) => String(value));
      const selectedSet = new Set(values);
      const hasAllSelected =
        configuredOptions !== undefined &&
        configuredOptions.length > 0 &&
        configuredOptions.every((value) => selectedSet.has(value));

      params.set(key, hasAllSelected ? allToken : values.join(','));
      return;
    }

    const text = String(rawValue).trim();
    if (text.length > 0) {
      params.set(key, text);
    }
  });

  return params;
};

export const buildUrlWithFilters = (
  pathname: string,
  filters: FilterRecord,
  options: FilterUrlOptions = {}
): string => {
  const params = toFilterSearchParams(filters, options);
  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
};

export const parseFiltersFromSearchParams = (
  searchParams: URLSearchParams,
  schema: FilterSchema = {},
  options: FilterUrlOptions = {}
): FilterRecord => {
  const result: FilterRecord = {};
  const allToken = (options.allToken ?? DEFAULT_ALL_TOKEN).trim().toLowerCase();

  const keys = new Set<string>([...Array.from(searchParams.keys()), ...Object.keys(schema)]);

  keys.forEach((key) => {
    const fieldType = schema[key];
    const allValues = searchParams.getAll(key);
    if (allValues.length === 0) {
      return;
    }

    const splitValues = allValues
      .flatMap((item) => item.split(','))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (fieldType === 'string[]') {
      if (splitValues.some((value) => value.toLowerCase() === allToken)) {
        result[key] = (options.arrayOptions?.[key] ?? []).map((value) => String(value));
        return;
      }

      result[key] = splitValues;
      return;
    }

    if (fieldType === 'number[]') {
      if (splitValues.some((value) => value.toLowerCase() === allToken)) {
        result[key] = (options.arrayOptions?.[key] ?? [])
          .map((value) => Number(value))
          .filter((value) => !Number.isNaN(value));
        return;
      }

      result[key] = splitValues.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
      return;
    }

    const firstValue = allValues[0];
    if (firstValue === undefined) {
      return;
    }

    result[key] = castFromString(firstValue, fieldType ?? 'string');
  });

  return result;
};

export const getActiveFilterCount = (filters: FilterRecord): number => {
  return Object.values(filters).reduce<number>(
    (acc, value) => acc + (isValueActive(value) ? 1 : 0),
    0
  );
};

export const getFiltersBadgeCount = (values: Record<string, string | number[]>) => {
  if (!values) {
    return 0;
  }

  return Object.values(values).reduce((count, value) => {
    if ((typeof value === 'string' || Array.isArray(value)) && value.length > 0) {
      return count + 1;
    }
    return count;
  }, 0);
};

export const isEmptyFilterValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

export const cleanFilters = (values: Record<string, unknown>): Record<string, any> =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => !isEmptyFilterValue(value))
  ) as Record<string, any>;
