/**
 * The matching strategies, from strictest to loosest.
 *
 * A value extracted by an LLM almost never appears in the PDF exactly as the
 * JSON spells it, and `String.includes` fails on every one of these:
 *
 * | JSON           | PDF                  | Strategy that catches it |
 * | -------------- | -------------------- | ------------------------ |
 * | `John Smith`   | `John Smith`         | `bounded`                |
 * | `John Smith`   | `JOHN SMITH`         | `bounded` (case folded)  |
 * | `John Smith`   | `John  Smith`        | `bounded` (space collapse) |
 * | `John Smith`   | `John\nSmith`        | `bounded` (newline → space) |
 * | `John Smith`   | `John-\nSmith`       | `compact`                |
 * | `John Smith`   | `Joh`+`n Smith` runs | `compact`                |
 * | `insurance`    | `…insurance…`        | `exact`                  |
 * | `Z62.2`        | `Z.62.2` / `Z 62 2`  | `clause`                 |
 * | `X2 X7 X16`    | each code in its own table cell | `code-list`  |
 * | long sentence  | reworded / reflowed  | `fuzzy`                  |
 *
 * The tiers are attempted in order and the **first tier that produces any hit
 * wins** — every hit from that tier is returned, so duplicate occurrences are
 * all reported and the caller decides which one to show. A weaker tier can
 * never outrank a stronger one, because scores are `tier + length + context`.
 */
import {
  AMBIGUITY_SCORE_EPSILON,
  CLAUSE_NUMBER_PATTERN,
  CLAUSE_STRATEGY_ORDER,
  CODE_TOKEN_PATTERN,
  CONTEXT_DECAY_CHARS,
  DEFAULT_MATCH_LIMIT,
  GEOMETRY_PROXIMITY_DECAY,
  LITERAL_STRATEGY_ORDER,
  MAX_CONTEXT_BONUS_PER_HINT,
  MAX_GEOMETRY_PROXIMITY_BONUS,
  MAX_HINT_OCCURRENCES,
  MAX_NEEDLE_MISS,
  MAX_NEIGHBOR_BONUS,
  MAX_PAGE_GAP,
  MAX_ROW_ALIGNMENT_BONUS,
  MAX_TOTAL_DISAMBIGUATION_BONUS,
  MIN_CODE_LIST_WORDS,
  MIN_COMPACT_LENGTH,
  MIN_DISTINCTIVE_ALPHA_LENGTH,
  MIN_DISTINCTIVE_LENGTH,
  MIN_FUZZY_COVERAGE,
  MIN_UNBOUNDED_LENGTH,
  NEAR_LINE_BONUS,
  NEAR_LINE_RADIUS,
  NEIGHBOR_WINDOW_WORDS,
  ROW_ALIGNMENT_DECAY,
  SAME_LINE_BONUS,
  SHORT_CODE_PATTERN,
  SHORT_CODE_STRATEGY_ORDER,
  STRATEGY_ORDER,
  STRATEGY_TIER,
} from '../constants';
import type {
  CharRange,
  IndexedTextItem,
  MatchStrategy,
  PageIndex,
  PageWord,
  PreparedQuery,
  RawMatch,
  SearchOptions,
} from '../types';
import type { ChunkNormalizer } from './buildIndex';
import { compactText, isWordEnd, isWordStart, trimChunk } from './normalizeText';

// ─── Query preparation ─────────────────────────────────────────────────────

/**
 * Normalises a query **once per search** rather than once per page. On a
 * 1000-page sweep that is the difference between one normalisation and a
 * thousand of them.
 */
export function prepareQuery(
  raw: string,
  normalizer: ChunkNormalizer,
  options: SearchOptions = {}
): PreparedQuery {
  const trimmedRaw = raw.trim();
  const chunk = trimChunk(normalizer.normalizeChunk(trimmedRaw));
  const normalized = chunk.text;
  const words = normalized ? normalized.split(' ').filter(Boolean) : [];

  const isShortCode = SHORT_CODE_PATTERN.test(trimmedRaw);
  const isClauseNumber = !isShortCode && CLAUSE_NUMBER_PATTERN.test(normalized);
  const isCodeList =
    !isShortCode &&
    !isClauseNumber &&
    words.length >= MIN_CODE_LIST_WORDS &&
    words.every((word) => CODE_TOKEN_PATTERN.test(word));

  return {
    raw: trimmedRaw,
    normalized,
    cased: chunk.cased,
    compact: compactText(normalized).compact,
    words,
    isShortCode,
    isClauseNumber,
    isCodeList,
    clausePattern: isClauseNumber ? new RegExp(flexiblePattern(normalized), 'g') : null,
    literal: options.literal === true,
    contextHints: (options.contextHints ?? [])
      .map((hint) => trimChunk(normalizer.normalizeChunk(hint)).text)
      .filter((hint) => hint.length >= MIN_DISTINCTIVE_LENGTH),
  };
}

