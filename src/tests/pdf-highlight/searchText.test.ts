import { describe, expect, it } from 'vitest';
import { TextNormalizer, buildPageIndex, prepareQuery, searchPage } from '@/lib/pdf-highlight';
import { item, line, textContent } from './helpers';

const normalizer = new TextNormalizer();

function build(items: ReturnType<typeof item>[]) {
  return buildPageIndex({ pageNumber: 1, textContent: textContent(items), normalizer });
}

function find(items: ReturnType<typeof item>[], query: string, literal = false) {
  const index = build(items);
  const prepared = prepareQuery(query, normalizer, { literal });
  const matches = searchPage(index, prepared, { literal });
  return {
    index,
    matches,
    text: (m: { start: number; end: number }) => index.normalized.slice(m.start, m.end),
  };
}

describe('the split-text problem', () => {
  it('matches text the PDF renders as one run', () => {
    const { matches, text } = find([item('Client: John Smith', { width: 90 })], 'John Smith');
    expect(matches[0].strategy).toBe('bounded');
    expect(text(matches[0])).toBe('john smith');
  });

  it('matches across a double space', () => {
    const { matches, text } = find([item('John  Smith', { width: 55 })], 'John Smith');
    expect(text(matches[0])).toBe('john smith');
  });

  it('matches across a case difference', () => {
    const { matches, text } = find([item('JOHN SMITH', { width: 55 })], 'John Smith');
    expect(text(matches[0])).toBe('john smith');
  });

  it('matches across a line break', () => {
    const { matches } = find(
      [
        item('John', { x: 0, y: 700, width: 20, hasEOL: true }),
        item('Smith', { x: 0, y: 688, width: 25 }),
      ],
      'John Smith'
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].strategy).toBe('bounded');
  });

  it('matches across two text runs separated by a real gap', () => {
    // "John Sm" + "ith" with a wide gap normalises to "john sm ith", which only
    // the space-insensitive tier can reunite.
    const { matches, text } = find(
      line([{ str: 'John Sm', gap: 6 }, { str: 'ith' }]),
      'John Smith'
    );
    expect(matches[0].strategy).toBe('compact');
    expect(text(matches[0])).toBe('john sm ith');
  });

  it('matches a mid-word hyphenated line break', () => {
    const { matches, text } = find(
      [
        item('insur-', { x: 0, y: 700, width: 30, hasEOL: true }),
        item('ance', { x: 0, y: 688, width: 20 }),
      ],
      'insurance'
    );
    expect(matches[0].strategy).toBe('compact');
    expect(text(matches[0])).toBe('insur ance');
  });

  it('does not match a number inside a longer number', () => {
    const { matches } = find([item('Issued in 2018', { width: 70 })], '18');
    expect(matches).toHaveLength(0);
  });
});

describe('duplicates', () => {
  const page = [
    item('John Smith — Project Manager', { x: 0, y: 700, width: 140 }),
    item('John Smith — Site Agent', { x: 0, y: 600, width: 120 }),
  ];

  it('returns every occurrence so the caller can choose', () => {
    const { matches } = find(page, 'John Smith');
    expect(matches).toHaveLength(2);
    expect(matches[0].start).toBeLessThan(matches[1].start);
  });

  it('ranks the occurrence nearest a context hint first', () => {
    const index = build(page);
    const prepared = prepareQuery('John Smith', normalizer, { contextHints: ['site agent'] });
    const matches = searchPage(index, prepared, { contextHints: ['site agent'] });

    expect(matches).toHaveLength(2);
    // The second occurrence sits beside "Site Agent", so it now outranks the first.
    expect(matches[0].start).toBeGreaterThan(matches[1].start);
  });
});

describe('clause references', () => {
  it('matches a clause number however the PDF punctuates it', () => {
    for (const rendered of ['Z62.2 Insurance', 'Z 62 2 Insurance', 'Z62 2 Insurance']) {
      const { matches } = find([item(rendered, { width: 90 })], 'Z62.2');
      expect(matches[0]?.strategy, rendered).toBe('clause');
      expect(matches[0]?.expandToLine).toBe(true);
    }
  });

  it('does not match a longer sibling clause', () => {
    const { matches } = find([item('Z44.44 Something', { width: 90 })], 'Z44.4');
    expect(matches).toHaveLength(0);
  });
});

