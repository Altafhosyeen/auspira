import { describe, expect, it } from 'vitest';
import { ORGANIZATION_ROUTES } from '@/constants/routes';

describe('tsx import', () => {
  it('loads a tsx module', () => {
    expect(Array.isArray(ORGANIZATION_ROUTES)).toBe(true);
  });
});