/**
 * Turns a clause number into a pattern whose separators are optional.
 *
 * The same clause is rendered `Z63`, `Z.63` and `Z 63` in different parts of a
 * contract, and normalisation turns every dot into a space — so the pattern
 * makes the space optional at each letter↔digit boundary. `z62 2` then matches
 * both `z62 2` and `z622`, and `z63` matches `z 63`.
 */
export function flexiblePattern(normalized: string): string {
  let out = '';
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === ' ') {
      out += ' ?';
      continue;
    }
    out += escapeRegExp(ch);
    const next = normalized[i + 1];
    if (next && next !== ' ' && isDigit(ch) !== isDigit(next)) out += ' ?';
  }
  return out;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

// ─── Public entry point ────────────────────────────────────────────────────

/**
 * Runs the strategy ladder against one page and returns every match from the
 * first tier that hits, sorted by score then by position.
 */
export function searchPage(
  index: PageIndex,
  query: PreparedQuery,
  options: SearchOptions = {}
): RawMatch[] {
  if (!query.normalized || !index.normalized) return [];

  const limit = options.limit ?? DEFAULT_MATCH_LIMIT;
  const order = options.strategies ?? strategyOrderFor(query);
  const hints = prepareHints(index, query.contextHints);

  for (const strategy of order) {
    const matches = runStrategy(strategy, index, query, limit);
    if (matches.length === 0) continue;

    for (const match of matches) {
      match.score =
        STRATEGY_TIER[match.strategy] +
        measuredLength(match) +
        disambiguationScore(index, match, hints);
    }
    matches.sort((a, b) => b.score - a.score || a.start - b.start);
    const ranked = matches.slice(0, limit);
    markAmbiguous(ranked);
    return ranked;
  }

  return [];
}

/**
 * Which rungs of the ladder this query is allowed to use.
 *
 * Most queries get the full ladder. Identifier-shaped queries get exactly one
 * rung: a looser tier would happily match `Z44.4` inside `Z44.44`, or the
 * option letter `A` against the word "a", and a confidently-highlighted wrong
 * answer is worse than no highlight at all.
 */
function strategyOrderFor(query: PreparedQuery): readonly MatchStrategy[] {
  if (query.literal) return LITERAL_STRATEGY_ORDER;
  if (query.isShortCode) return SHORT_CODE_STRATEGY_ORDER;
  if (query.isClauseNumber) return CLAUSE_STRATEGY_ORDER;
  return STRATEGY_ORDER;
}

function measuredLength(match: RawMatch): number {
  return match.ranges.reduce((total, range) => total + (range.end - range.start), 0);
}

function runStrategy(
  strategy: MatchStrategy,
  index: PageIndex,
  query: PreparedQuery,
  limit: number
): RawMatch[] {
  switch (strategy) {
    case 'short-code':
      return matchShortCode(index, query, limit);
    case 'clause':
      return matchClause(index, query, limit);
    case 'bounded':
      return matchBounded(index, query, limit);
    case 'exact':
      return matchExact(index, query, limit);
    case 'compact':
      return matchCompact(index, query, limit);
    case 'code-list':
      return matchCodeList(index, query, limit);
    case 'fuzzy':
      return matchFuzzy(index, query, limit);
    case 'token':
      return matchToken(index, query, limit);
    default:
      return [];
  }
}

// ─── Tier 1: short ALL-CAPS codes ──────────────────────────────────────────

/**
 * A one-to-three letter code (an NEC main option, `A`…`G`) is too short to
 * search case-insensitively — a stray lowercase `a` appears constantly in body
 * text and would win. It is matched case-sensitively against the case-preserved
 * parallel stream, which is character-aligned with the normalised one, so the
 * offsets are directly reusable.
 */
function matchShortCode(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  if (!query.isShortCode) return [];
  return findBounded(index.cased, query.raw, limit).map((start) =>
    toMatch(start, start + query.raw.length, 'short-code', true)
  );
}

// ─── Tier 2: clause references ─────────────────────────────────────────────

