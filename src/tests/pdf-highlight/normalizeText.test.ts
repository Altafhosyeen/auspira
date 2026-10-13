import { describe, expect, it } from 'vitest';
import {
  TextNormalizer,
  compactText,
  normalizeChunk,
  normalizeText,
  resolveNormalizerOptions,
} from '@/lib/pdf-highlight';

const options = resolveNormalizerOptions();

describe('normalizeText', () => {
  it('lowercases and collapses whitespace runs', () => {
    expect(normalizeText('  John   Smith \n')).toBe('john smith');
    expect(normalizeText('JOHN\tSMITH')).toBe('john smith');
  });

  it('folds diacritics and compatibility forms', () => {
    expect(normalizeText('Café')).toBe('cafe');
    expect(normalizeText('Ｎ')).toBe('n');
    // A ligature expands to two characters from one source character.
    expect(normalizeText('ﬁnal')).toBe('final');
  });

  it('normalises the many dash and quote code points to one form', () => {
    expect(normalizeText('2020–2021')).toBe('2020 2021');
    expect(normalizeText('the Client’s risk')).toBe('the client s risk');
  });

  it('drops invisible characters instead of turning them into gaps', () => {
    expect(normalizeText('John­Smith')).toBe('johnsmith');
    expect(normalizeText('John​Smith')).toBe('johnsmith');
  });

  it('keeps percentages, which would otherwise look like bare numbers', () => {
    expect(normalizeText('5%')).toBe('5%');
    expect(normalizeText('walls,')).toBe('walls');
  });

  it('maps every output character back to its source index', () => {
    const chunk = normalizeChunk('Café', options);
    expect(chunk.text).toBe('cafe');
    // 'é' is one source character at index 3 that survives folding as one char.
    expect([...chunk.map]).toEqual([0, 1, 2, 3]);
  });

  it('credits both halves of an expanded ligature to the same source index', () => {
    const chunk = normalizeChunk('ﬁn', options);
    expect(chunk.text).toBe('fin');
    expect([...chunk.map]).toEqual([0, 0, 1]);
  });

  it('keeps the cased parallel the same length as the primary stream', () => {
    const chunk = normalizeChunk('Contractor’s DESIGN', options);
    expect(chunk.cased.length).toBe(chunk.text.length);
    expect(chunk.cased).toContain('DESIGN');
    expect(chunk.text).toContain('design');
  });

  it('preserves a trailing space so the index builder can detect a word break', () => {
    expect(normalizeChunk('John ', options).text).toBe('john ');
    expect(normalizeChunk(' John', options).text).toBe('john');
  });

  it('compacts to a space-free stream with a map back', () => {
    const { compact, map } = compactText('john smith');
    expect(compact).toBe('johnsmith');
    // 's' of "smith" is compact index 4 and normalised index 5.
    expect(map[4]).toBe(5);
  });
});

describe('TextNormalizer', () => {
  it('returns identical results from the query cache', () => {
    const normalizer = new TextNormalizer();
    const first = normalizer.normalizeQuery('John Smith');
    const second = normalizer.normalizeQuery('John Smith');
    expect(second).toBe(first);
  });

  it('honours a case-sensitive configuration', () => {
    const normalizer = new TextNormalizer({ lowercase: false });
    expect(normalizer.normalize('John Smith')).toBe('John Smith');
  });

  it('can keep punctuation when configured to', () => {
    const normalizer = new TextNormalizer({ stripPunctuation: false });
    expect(normalizer.normalize('walls, floors')).toBe('walls, floors');
  });
});
