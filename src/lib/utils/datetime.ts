import dayjs, { type Dayjs } from 'dayjs';

/* ─── Backend timestamp normalisation ───────────────────────────────────────
 *
 * Backend timestamps are UTC instants, but the API does not consistently say so: .NET serialises
 * a `DateTime` whose `Kind` is `Unspecified` with no timezone designator at all
 * ("2026-08-27T00:55:00"), while other endpoints return properly stamped values
 * ("2026-08-27T00:55:00Z" / "+00:00").
 *
 * Both `new Date()` and `dayjs()` read the *unstamped* form as LOCAL time, so a UTC instant
 * renders unshifted — the same wall-clock reading in every timezone instead of the viewer's own.
 * Everything that displays a backend timestamp therefore parses it through the helpers below
 * rather than handing the raw string to `new Date()` / `dayjs()`.
 */

/** A bare calendar date, e.g. "2026-08-27". */
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** A date-time carrying no "Z" and no "±HH:mm" offset, e.g. "2026-08-27T00:55:00.123". */
const OFFSETLESS_DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

/**
 * Makes a backend timestamp unambiguous before it is parsed. Values that already carry an offset
 * pass through untouched, so this is a no-op wherever the backend gets it right.
 */
export const normalizeBackendTimestamp = (value: string): string => {
  const trimmed = value.trim();
  // A bare date is a calendar date, not an instant. `new Date('2026-08-27')` reads the date-only
  // form as UTC midnight, which renders as the 26th anywhere west of Greenwich — pin it to local
  // midnight instead so the date displayed is the date that was sent.
  if (DATE_ONLY_RE.test(trimmed)) return `${trimmed}T00:00:00`;
  // A date-time with no designator is a UTC instant the backend simply did not stamp.
  if (OFFSETLESS_DATETIME_RE.test(trimmed)) return `${trimmed.replace(' ', 'T')}Z`;
  return trimmed;
};

/** Backend timestamp → `Date` in the viewer's timezone. `null` when missing or unparseable. */
export const parseBackendDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(normalizeBackendTimestamp(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Backend timestamp → `Dayjs` in the viewer's timezone. Drop-in for `dayjs(value)`: a missing or
 * unparseable value yields an invalid Dayjs (never "now"), same as `dayjs(null)`.
 */
export const toLocalDayjs = (value?: string | null): Dayjs =>
  dayjs(value ? normalizeBackendTimestamp(value) : null);

export const formatDateTimeToUTC = (
  date: string | undefined | null,
  showTime: boolean = true,
  showTimeOnly: boolean = false
) => {
  const dateTime = parseBackendDate(date);
  if (!dateTime) return 'N/A';

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
  };

  if (showTimeOnly) {
    return dateTime.toLocaleTimeString('en-US', timeOptions);
  }

  return `${dateTime.toLocaleDateString('en-US', dateOptions)} ${
    showTime ? dateTime.toLocaleTimeString('en-US', timeOptions) : ''
  }`;
};

/** ISO date/time string → "05 Aug 2026" in the browser's local timezone (en-GB). */
export const formatLocalDate = (value?: string | null) => {
  if (!value) return '';
  const date = parseBackendDate(value);
  if (!date) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDate = (date: string | undefined) => {
  const parsed = parseBackendDate(date);
  if (!parsed) return 'N/A';
  const dateOptions = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return dateOptions.format(parsed);
};

export const formatMoney = (amount: number, currencyISOCode: string, decimals: number = 0) => {
  if (!currencyISOCode) return 'N/A';
  if (!amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyISOCode,
    }).format(0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyISOCode,
    minimumFractionDigits: decimals,
  }).format(amount);
};

/**
 * ISO date/time string → "21 Aug 2026, 01:00" in the browser's local timezone (en-GB, 24h).
 *
 * Use this instead of `formatLocalDate` wherever the time-of-day carries meaning (meeting start,
 * action deadline). Like the other helpers here it parses through `parseBackendDate`, so an
 * unstamped backend timestamp is read as the UTC instant it actually is and shifted into the
 * viewer's timezone rather than rendering the same wall-clock reading everywhere.
 */
export const formatLocalDateTime = (value?: string | null) => {
  if (!value) return '';
  const date = parseBackendDate(value);
  if (!date) return value;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