function matchClause(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  const pattern = query.clausePattern;
  if (!pattern) return [];

  const matches: RawMatch[] = [];
  pattern.lastIndex = 0;
  for (let hit = pattern.exec(index.normalized); hit; hit = pattern.exec(index.normalized)) {
    const start = hit.index;
    const end = start + hit[0].length;
    // A preceding letter would mean we landed inside a longer word; a trailing
    // digit would mean we matched a prefix of a longer clause (`z44 4` inside
    // `z44 44`). A trailing *letter* is fine — the PDF often glues a clause
    // number to the following word when there is no column gap.
    const before = start > 0 ? index.normalized[start - 1] : '';
    const after = end < index.normalized.length ? index.normalized[end] : '';
    if (before && /[a-z]/.test(before)) continue;
    if (after && isDigit(after)) continue;
    matches.push(toMatch(start, end, 'clause', true));
    if (matches.length >= limit) break;
    if (pattern.lastIndex === hit.index) pattern.lastIndex++; // guard against zero-length
  }
  return matches;
}

// ─── Tier 3: word-bounded exact ────────────────────────────────────────────

function matchBounded(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  if (query.literal) return [];
  return findBounded(index.normalized, query.normalized, limit).map((start) =>
    toMatch(start, start + query.normalized.length, 'bounded', false)
  );
}

// ─── Tier 4: substring ─────────────────────────────────────────────────────

/**
 * Unbounded substring search. For a literal find-in-document query this is the
 * Ctrl+F behaviour users expect (typing `insur` matches `insurance`). For a
 * citation the match must at least *start* on a word boundary, so a value can
 * never land in the middle of an unrelated word.
 */
function matchExact(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  if (!query.literal && query.normalized.length < MIN_UNBOUNDED_LENGTH) return [];

  const matches: RawMatch[] = [];
  let from = 0;
  for (;;) {
    const start = index.normalized.indexOf(query.normalized, from);
    if (start === -1) break;
    from = start + query.normalized.length;
    if (!query.literal && !isWordStart(index.normalized, start)) continue;
    matches.push(toMatch(start, start + query.normalized.length, 'exact', false));
    if (matches.length >= limit) break;
  }
  return matches;
}

// ─── Tier 5: space-insensitive (compact) ───────────────────────────────────

/**
 * The tier that handles PDF.js splitting text apart.
 *
 * Both haystack and needle have every space removed, so `John-\nSmith`,
 * `John  Smith`, `Joh`+`n Smith` and `JOHN SMITH` all collapse to the same
 * `johnsmith` and match. The match is required to begin at a word start in the
 * *original* stream, which stops it from spanning an unrelated word boundary,
 * and a minimum length keeps short needles out of this tier entirely.
 *
 * Also the literal find-bar's second rung (see {@link LITERAL_STRATEGY_ORDER}):
 * a glued extraction defeats an `exact` Ctrl+F match just as much as a fuzzy
 * one, and the user typing (or a citation pasting) the words with normal
 * spacing shouldn't have to know or care that the PDF's own text layer
 * dropped a gap between two of them.
 */
function matchCompact(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  if (query.compact.length < MIN_COMPACT_LENGTH) return [];
  if (query.compact === query.normalized && index.compact === index.normalized) return [];

  const matches: RawMatch[] = [];
  let from = 0;
  for (;;) {
    const start = index.compact.indexOf(query.compact, from);
    if (start === -1) break;
    from = start + 1;
    if (index.compactWordStart[start] !== 1) continue;

    const normalizedStart = index.compactMap[start];
    const normalizedEnd = index.compactMap[start + query.compact.length - 1] + 1;
    matches.push(toMatch(normalizedStart, normalizedEnd, 'compact', false));
    if (matches.length >= limit) break;
  }
  return matches;
}

// ─── Tier 6: code list (multiple identifiers, not a phrase) ───────────────

/**
 * A citation like `X2 X7 X11 X15 X16 X18` is not a phrase — it is a *list* of
 * independent NEC-style codes, each printed in its own table cell or row. It
 * therefore almost never appears on the page as the contiguous run every tier
 * above this one looks for, and letting it fall through to `fuzzy`/`token`
 * would peel off (or land on) just *one* arbitrary code — which can easily
 * be a real occurrence of that code somewhere unrelated (a body-text mention
 * of "Clause X16", say) rather than the cited list itself.
 *
 * Each code is instead searched independently, and every one that is found
 * becomes its own range within a single match — so the highlight lights up
 * every code that is actually present on the page, wherever it sits, instead
 * of gambling on one.
 */
function matchCodeList(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  if (!query.isCodeList) return [];

  const ranges: CharRange[] = [];
  for (const word of query.words) {
    // The first occurrence only — a code cited as part of a summary list is
    // expected to be found at its primary listing, not every place the same
    // code happens to be mentioned in body text.
    const [start] = findBounded(index.normalized, word, 1);
    if (start === undefined) continue;
    ranges.push({ start, end: start + word.length });
    if (ranges.length >= limit) break;
  }
  if (ranges.length === 0) return [];

  ranges.sort((a, b) => a.start - b.start);
  return [
    {
      start: ranges[0].start,
      end: ranges[ranges.length - 1].end,
      ranges,
      score: 0,
      strategy: 'code-list',
      expandToLine: false,
    },
  ];
}

