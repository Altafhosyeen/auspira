/**
 * Scrolling that lands where it was aimed.
 *
 * Naive `scrollIntoView` on a virtualised viewer misses, and the reason is a
 * feedback loop: scrolling changes which pages are mounted, mounting a page
 * replaces a fixed-height placeholder with a real canvas, that changes the
 * document height, and the target moves out from under the animation. The
 * result is the familiar "jumps to page 40, ends up on page 38" bug.
 *
 * Three things fix it here:
 *
 * 1. **Positions come from `getBoundingClientRect`, not `offsetTop`** — correct
 *    regardless of which ancestor happens to be the offset parent.
 * 2. **A settle loop** re-checks the target for a few frames after scrolling
 *    and corrects any drift, so late-mounting pages cannot leave it stranded.
 * 3. **Token-based cancellation** means a second navigation instantly abandons
 *    the first instead of the two fighting over `scrollTop`.
 */
import {
  NAVIGATION_SETTLE_TIMEOUT_MS,
  READING_ALIGN_RATIO,
  SMOOTH_SCROLL_MAX_DISTANCE,
} from '../constants';
import type { NormalizedRect, ScrollOptions } from '../types';

/** Pixels of drift tolerated before a correcting scroll is issued. */
const DRIFT_TOLERANCE_PX = 4;

/** Frames the settle loop watches after the initial scroll. */
const SETTLE_FRAMES = 6;

export class NavigationManager {
  private container: HTMLElement | null = null;
  private readonly pages = new Map<number, HTMLElement>();
  private token = 0;
  private frame: number | null = null;

  setContainer(element: HTMLElement | null): void {
    this.container = element;
  }

  getContainer(): HTMLElement | null {
    return this.container;
  }

  registerPage(pageNumber: number, element: HTMLElement | null): void {
    if (element) this.pages.set(pageNumber, element);
    else this.pages.delete(pageNumber);
  }

  unregisterPage(pageNumber: number): void {
    this.pages.delete(pageNumber);
  }

  getPageElement(pageNumber: number): HTMLElement | undefined {
    return this.pages.get(pageNumber);
  }

  /** Abandons any in-flight navigation. */
  cancel(): void {
    this.token++;
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  /**
   * The page number occupying most of the viewport — the one a page indicator
   * should show. Derived from real geometry rather than from scroll maths, so
   * it stays right at any zoom or rotation.
   */
  getMostVisiblePage(): number | null {
    const container = this.container;
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    let best: number | null = null;
    let bestOverlap = 0;

    for (const [pageNumber, element] of this.pages) {
      const rect = element.getBoundingClientRect();
      const overlap =
        Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        best = pageNumber;
      }
    }
    return best;
  }

  /** Scrolls a page into view, waiting for it to mount if necessary. */
  async scrollToPage(pageNumber: number, options: ScrollOptions = {}): Promise<boolean> {
    return this.run(pageNumber, null, { align: 'start', ...options });
  }

  /**
   * Scrolls so a rectangle *inside* a page is comfortably in view.
   *
   * `rect` is in page fractions, which is what makes this immune to zoom: the
   * caller never has to convert anything, and a highlight measured at 100% is
   * scrolled to correctly at 250%.
   */
  async scrollToRect(
    pageNumber: number,
    rect: NormalizedRect,
    options: ScrollOptions = {}
  ): Promise<boolean> {
    return this.run(pageNumber, rect, { align: 'reading', ...options });
  }

  // ─── internals ───────────────────────────────────────────────────────────

  private async run(
    pageNumber: number,
    rect: NormalizedRect | null,
    options: ScrollOptions
  ): Promise<boolean> {
    this.cancel();
    const token = this.token;

    const element = await this.waitForPage(pageNumber, token);
    if (!element || token !== this.token) return false;

    const container = this.container;
    if (!container) return false;

    const target = this.computeTarget(container, element, rect, options);
    const distance = Math.abs(target - container.scrollTop);
    const behavior: ScrollBehavior =
      options.behavior ??
      (distance > container.clientHeight * SMOOTH_SCROLL_MAX_DISTANCE ? 'auto' : 'smooth');

    container.scrollTo({ top: target, behavior });
    await this.settle(pageNumber, rect, options, token, behavior);
    return token === this.token;
  }

  /**
   * Where the container's `scrollTop` needs to be.
   *
   * Measured from live client rects, so a page that has just swapped its
   * placeholder for a canvas is handled correctly without any bookkeeping of
   * page heights.
   */
  private computeTarget(
    container: HTMLElement,
    element: HTMLElement,
    rect: NormalizedRect | null,
    options: ScrollOptions
  ): number {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const targetTop = rect ? elementRect.top + rect.y * elementRect.height : elementRect.top;
    const targetHeight = rect ? rect.h * elementRect.height : elementRect.height;
    const delta = targetTop - containerRect.top;

    const align = options.align ?? 'reading';
    const padding = options.offset ?? 8;

    let offset: number;
    if (align === 'center') {
      offset = Math.max(padding, container.clientHeight / 2 - targetHeight / 2);
    } else if (align === 'reading') {
      offset = Math.max(padding, Math.floor(container.clientHeight * READING_ALIGN_RATIO));
    } else {
      offset = padding;
    }

    const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
    return Math.min(Math.max(0, container.scrollTop + delta - offset), maxScroll);
  }

  /** Resolves once the page element exists, or when the deadline passes. */
  private waitForPage(pageNumber: number, token: number): Promise<HTMLElement | null> {
    const existing = this.pages.get(pageNumber);
    if (existing?.isConnected) return Promise.resolve(existing);

    return new Promise((resolve) => {
      const deadline = performance.now() + NAVIGATION_SETTLE_TIMEOUT_MS;
      const poll = () => {
        if (token !== this.token) return resolve(null);
        const element = this.pages.get(pageNumber);
        if (element?.isConnected) return resolve(element);
        if (performance.now() > deadline) return resolve(null);
        this.frame = requestAnimationFrame(poll);
      };
      this.frame = requestAnimationFrame(poll);
    });
  }

  /**
   * Watches the target for a few frames and corrects drift.
   *
   * Only issues a correction when the error exceeds a few pixels, so it never
   * fights a smooth-scroll animation that is simply still in progress.
   */
  private settle(
    pageNumber: number,
    rect: NormalizedRect | null,
    options: ScrollOptions,
    token: number,
    behavior: ScrollBehavior
  ): Promise<void> {
    return new Promise((resolve) => {
      let frames = 0;
      const tick = () => {
        if (token !== this.token) return resolve();

        const container = this.container;
        const element = this.pages.get(pageNumber);
        if (!container || !element?.isConnected) return resolve();

        if (behavior === 'auto' || frames >= SETTLE_FRAMES / 2) {
          const target = this.computeTarget(container, element, rect, options);
          if (Math.abs(target - container.scrollTop) > DRIFT_TOLERANCE_PX) {
            container.scrollTo({ top: target, behavior: 'auto' });
          }
        }

        if (++frames >= SETTLE_FRAMES) return resolve();
        this.frame = requestAnimationFrame(tick);
      };
      this.frame = requestAnimationFrame(tick);
    });
  }
}
