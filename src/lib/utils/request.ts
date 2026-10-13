import { INormalizedListData, IPaginatedResponse } from '@/types';

type TQueryParams = Record<string, string | number | boolean | undefined | null>;

/**
 * Build a full URL with optional query parameters
 * @param baseUrl - Base endpoint URL
 * @param params - Optional query parameters
 * @returns Full URL with query string
 */
export const buildUrl = <T extends TQueryParams = TQueryParams>(
  baseUrl: string,
  params?: T
): string => {
  if (!params) return baseUrl;

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Type guard
function isPaginatedResponse<T>(
  payload: IPaginatedResponse<T> | T[]
): payload is IPaginatedResponse<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    !Array.isArray(payload) &&
    'results' in payload
  );
}

// Main function (pure TS-safe)
export function normalizePaginatedResponse<T>(
  payload: IPaginatedResponse<T> | T[]
): INormalizedListData<T> {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload,
    };
  }

  if (isPaginatedResponse(payload)) {
    return {
      count: payload.count ?? 0,
      next: payload.next ?? null,
      previous: payload.previous ?? null,
      results: Array.isArray(payload.results) ? payload.results : [],
    };
  }

  // fallback safety (never breaks UI)
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}