// ─── Tier 7: fuzzy phrase alignment ────────────────────────────────────────

/**
 * Aligns the needle's words against the page's words, in order, tolerating a
 * few inserted page words and a few missing needle words.
 *
 * A cited sentence is rarely reproduced verbatim: the PDF carries filler the
 * summary drops, or the extraction mangles a word. An exact substring match
 * stops dead at the first divergence; this walks past it and returns the whole
 * aligned region, so the highlight reads as one unbroken phrase.
 *
 * When even the alignment is too thin, the greedy fallback below peels off the
 * longest runs of the needle that *are* present and highlights each where it
 * really sits — which is right for a value assembled from several parts of a
 * page ("insurance", "minimum cover", "10 000 000").
 */
function matchFuzzy(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  if (query.literal || query.words.length < 2 || index.words.length === 0) return [];

  const needleChars = query.words.reduce((total, word) => total + word.length, 0);
  const aligned = alignPhrase(index.words, query.words);
  if (aligned && aligned.matchedChars >= needleChars * MIN_FUZZY_COVERAGE) {
    return [toMatch(aligned.range.start, aligned.range.end, 'fuzzy', false)];
  }

  const fragments = mergeNearbyFragments(index, peelLongestRuns(index, query.words, limit));
  if (fragments.length === 0) return [];

  const start = fragments[0].start;
  const end = fragments[fragments.length - 1].end;
  return [
    {
      start,
      end,
      ranges: fragments,
      score: 0,
      strategy: 'fuzzy',
      expandToLine: false,
    },
  ];
}

/**
 * Bridges fragments that land on the same `PageLine` into one continuous
 * range.
 *
 * `peelLongestRuns` finds each fragment independently, so two fragments from
 * the same sentence — "toolbox talks" and "biosecurity", say, either side of
 * "check-clean-dry" — come back as separate ranges with a gap between them.
 * Rendered as-is, that gap reads as unrelated, un-highlighted text sitting in
 * the middle of the highlight, so the match looks patchy instead of like one
 * coherent phrase. Bridging the gap whenever both sides share a line turns
 * that back into a single solid bar, without ever bridging fragments that
 * land on genuinely different lines — there, the gap really is unrelated
 * text, which is exactly what kept the two fields in the "Permit-to-work" /
 * "High-risk activities" case above correctly separate.
 */
function mergeNearbyFragments(index: PageIndex, fragments: readonly CharRange[]): CharRange[] {
  if (fragments.length < 2) return [...fragments];

  const merged: CharRange[] = [{ ...fragments[0] }];
  for (let i = 1; i < fragments.length; i++) {
    const previous = merged[merged.length - 1];
    const fragment = fragments[i];
    const sameLine =
      previous.end > previous.start &&
      lineOf(index, previous.end - 1) === lineOf(index, fragment.start);
    if (sameLine) {
      previous.end = Math.max(previous.end, fragment.end);
      continue;
    }
    merged.push({ ...fragment });
  }
  return merged;
}

interface Alignment {
  range: CharRange;
  matchedChars: number;
}

/**
 * Best local alignment of the needle's words against the page's words.
 *
 * Local by construction — one region, anchored at a shared word — so it can
 * never scatter a highlight across unrelated parts of the page.
 */
export function alignPhrase(pageWords: PageWord[], needleWords: string[]): Alignment | null {
  const needleSet = new Set(needleWords);
  let best: Alignment | null = null;

  for (let s = 0; s < pageWords.length; s++) {
    if (!needleSet.has(pageWords[s].text)) continue;

    for (let n0 = 0; n0 < needleWords.length; n0++) {
      if (needleWords[n0] !== pageWords[s].text) continue;

      let matchedChars = needleWords[n0].length;
      let lastMatched = s;
      let pageCursor = s + 1;
      let consecutiveMisses = 0;

      for (let n = n0 + 1; n < needleWords.length; n++) {
        let found = -1;
        for (let gap = 0; gap <= MAX_PAGE_GAP && pageCursor + gap < pageWords.length; gap++) {
          if (pageWords[pageCursor + gap].text === needleWords[n]) {
            found = pageCursor + gap;
            break;
          }
        }
        if (found === -1) {
          if (++consecutiveMisses > MAX_NEEDLE_MISS) break;
          continue;
        }
        consecutiveMisses = 0;
        matchedChars += needleWords[n].length;
        lastMatched = found;
        pageCursor = found + 1;
      }

      if (!best || matchedChars > best.matchedChars) {
        best = {
          range: { start: pageWords[s].start, end: pageWords[lastMatched].end },
          matchedChars,
        };
      }
    }
  }

  return best;
}

