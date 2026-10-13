import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CURRENCY_CODE,
  getCurrencySymbol,
  toCurrencyCode,
} from '@/modules/compensation-event/utils/compensation-event-currency.utils';

describe('toCurrencyCode', () => {
  it('passes an ISO code through, upper cased', () => {
    expect(toCurrencyCode('usd')).toBe('USD');
  });

  it('folds a bare symbol onto its code', () => {
    expect(toCurrencyCode('£')).toBe('GBP');
  });

  it('falls back to the default for anything Intl would reject', () => {
    expect(toCurrencyCode('pounds')).toBe(DEFAULT_CURRENCY_CODE);
    expect(toCurrencyCode(null)).toBe(DEFAULT_CURRENCY_CODE);
  });
});

describe('getCurrencySymbol', () => {
  it('returns the bare symbol, not a qualified one', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencySymbol('GBP')).toBe('£');
    expect(getCurrencySymbol('EUR')).toBe('€');
  });

  it('resolves a symbol the same way a code does', () => {
    expect(getCurrencySymbol('£')).toBe('£');
  });

  it('falls back to the default currency when nothing usable is given', () => {
    expect(getCurrencySymbol(undefined)).toBe(getCurrencySymbol(DEFAULT_CURRENCY_CODE));
  });
});
