/**
 * A configured, memoising normaliser.
 *
 * Wrapping the pure functions in an object buys two things: a single place to
 * carry options through the whole engine (so the page index and the query are
 * *guaranteed* to be normalised identically — get that wrong and nothing ever
 * matches), and a character-fold cache. The fold cache matters more than it
 * looks: folding is the per-character hot path of indexing, and after the first
 * page almost every character is a cache hit.
 */
import type { NormalizedChunk, NormalizerOptions, ResolvedNormalizerOptions } from '../types';
import {
  compactText,
  normalizeChunk,
  resolveNormalizerOptions,
  trimChunk,
} from '../utils/normalizeText';

/** Queries repeat constantly (re-click, re-render, next/previous match). */
const QUERY_CACHE_LIMIT = 200;

export class TextNormalizer {
  readonly options: ResolvedNormalizerOptions;

  /** Source character → folded replacement. Unbounded, but bounded in practice. */
  private readonly foldCache = new Map<string, string>();

  /** Insertion-ordered so the oldest entry can be evicted in O(1). */
  private readonly queryCache = new Map<string, NormalizedChunk>();

  constructor(options?: NormalizerOptions) {
    this.options = resolveNormalizerOptions(options);
  }

  /** Normalises one text run, preserving leading/trailing space information. */
  normalizeChunk(source: string): NormalizedChunk {
    return normalizeChunk(source, this.options, this.foldCache);
  }

  /** Normalises and trims — the form a query should take. */
  normalizeQuery(source: string): NormalizedChunk {
    const cached = this.queryCache.get(source);
    if (cached) return cached;

    const chunk = trimChunk(this.normalizeChunk(source));
    if (this.queryCache.size >= QUERY_CACHE_LIMIT) {
      const oldest = this.queryCache.keys().next();
      if (!oldest.done) this.queryCache.delete(oldest.value);
    }
    this.queryCache.set(source, chunk);
    return chunk;
  }

  /** Convenience: the trimmed, normalised string only. */
  normalize(source: string): string {
    return this.normalizeQuery(source).text;
  }

  /** The space-free form of a normalised string. */
  compact(normalized: string): string {
    return compactText(normalized).compact;
  }

  /** A sibling normaliser with different options and a fresh cache. */
  withOptions(options: NormalizerOptions): TextNormalizer {
    return new TextNormalizer({ ...this.options, ...options });
  }

  clearCaches(): void {
    this.foldCache.clear();
    this.queryCache.clear();
  }
}

/** Shared default instance — the engine's normalisation is deterministic. */
export const defaultNormalizer = new TextNormalizer();