/**
 * Greedily peels off the longest remaining contiguous run of needle words that
 * appears on the page, marks those words consumed, and repeats.
 */
/**
 * Each fragment's *occurrence* matters as much as its text. Once an anchor is
 * established — the first fragment placed, which is always the longest (and
 * so the most specific and least likely to repeat) run found — every later
 * fragment prefers the occurrence of itself nearest that anchor, not simply
 * the first the page happens to contain.
 *
 * Without this, a short, generic fragment ("water", "lifting", "work") whose
 * real occurrence sits right next to the fragments already placed can lose to
 * an unrelated occurrence of the same word elsewhere on the page, scattering
 * one field's highlight into a completely different section — exactly the
 * failure mode this function exists to avoid.
 */
function peelLongestRuns(index: PageIndex, words: string[], limit: number): CharRange[] {
  const consumed = new Array<boolean>(words.length).fill(false);
  const ranges: CharRange[] = [];
  let anchor: number | null = null;

  for (let guard = 0; guard < limit; guard++) {
    let best: { from: number; to: number; start: number; end: number; length: number } | null =
      null;

    for (let from = 0; from < words.length; from++) {
      if (consumed[from]) continue;
      for (let to = words.length; to > from; to--) {
        let clear = true;
        for (let k = from; k < to; k++) {
          if (consumed[k]) {
            clear = false;
            break;
          }
        }
        if (!clear) continue;

        const candidate = words.slice(from, to).join(' ');
        if (!isDistinctive(candidate)) break; // shorter runs from `from` are shorter still
        if (best && candidate.length <= best.length) continue;

        const occurrence = nearestOccurrence(index, candidate, anchor);
        if (occurrence) {
          best = {
            from,
            to,
            start: occurrence.start,
            end: occurrence.end,
            length: candidate.length,
          };
        }
      }
    }

    if (!best) break;
    ranges.push({ start: best.start, end: best.end });
    for (let k = best.from; k < best.to; k++) consumed[k] = true;
    // The first (longest, most specific) fragment sets where the rest should
    // cluster; it never moves once set, so later fragments all converge on
    // the same neighbourhood instead of each drifting independently.
    if (anchor === null) anchor = best.start;
  }

  if (anchor === null) return [];

  // Keep the highlight to one line — the anchor's. A short, generic fragment
  // ("water", "services") can legitimately have its nearest occurrence to the
  // anchor sitting one line up or down (a wrapped sentence, a neighbouring
  // bullet), but pulling the highlight onto that second line reads as multi-
  // line when the citation is really one line's worth of text. Dropping
  // off-line fragments here is also what lets `mergeNearbyFragments` collapse
  // everything that remains into a single continuous bar.
  const anchorLine = lineOf(index, anchor);
  const onAnchorLine =
    anchorLine < 0 ? ranges : ranges.filter((range) => lineOf(index, range.start) === anchorLine);

  return onAnchorLine.sort((a, b) => a.start - b.start);
}

/**
 * Every occurrence of `needle` in `index`, preferring the literal (spaced)
 * form and falling back to a space-insensitive (compact) lookup for a
 * multi-word run — the same rescue the top-level `compact` tier gives a whole
 * query, extended here to each fragment `peelLongestRuns` peels off a
 * paraphrased citation into.
 *
 * Real PDFs occasionally glue two page words together with no measurable gap
 * (tight kerning, fully-justified body text), which silently defeats a
 * literal multi-word run — `"salt island access bridge"` never appears as
 * such if the page's own extraction produced `"salt islandaccess bridge"` —
 * even though every word really is there, back to back.
 */
function findFragmentOccurrences(index: PageIndex, needle: string): CharRange[] {
  const literal = findBounded(index.normalized, needle, MAX_HINT_OCCURRENCES);
  if (literal.length > 0) {
    return literal.map((start) => ({ start, end: start + needle.length }));
  }
  if (!needle.includes(' ') || needle.length < MIN_COMPACT_LENGTH) return [];

  const compactNeedle = compactText(needle).compact;
  const ranges: CharRange[] = [];
  let from = 0;
  for (;;) {
    const start = index.compact.indexOf(compactNeedle, from);
    if (start === -1) break;
    from = start + 1;
    if (index.compactWordStart[start] !== 1) continue;
    ranges.push({
      start: index.compactMap[start],
      end: index.compactMap[start + compactNeedle.length - 1] + 1,
    });
    if (ranges.length >= MAX_HINT_OCCURRENCES) break;
  }
  return ranges;
}