describe('short codes', () => {
  it('matches a capital option letter case-sensitively', () => {
    const { matches, text } = find([item('Main Option A applies', { width: 100 })], 'A');
    expect(matches[0].strategy).toBe('short-code');
    expect(text(matches[0])).toBe('a');
    expect(matches[0].expandToLine).toBe(true);
  });

  it('ignores a lowercase article that would otherwise win', () => {
    const { matches } = find([item('a very long sentence here', { width: 120 })], 'A');
    expect(matches).toHaveLength(0);
  });
});

describe('partial and fuzzy matching', () => {
  it('matches a prefix of a longer word', () => {
    const { matches, text } = find([item('Insurance certificate', { width: 100 })], 'insuran');
    expect(matches[0].strategy).toBe('exact');
    expect(text(matches[0])).toBe('insuran');
  });

  it('aligns a phrase over filler words the summary dropped', () => {
    const { matches, text } = find(
      [item('The Contractor is responsible for the design of the works', { width: 260 })],
      'Contractor responsible for design'
    );
    expect(matches[0].strategy).toBe('fuzzy');
    expect(text(matches[0])).toContain('contractor is responsible for the design');
  });

  it('highlights only the fragments of the value that are actually present', () => {
    const { matches, text } = find(
      [item('Retention percentage stated elsewhere', { width: 180 })],
      'unrelated retention value'
    );
    expect(matches[0].strategy).toBe('fuzzy');
    expect(matches[0].ranges).toHaveLength(1);
    expect(text(matches[0].ranges[0])).toBe('retention');
  });

  it('still finds a multi-word fragment the page glued into one run', () => {
    // Justified body text occasionally leaves no measurable gap between two
    // words, so pdf.js's own extraction can glue them — "salt island access
    // bridge" never appears as such in the literal (spaced) page text, even
    // though the words are all genuinely there, back to back.
    const { matches, text } = find(
      [
        item('Retention percentage stated elsewhere on the SaltIslandaccessbridge drawing', {
          width: 400,
        }),
      ],
      'unrelated retention value near Salt Island access bridge'
    );
    expect(matches[0].strategy).toBe('fuzzy');
    const fragments = matches[0].ranges.map((r) => text(r));
    expect(fragments.some((fragment) => fragment.includes('saltislandaccessbridge'))).toBe(true);
  });

  it('falls back to the most distinctive token when no run of words survives', () => {
    const { matches, text } = find([item('Retention 0% of value', { width: 110 })], 'quantity 0%');
    expect(matches[0].strategy).toBe('token');
    expect(text(matches[0])).toBe('0%');
  });

  it('refuses a bare number that recurs on the page', () => {
    const { matches } = find(
      [item('Section 5 refers to 5 and 5 again', { width: 160 })],
      'quantity 5'
    );
    expect(matches).toHaveLength(0);
  });

  it('accepts a bare number that occurs exactly once', () => {
    const { matches, text } = find([item('Defects period 52 weeks', { width: 110 })], '52');
    expect(text(matches[0])).toBe('52');
  });
});

describe('literal find-in-document', () => {
  it('matches mid-word, the way Ctrl+F does', () => {
    const { matches, text } = find([item('Reinsurance policy', { width: 90 })], 'insur', true);
    expect(matches[0].strategy).toBe('exact');
    expect(text(matches[0])).toBe('insur');
  });

  it('returns every occurrence in reading order', () => {
    const { matches } = find([item('cost cost cost', { width: 70 })], 'cost', true);
    expect(matches).toHaveLength(3);
  });

  it('falls back to a space-insensitive match when the page glued two words together', () => {
    // A narrow form-field box (e.g. a currency value) is exactly where pdf.js
    // is most likely to leave no measurable gap between two words — the
    // literal `exact` tier alone would never find the full phrase.
    const { matches, text } = find(
      [item('The currency of the subcontract is the Britishpound Sterling', { width: 300 })],
      'British Pound Sterling',
      true
    );
    expect(matches[0].strategy).toBe('compact');
    expect(text(matches[0])).toBe('britishpound sterling');
  });
});
