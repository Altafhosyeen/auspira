// Currency arrives from the backend in whatever shape the source system used —
// an ISO code ("GBP"), a bare symbol ("£"), lower case, or nothing at all.
// Intl.NumberFormat throws a RangeError on anything that is not a 3-letter code,
// which takes the whole cell (and its table) down, so every value is folded onto
// a code before it reaches Intl.
export const DEFAULT_CURRENCY_CODE = 'GBP';

const SYMBOL_CURRENCY_CODES: Record<string, string> = {
  '£': 'GBP',
  $: 'USD',
  '€': 'EUR',
  '¥': 'JPY',
  '₹': 'INR',
  '₽': 'RUB',
  '₩': 'KRW',
  '₺': 'TRY',
  '₦': 'NGN',
  '₴': 'UAH',
  'د.إ': 'AED',
  '﷼': 'SAR',
};

export const toCurrencyCode = (currency?: string | null): string => {
  const raw = (currency ?? '').trim();
  if (!raw) return DEFAULT_CURRENCY_CODE;

  const fromSymbol = SYMBOL_CURRENCY_CODES[raw];
  if (fromSymbol) return fromSymbol;

  const code = raw.toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : DEFAULT_CURRENCY_CODE;
};

interface FormatCurrencyOptions {
  locale?: string;
  maximumFractionDigits?: number;
}

export const formatCurrency = (
  amount: number,
  currency?: string | null,
  { locale = 'en-GB', maximumFractionDigits }: FormatCurrencyOptions = {}
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: toCurrencyCode(currency),
    ...(maximumFractionDigits === undefined ? {} : { maximumFractionDigits }),
  }).format(amount);

// The AMOUNT column header and the amount inputs print the bare symbol, which Intl only
// exposes through formatToParts. `en-US` is the default because it is the one common
// locale that leaves every major currency unqualified ("$", not "US$").
export const getCurrencySymbol = (currency?: string | null, locale = 'en-US'): string => {
  const code = toCurrencyCode(currency);
  const parts = new Intl.NumberFormat(locale, { style: 'currency', currency: code }).formatToParts(
    0
  );
  return parts.find((part) => part.type === 'currency')?.value ?? code;
};