/**
 * The occurrence of `needle` closest to `anchor`, or the first occurrence
 * when there is no anchor yet (nothing has been placed, so there is nothing
 * to be close to). Bounded by `MAX_HINT_OCCURRENCES` for the same reason as
 * the hint lookups above: a common short word must not make this expensive
 * on a page where it recurs constantly.
 */
function nearestOccurrence(
  index: PageIndex,
  needle: string,
  anchor: number | null
): CharRange | null {
  const occurrences = findFragmentOccurrences(index, needle);
  if (occurrences.length === 0) return null;
  if (anchor === null) return occurrences[0];

  let closest = occurrences[0];
  let bestDistance = Math.abs(closest.start - anchor);
  for (let i = 1; i < occurrences.length; i++) {
    const distance = Math.abs(occurrences[i].start - anchor);
    if (distance < bestDistance) {
      bestDistance = distance;
      closest = occurrences[i];
    }
  }
  return closest;
}

// ─── Tier 8: single distinctive token ──────────────────────────────────────

/**
 * Last resort: land the highlight on the single most distinctive word of the
 * value, so a citation points *somewhere* rather than nowhere.
 *
 * A bare number is normally rejected — it is as likely to be a page number, a
 * year, or an unrelated quantity — unless it is the only occurrence on the
 * page, in which case there is nothing it could be confused with.
 */
function matchToken(index: PageIndex, query: PreparedQuery, limit: number): RawMatch[] {
  if (query.literal) return [];

  const candidates = query.words
    .filter(
      (word) =>
        isDistinctive(word) ||
        (word.length >= 2 && /[a-z]/.test(word) && /\d/.test(word)) || // `W2`, `A1`
        /^\d+%$/.test(word) ||
        (/^\d+$/.test(word) && countBounded(index.normalized, word) === 1)
    )
    .sort((a, b) => b.length - a.length);

  for (const candidate of candidates) {
    const positions = findBounded(index.normalized, candidate, limit);
    if (positions.length === 0) continue;
    return positions.map((start) => toMatch(start, start + candidate.length, 'token', false));
  }
  return [];
}

/**
 * Is a substring specific enough to highlight on its own? A letters-only run
 * clears the bar at three characters — a whole-word acronym is precise because
 * it must sit on a word boundary — while anything containing a digit needs four.
 */
export function isDistinctive(value: string): boolean {
  if (value.length >= MIN_DISTINCTIVE_LENGTH) return true;
  return value.length >= MIN_DISTINCTIVE_ALPHA_LENGTH && /^[a-z]+$/.test(value);
}

// ─── Shared helpers ────────────────────────────────────────────────────────

/** Every word-bounded occurrence of `needle` in `haystack`. */
export function findBounded(haystack: string, needle: string, limit: number): number[] {
  if (!needle) return [];
  const positions: number[] = [];
  let from = 0;
  for (;;) {
    const start = haystack.indexOf(needle, from);
    if (start === -1) break;
    from = start + 1;
    if (isWordStart(haystack, start) && isWordEnd(haystack, start + needle.length)) {
      positions.push(start);
      if (positions.length >= limit) break;
    }
  }
  return positions;
}

function countBounded(haystack: string, needle: string): number {
  return findBounded(haystack, needle, Number.MAX_SAFE_INTEGER).length;
}

function toMatch(
  start: number,
  end: number,
  strategy: MatchStrategy,
  expandToLine: boolean
): RawMatch {
  return { start, end, ranges: [{ start, end }], score: 0, strategy, expandToLine };
}

// ─── Duplicate disambiguation ──────────────────────────────────────────────
//
// A value that appears several times on a page is resolved with four
// independent, complementary signals — the same cues a human uses when
// scanning for the right row of a table:
//
// 1. context   — proximity, in the normalised text stream, to every sibling
//                field's own value (§ contextScore).
// 2. line      — proximity in the page's baseline-clustered `PageLine` index
//                (§ lineProximityScore).
// 3. neighbour — vocabulary shared between the words immediately surrounding
//                a candidate and the sibling values themselves
//                (§ neighborTokenScore).
// 4. geometry  — proximity in real x/y page coordinates, read straight from
//                pdf.js's own text-item transforms (§ geometryScore).
//
// (1) and (2) both key off character/line offsets, which track *reading*
// order. (4) is the odd one out and the most important complement to the
// other three: it is read directly from each item's transform and never
// touches character offsets or the line index, so it is the one signal that
// still works when a PDF's text serialization order doesn't match its visual
// layout — a rotated scan, multi-column text, or a table whose cells stream
// out of visual row order. Two cells in the same row are next to each other
// in *space* even when they are far apart in the text stream; geometry is
// what catches that.
//
// Every signal is summed *per hint* rather than taking the single closest
// hint, so a candidate corroborated by several sibling fields at once
// outranks one corroborated by only one. The combined total is then clamped
// to `MAX_TOTAL_DISAMBIGUATION_BONUS`, which keeps the whole disambiguation
// layer safely under the ~1,000,000 gap between strategy tiers no matter how
// many hints a record supplies — a weaker match can still never outrank a
// stronger one; these signals only ever choose *which occurrence* of an
// equally-good match is the right one.

