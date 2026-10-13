import {
  buildUrlWithFilters,
  parseFiltersFromSearchParams,
  toFilterSearchParams,
  getActiveFilterCount,
} from '@/lib/utils';
import type {
  FilterRecord,
  FilterSchema,
  FilterValue,
  FilterArrayOptions,
} from '@/types/urlFilterHandler.types';

type UrlFilterHandlerOptions = {
  schema: FilterSchema;
  arrayOptions?: FilterArrayOptions;
  allToken?: string;
};

type NavigateOptions = {
  scroll?: boolean;
  replace?: boolean;
};

/**
 * UrlFilterHandler
 *
 * A portable class that manages URL-based filter state. Designed to be
 * instantiated once per feature and reused across components.
 *
 * Usage:
 *   const handler = new UrlFilterHandler({ schema: FILTER_SCHEMA, arrayOptions: ARRAY_OPTIONS });
 *
 *   // In a component:
 *   const filters = handler.parse(searchParams);
 *   handler.navigate(router, pathname, filters);
 *
 *   // Granular updates:
 *   handler.set('status', 'active').navigate(router, pathname, handler.current);
 */
export class UrlFilterHandler {
  private readonly schema: FilterSchema;
  private readonly options: { arrayOptions?: FilterArrayOptions; allToken?: string };

  /** The last-parsed or in-progress filter state. Mutated by .set() / .remove() / .reset(). */
  current: FilterRecord = {};

  constructor({ schema, arrayOptions, allToken }: UrlFilterHandlerOptions) {
    this.schema = schema;
    this.options = { arrayOptions, allToken };
  }

  // ─── Parsing ───────────────────────────────────────────────────────────────

  /**
   * Parse URLSearchParams (or a plain object) into a typed FilterRecord,
   * sync the result into `this.current`, and return it.
   */
  parse(
    searchParams: URLSearchParams | ReadonlyURLSearchParams | Record<string, string>
  ): FilterRecord {
    const params =
      searchParams instanceof URLSearchParams || isReadonlyURLSearchParams(searchParams)
        ? (searchParams as URLSearchParams)
        : new URLSearchParams(searchParams as Record<string, string>);

    this.current = parseFiltersFromSearchParams(params, this.schema, this.options);
    return this.current;
  }

  // ─── Mutation helpers (fluent / chainable) ─────────────────────────────────

  /**
   * Set a single filter key. Returns `this` for chaining.
   *   handler.set('status', 'active').set('keyword', 'foo').navigate(...)
   */
  set(key: string, value: FilterValue): this {
    this.current = { ...this.current, [key]: value };
    return this;
  }

  /**
   * Remove one or more filter keys. Returns `this` for chaining.
   */
  remove(...keys: string[]): this {
    const next = { ...this.current };
    keys.forEach((k) => delete next[k]);
    this.current = next;
    return this;
  }

  /**
   * Reset all filters to empty. Returns `this` for chaining.
   */
  reset(): this {
    this.current = {};
    return this;
  }

  /**
   * Merge a partial record into the current filters. Returns `this` for chaining.
   */
  merge(partial: FilterRecord): this {
    this.current = { ...this.current, ...partial };
    return this;
  }

  // ─── URL building ──────────────────────────────────────────────────────────

  /**
   * Build a relative URL string for `pathname` with `filters` serialized
   * as search params. Falls back to `this.current` when filters are omitted.
   */
  buildUrl(pathname: string, filters?: FilterRecord): string {
    return buildUrlWithFilters(pathname, filters ?? this.current, this.options);
  }

  /**
   * Return the full absolute shareable URL (window.location.origin + relative).
   * Safe to call server-side — returns the relative URL when `window` is absent.
   */
  getShareableUrl(pathname: string, searchParams: URLSearchParams, filters?: FilterRecord): string {
    const query = (filters ? toFilterSearchParams(filters, this.options) : searchParams).toString();
    const relative = query.length > 0 ? `${pathname}?${query}` : pathname;
    if (typeof window === 'undefined') return relative;
    return `${window.location.origin}${relative}`;
  }

  /**
   * Build URLSearchParams from `filters` (or `this.current`).
   * Handy when you need raw params for server-side redirects or fetch calls.
   */
  toSearchParams(filters?: FilterRecord): URLSearchParams {
    return toFilterSearchParams(filters ?? this.current, this.options);
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  /**
   * Push or replace the router URL with the given (or current) filters applied.
   *
   * @param router   – Next.js `useRouter()` instance
   * @param pathname – Target pathname (usually `usePathname()`)
   * @param filters  – Override; defaults to `this.current`
   * @param opts     – `{ replace: true }` (default) | `{ replace: false }` to push
   */
  navigate(
    router: {
      replace: (url: string, opts?: object) => void;
      push: (url: string, opts?: object) => void;
    },
    pathname: string,
    filters?: FilterRecord,
    opts: NavigateOptions = { replace: true, scroll: false }
  ): void {
    const url = this.buildUrl(pathname, filters);
    const navOpts = { scroll: opts.scroll ?? false };
    if (opts.replace !== false) {
      router.replace(url, navOpts);
    } else {
      router.push(url, navOpts);
    }
  }

  /**
   * Navigate to a completely clean URL (no filters).
   */
  navigateReset(router: { replace: (url: string, opts?: object) => void }, pathname: string): void {
    this.reset();
    router.replace(pathname, { scroll: false });
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  /** How many filters are currently active. */
  get activeCount(): number {
    return getActiveFilterCount(this.current);
  }

  /** Whether any filter is active. */
  get hasActiveFilters(): boolean {
    return this.activeCount > 0;
  }

  /** Snapshot of current filters (plain object, safe to spread into form). */
  snapshot(): FilterRecord {
    return { ...this.current };
  }
}

// ─── Type guard ───────────────────────────────────────────────────────────────

function isReadonlyURLSearchParams(v: unknown): v is URLSearchParams {
  return typeof v === 'object' && v !== null && typeof (v as URLSearchParams).getAll === 'function';
}

// ─── ReadonlyURLSearchParams shim for Next.js ─────────────────────────────────

// Next.js exposes `ReadonlyURLSearchParams` from `next/navigation`.
// Re-export the alias so callers don't need to import from two places.
export type ReadonlyURLSearchParams = ReturnType<typeof import('next/navigation').useSearchParams>;
