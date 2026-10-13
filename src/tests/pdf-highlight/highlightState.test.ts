import { describe, expect, it, vi } from 'vitest';
import { HIGHLIGHT_GROUPS, HighlightManager, boundingRect, mergeRects } from '@/lib/pdf-highlight';

describe('HighlightManager', () => {
  it('hands out a referentially stable page snapshot between mutations', () => {
    const manager = new HighlightManager();
    manager.add({ pageNumber: 4, ranges: [{ start: 0, end: 5 }] });

    const first = manager.getPageHighlights(4);
    const second = manager.getPageHighlights(4);
    // Required by useSyncExternalStore — a new array each call is an infinite loop.
    expect(second).toBe(first);
  });

  it('returns the same empty array for every page with nothing on it', () => {
    const manager = new HighlightManager();
    expect(manager.getPageHighlights(1)).toBe(manager.getPageHighlights(900));
  });

  it('replaces a group atomically, which is how the previous citation is removed', () => {
    const manager = new HighlightManager();
    manager.setGroup(HIGHLIGHT_GROUPS.citation, [
      { pageNumber: 4, ranges: [{ start: 0, end: 5 }] },
    ]);
    manager.setGroup(
      HIGHLIGHT_GROUPS.citation,
      [{ pageNumber: 9, ranges: [{ start: 2, end: 8 }] }],
      { activateFirst: true }
    );

    expect(manager.getPageHighlights(4)).toHaveLength(0);
    expect(manager.getPageHighlights(9)).toHaveLength(1);
    expect(manager.getActive()?.pageNumber).toBe(9);
  });

  it('leaves other groups untouched when one is replaced', () => {
    const manager = new HighlightManager();
    manager.add({ pageNumber: 1, group: HIGHLIGHT_GROUPS.manual, rects: [] });
    manager.setGroup(HIGHLIGHT_GROUPS.find, [{ pageNumber: 1, ranges: [{ start: 0, end: 3 }] }]);

    expect(manager.getGroup(HIGHLIGHT_GROUPS.manual)).toHaveLength(1);
    expect(manager.getGroup(HIGHLIGHT_GROUPS.find)).toHaveLength(1);
  });

  it('drops the active id when the highlight holding it goes away', () => {
    const manager = new HighlightManager();
    const highlight = manager.add(
      { pageNumber: 1, ranges: [{ start: 0, end: 3 }] },
      { activate: true }
    );
    expect(manager.getSnapshot().activeId).toBe(highlight.id);

    manager.remove(highlight.id);
    expect(manager.getSnapshot().activeId).toBeNull();
  });

  it('notifies subscribers exactly once per mutation', () => {
    const manager = new HighlightManager();
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);

    manager.add({ pageNumber: 1, ranges: [{ start: 0, end: 1 }] });
    manager.clear();
    expect(listener).toHaveBeenCalledTimes(2);

    // A no-op must not notify — that is what would cause a render loop.
    manager.clear();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    manager.add({ pageNumber: 1, ranges: [{ start: 0, end: 1 }] });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('mergeRects', () => {
  it('merges touching rectangles on the same line into one bar', () => {
    const merged = mergeRects(
      [
        { x: 0.1, y: 0.2, w: 0.1, h: 0.02 },
        { x: 0.2, y: 0.2, w: 0.1, h: 0.02 },
      ],
      0
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].x).toBeCloseTo(0.1);
    expect(merged[0].w).toBeCloseTo(0.2);
  });

  it('keeps rectangles on different lines separate', () => {
    const merged = mergeRects(
      [
        { x: 0.1, y: 0.2, w: 0.1, h: 0.02 },
        { x: 0.1, y: 0.3, w: 0.1, h: 0.02 },
      ],
      0
    );
    expect(merged).toHaveLength(2);
  });

  it('keeps a wide horizontal gap on the same line separate', () => {
    const merged = mergeRects(
      [
        { x: 0.1, y: 0.2, w: 0.05, h: 0.02 },
        { x: 0.6, y: 0.2, w: 0.05, h: 0.02 },
      ],
      0
    );
    expect(merged).toHaveLength(2);
  });

  it('pads vertically so descenders sit inside the highlight', () => {
    const [padded] = mergeRects([{ x: 0.1, y: 0.5, w: 0.1, h: 0.02 }], 0.25);
    expect(padded.y).toBeCloseTo(0.495);
    expect(padded.h).toBeCloseTo(0.03);
  });

  it('discards sub-pixel measurement noise', () => {
    expect(mergeRects([{ x: 0.1, y: 0.2, w: 0.1, h: 0.02 }], 0)).toHaveLength(1);
    expect(boundingRect([])).toBeNull();
  });
});

describe('boundingRect', () => {
  it('spans every rectangle it is given', () => {
    const bounds = boundingRect([
      { x: 0.1, y: 0.2, w: 0.1, h: 0.02 },
      { x: 0.4, y: 0.3, w: 0.1, h: 0.02 },
    ]);
    expect(bounds?.x).toBeCloseTo(0.1);
    expect(bounds?.y).toBeCloseTo(0.2);
    expect(bounds?.w).toBeCloseTo(0.4);
    expect(bounds?.h).toBeCloseTo(0.12);
  });
});