interface PageHints {
  /** Every occurrence (capped) of each hint, in character offsets. */
  occurrences: number[][];
  /** Each hint's own words, for the neighbouring-vocabulary signal. */
  wordSets: ReadonlySet<string>[];
}

function prepareHints(index: PageIndex, hints: readonly string[]): PageHints {
  return {
    occurrences: hints.map((hint) => findBounded(index.normalized, hint, MAX_HINT_OCCURRENCES)),
    wordSets: hints.map((hint) => new Set(hint.split(' ').filter(Boolean))),
  };
}

function disambiguationScore(index: PageIndex, match: RawMatch, hints: PageHints): number {
  if (hints.occurrences.length === 0) return 0;
  const total =
    contextScore(match, hints.occurrences) +
    lineProximityScore(index, match, hints.occurrences) +
    neighborTokenScore(index, match, hints.wordSets) +
    geometryScore(index, match, hints.occurrences);
  return Math.round(Math.min(MAX_TOTAL_DISAMBIGUATION_BONUS, total));
}

/** Closest occurrence of `positions` to a `[start, end)` range, or `null`. */
function nearestCharDistance(
  start: number,
  end: number,
  positions: readonly number[]
): number | null {
  let best: number | null = null;
  for (const position of positions) {
    const distance = position < start ? start - position : Math.max(0, position - end);
    if (best === null || distance < best) best = distance;
  }
  return best;
}

/**
 * Character-distance proximity to every hint, summed across hints. Each hint
 * contributes independently from its *nearest* occurrence to this specific
 * candidate — not one fixed anchor shared by every candidate on the page,
 * which is what makes this safe to use against a hint that itself repeats
 * (a column header, a recurring defined term).
 */
function contextScore(match: RawMatch, hintOccurrences: readonly number[][]): number {
  let total = 0;
  for (const occurrences of hintOccurrences) {
    const distance = nearestCharDistance(match.start, match.end, occurrences);
    if (distance === null) continue;
    total += MAX_CONTEXT_BONUS_PER_HINT / (1 + distance / CONTEXT_DECAY_CHARS);
  }
  return total;
}

/** The `PageLine` a character offset falls on — O(1) via the item already
 *  recorded for it, no scanning of `PageIndex.lines` required. */
function lineOf(index: PageIndex, charOffset: number): number {
  const last = index.itemOf.length - 1;
  if (last < 0) return -1;
  const itemIndex = index.itemOf[Math.max(0, Math.min(charOffset, last))];
  return itemIndex >= 0 ? index.items[itemIndex].line : -1;
}

/** Coarse "same row" signal from the baseline-clustered line index. Cheap,
 *  but only as reliable as `buildLines`' clustering — `geometryScore` below
 *  is the uncoupled backstop for pages where that clustering is off. */
function lineProximityScore(
  index: PageIndex,
  match: RawMatch,
  hintOccurrences: readonly number[][]
): number {
  const matchLine = lineOf(index, match.start);
  if (matchLine < 0) return 0;

  let total = 0;
  for (const occurrences of hintOccurrences) {
    let best: number | null = null;
    for (const position of occurrences) {
      const hintLine = lineOf(index, position);
      if (hintLine < 0) continue;
      const distance = Math.abs(hintLine - matchLine);
      if (best === null || distance < best) best = distance;
    }
    if (best === 0) total += SAME_LINE_BONUS;
    else if (best !== null && best <= NEAR_LINE_RADIUS) total += NEAR_LINE_BONUS / best;
  }
  return total;
}

/** Index of the word spanning (or immediately after) `charOffset`, via binary
 *  search — `PageIndex.words` is built in ascending `start` order. */
function wordIndexAt(words: readonly PageWord[], charOffset: number): number {
  let lo = 0;
  let hi = words.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (words[mid].end <= charOffset) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function neighborWindow(index: PageIndex, match: RawMatch): Set<string> {
  const words = index.words;
  const window = new Set<string>();
  if (words.length === 0) return window;

  const centre = wordIndexAt(words, match.start);
  const lo = Math.max(0, centre - NEIGHBOR_WINDOW_WORDS);
  const hi = Math.min(words.length, centre + NEIGHBOR_WINDOW_WORDS + 1);
  for (let i = lo; i < hi; i++) window.add(words[i].text);
  return window;
}

function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared++;
  return shared / (a.size + b.size - shared);
}

