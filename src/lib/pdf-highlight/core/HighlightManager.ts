/**
 * The highlight store.
 *
 * A tiny observable built for `useSyncExternalStore`, which imposes one hard
 * requirement: **snapshots must be referentially stable between mutations**.
 * Returning a freshly-built array from `getPageHighlights` on every call would
 * make React re-render forever, so per-page lists are computed once per
 * mutation and handed out by reference — and pages with nothing on them all
 * share one frozen empty array.
 *
 * Highlights live in named groups, and replacing a group is how "remove the
 * previous highlight" is expressed. Clicking a new citation calls
 * `setGroup('citation', [next])`: the old one disappears and the new one
 * appears in a single notification, so there is no frame where both are
 * visible and no frame where neither is.
 */
import { DEFAULT_ACTIVE_COLOR, DEFAULT_HIGHLIGHT_COLOR } from '../constants';
import type { Highlight, HighlightInput, HighlightState } from '../types';

export const HIGHLIGHT_GROUPS = {
  /** Driven by clicking a value in the JSON panel. At most one at a time. */
  citation: 'citation',
  /** Driven by the find bar. Many at a time, one of them active. */
  find: 'find',
  /** Drawn by the user with the highlighter tool. Persistent. */
  manual: 'manual',
} as const;

let idCounter = 0;

function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

const EMPTY: readonly Highlight[] = Object.freeze([]);

export class HighlightManager {
  private state: HighlightState = { highlights: EMPTY, activeId: null, version: 0 };
  private byPage = new Map<number, readonly Highlight[]>();
  private readonly listeners = new Set<() => void>();

  // ─── reads ───────────────────────────────────────────────────────────────

  getSnapshot = (): HighlightState => this.state;

  /** Stable between mutations — safe as a `useSyncExternalStore` snapshot. */
  getPageHighlights = (pageNumber: number): readonly Highlight[] =>
    this.byPage.get(pageNumber) ?? EMPTY;

  getById(id: string): Highlight | undefined {
    return this.state.highlights.find((highlight) => highlight.id === id);
  }

  getGroup(group: string): Highlight[] {
    return this.state.highlights.filter((highlight) => highlight.group === group);
  }

  getActive(): Highlight | null {
    if (!this.state.activeId) return null;
    return this.getById(this.state.activeId) ?? null;
  }

  /** Pages that currently carry at least one highlight. */
  get activePages(): number[] {
    return [...this.byPage.keys()].sort((a, b) => a - b);
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // ─── writes ──────────────────────────────────────────────────────────────

  add(input: HighlightInput, options: { activate?: boolean } = {}): Highlight {
    const highlight = normalizeInput(input);
    this.commit(
      [...this.state.highlights, highlight],
      options.activate === true ? highlight.id : this.state.activeId
    );
    return highlight;
  }

  /**
   * Replaces every highlight in a group in one atomic update — the correct way
   * to swap the current citation or a page of find results.
   */
  setGroup(
    group: string,
    inputs: readonly HighlightInput[],
    options: { activateFirst?: boolean; activeIndex?: number } = {}
  ): Highlight[] {
    const created = inputs.map((input) => normalizeInput({ ...input, group }));
    const kept = this.state.highlights.filter((highlight) => highlight.group !== group);

    let activeId = this.state.activeId;
    // If the highlight that was active belonged to this group, it is gone now.
    if (activeId && !kept.some((highlight) => highlight.id === activeId)) activeId = null;

    if (options.activeIndex !== undefined && created[options.activeIndex]) {
      activeId = created[options.activeIndex].id;
    } else if (options.activateFirst && created.length > 0) {
      activeId = created[0].id;
    }

    this.commit([...kept, ...created], activeId);
    return created;
  }

  remove(id: string): void {
    const next = this.state.highlights.filter((highlight) => highlight.id !== id);
    if (next.length === this.state.highlights.length) return;
    this.commit(next, this.state.activeId === id ? null : this.state.activeId);
  }

  clearGroup(group: string): void {
    const next = this.state.highlights.filter((highlight) => highlight.group !== group);
    if (next.length === this.state.highlights.length) return;
    const activeId =
      this.state.activeId && next.some((highlight) => highlight.id === this.state.activeId)
        ? this.state.activeId
        : null;
    this.commit(next, activeId);
  }

  clear(): void {
    if (this.state.highlights.length === 0 && this.state.activeId === null) return;
    this.commit(EMPTY, null);
  }

  setActive(id: string | null): void {
    if (this.state.activeId === id) return;
    if (id !== null && !this.getById(id)) return;
    this.commit(this.state.highlights, id);
  }

  // ─── internals ───────────────────────────────────────────────────────────

  private commit(highlights: readonly Highlight[], activeId: string | null): void {
    this.state = { highlights, activeId, version: this.state.version + 1 };
    this.byPage = groupByPage(highlights);
    for (const listener of this.listeners) listener();
  }
}

function groupByPage(highlights: readonly Highlight[]): Map<number, readonly Highlight[]> {
  const byPage = new Map<number, Highlight[]>();
  for (const highlight of highlights) {
    const list = byPage.get(highlight.pageNumber);
    if (list) list.push(highlight);
    else byPage.set(highlight.pageNumber, [highlight]);
  }
  return byPage as Map<number, readonly Highlight[]>;
}

function normalizeInput(input: HighlightInput): Highlight {
  const group = input.group ?? HIGHLIGHT_GROUPS.citation;
  return {
    id: input.id ?? nextId(group),
    group,
    pageNumber: input.pageNumber,
    ranges: input.ranges ?? null,
    rects: input.rects,
    color: input.color ?? DEFAULT_HIGHLIGHT_COLOR,
    activeColor: input.activeColor ?? DEFAULT_ACTIVE_COLOR,
    label: input.label ?? '',
    strategy: input.strategy ?? 'bounded',
    expandToLine: input.expandToLine ?? false,
    annotationId: input.annotationId ?? '',
    createdAt: Date.now(),
  };
}
