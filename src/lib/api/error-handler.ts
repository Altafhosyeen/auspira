import { notification } from 'antd';
import type { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/constants';
import { getCleanUrl } from '../utils/urls';

const shownToastKeys = new Set<string>();

/**
 * Show notification only once per key
 */
const showToastOnce = (key: string, message: string): void => {
  if (typeof window === 'undefined') return;
  if (shownToastKeys.has(key)) return;

  shownToastKeys.add(key);

  notification.error({
    message,
    placement: 'topRight',
    style: {
      whiteSpace: 'pre-line', // keep multi-line format
    },
  });

  setTimeout(() => {
    shownToastKeys.delete(key);
  }, 3000);
};

/**
 * Normalize API response safely
 */
const normalize = (data: unknown): Record<string, any> | null => {
  if (!data) return null;

  if (Array.isArray(data)) {
    const first = data[0];
    return first && typeof first === 'object' ? (first as Record<string, any>) : null;
  }

  if (typeof data === 'object') {
    return data as Record<string, any>;
  }

  return null;
};

/**
 * Extract error message
 */
const pickMessage = (data: Record<string, any> | null): string => {
  if (!data) return 'Error';

  const msg = data.message ?? data.Message ?? data.description ?? data.Description;

  return typeof msg === 'string' && msg.trim() ? msg : 'Error';
};

/**
 * Extract error code
 */
const pickCode = (data: Record<string, any> | null): string | null => {
  if (!data) return null;

  const code = data.code ?? data.Code;

  if (typeof code !== 'string') return null;

  return code.trim() || null;
};

/**
 * Format error:
 * Line 1 = code
 * Line 2 = message
 */
const formatError = (data: Record<string, any> | null): string => {
  const code = pickCode(data);
  const message = pickMessage(data);

  if (code) {
    return `${code}\n${message}`;
  }

  return message;
};

/**
 * GLOBAL API ERROR HANDLER
 */
export const handleApiError = (error: unknown): void => {
  const axiosError = error as AxiosError;

  // IMPORTANT FIX:
  // use response.data (NOT responseText)
  const rawData = axiosError?.response?.data;

  const status = axiosError?.response?.status;
  const requestPath = getCleanUrl(axiosError?.config?.url ?? '');
  const verifyCompanyHousePath = getCleanUrl(API_ENDPOINTS.ORGANIZATION.VERIFY_COMPANY_HOUSE);

  // Company house conflict (409) is handled inline on the form; avoid duplicate global toast.
  if (status === 409 && requestPath.startsWith(verifyCompanyHousePath)) {
    return;
  }

  // A compensation event with no final quotation yet 404s here by design (see the
  // endpoint's own Swagger description) — that is normal, not an error, so the
  // Financials tab silently falls back rather than alarming the user with a toast.
  if (status === 404 && /^api\/compensation-events\/[^/]+\/financial\/$/.test(requestPath)) {
    return;
  }

  // GET /api/programme/{id} backs the Program Health detail's register entry path, which renders
  // its own 404 result for an id it cannot resolve (a stale bookmark, or an alert id opened
  // without the Awareness source flag) — so the toast would only repeat what the screen already
  // says. The named routes under the same prefix are excluded, so a 404 from those still reports.
  if (
    status === 404 &&
    /^api\/programme\/(?!accept$|project$|comparison$)[^/]+$/.test(requestPath)
  ) {
    return;
  }

  const data = normalize(rawData);

  const finalMessage = formatError(data);

  /**
   * STRONG DEDUPE KEY (prevents double toast)
   */
  const dedupeKey = `${status ?? 'na'}:${finalMessage}`;

  showToastOnce(dedupeKey, finalMessage);
};