/**
 * Vocabulary shared between the words around a candidate and a hint's own
 * words — catches a sibling field whose exact text isn't printed nearby
 * (a paraphrased label, an abbreviation) but whose individual words still
 * are. Independent of where (or whether) the hint's exact text was found.
 */
function neighborTokenScore(
  index: PageIndex,
  match: RawMatch,
  hintWordSets: readonly ReadonlySet<string>[]
): number {
  if (hintWordSets.length === 0) return 0;
  const window = neighborWindow(index, match);
  if (window.size === 0) return 0;

  let total = 0;
  for (const hintWords of hintWordSets) total += jaccard(window, hintWords) * MAX_NEIGHBOR_BONUS;
  return total;
}

/** The item touching a character offset, stepping over injected separators
 *  (`itemOf === -1`) by probing outward until a real item turns up. */
function itemAt(index: PageIndex, charOffset: number): IndexedTextItem | null {
  const last = index.itemOf.length - 1;
  if (last < 0) return null;
  const start = Math.max(0, Math.min(charOffset, last));
  for (let probe = start; probe <= last; probe++) {
    const itemIndex = index.itemOf[probe];
    if (itemIndex >= 0) return index.items[itemIndex];
  }
  for (let probe = start; probe >= 0; probe--) {
    const itemIndex = index.itemOf[probe];
    if (itemIndex >= 0) return index.items[itemIndex];
  }
  return null;
}

/** Centre of an item's glyph box, in PDF user-space units — read straight
 *  from pdf.js's own transform, no viewport or DOM access required. */
function itemCentre(item: IndexedTextItem): { x: number; y: number } {
  return {
    x: (item.transform[4] ?? 0) + item.width / 2,
    y: (item.transform[5] ?? 0) + item.fontHeight * 0.39,
  };
}

/**
 * x/y proximity read straight from pdf.js text-item transforms — the one
 * disambiguation signal that is independent of both character offsets and
 * the line index, so it stays reliable on a page whose text serialization
 * order doesn't match its visual layout. Two components, both summed across
 * every hint:
 *
 * - **row alignment**: near-identical y, regardless of x — the strongest
 *   "same table row" signal there is, because it holds even when a row's
 *   cells are far apart in the text stream or arrive in a different order
 *   than they are laid out.
 * - **overall proximity**: general on-page distance — catches a label
 *   sitting beside or above its value even when the two are not row-aligned.
 */
function geometryScore(
  index: PageIndex,
  match: RawMatch,
  hintOccurrences: readonly number[][]
): number {
  const matchItem = itemAt(index, match.start);
  if (!matchItem) return 0;
  const matchCentre = itemCentre(matchItem);

  const pageWidth = Math.abs((index.viewBox[2] ?? 0) - (index.viewBox[0] ?? 0)) || 1;
  const pageHeight = Math.abs((index.viewBox[3] ?? 0) - (index.viewBox[1] ?? 0)) || 1;

  let total = 0;
  for (const occurrences of hintOccurrences) {
    let bestRow: number | null = null;
    let bestOverall: number | null = null;

    for (const position of occurrences) {
      const hintItem = itemAt(index, position);
      if (!hintItem) continue;
      const hintCentre = itemCentre(hintItem);

      const dy = Math.abs(matchCentre.y - hintCentre.y) / pageHeight;
      const dx = (matchCentre.x - hintCentre.x) / pageWidth;
      const overall = Math.hypot(dx, dy);

      if (bestRow === null || dy < bestRow) bestRow = dy;
      if (bestOverall === null || overall < bestOverall) bestOverall = overall;
    }

    if (bestRow !== null) total += MAX_ROW_ALIGNMENT_BONUS / (1 + bestRow / ROW_ALIGNMENT_DECAY);
    if (bestOverall !== null) {
      total += MAX_GEOMETRY_PROXIMITY_BONUS / (1 + bestOverall / GEOMETRY_PROXIMITY_DECAY);
    }
  }
  return total;
}

/**
 * Flags a match whose score sits within `AMBIGUITY_SCORE_EPSILON` of its
 * immediate neighbour in the ranked list — i.e. none of the signals above
 * actually distinguished the two. Run once, after the final sort, over every
 * candidate returned for the page.
 */
function markAmbiguous(matches: RawMatch[]): void {
  for (let i = 0; i < matches.length; i++) {
    const rival = i === 0 ? matches[1] : matches[i - 1];
    matches[i].ambiguous =
      rival !== undefined && Math.abs(matches[i].score - rival.score) < AMBIGUITY_SCORE_EPSILON;
  }
}
