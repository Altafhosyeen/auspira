/**
 * Surface tokens shared by the full-page list screens — Awareness (`/projects/signals`) and
 * Watchtower & Action Queue (`/projects/watchtower-queue`).
 *
 * Both screens are the same shape of thing: a filter toolbar over a table of matters, one
 * navigation hop apart. They were built separately and had drifted on every axis a user reads
 * as "same product" — pill radius (lg vs full), pill weight, toolbar placement (band inside the
 * table card vs its own card), card radius (xl vs 2xl) and column-header casing (Title Case vs
 * UPPERCASE). Defining the surface once here is what keeps them from drifting again.
 *
 * Only layout/colour lives here. What each page filters on, and how, stays with the page.
 */

/** Focus ring shared by every interactive control on these pages. */
export const FOCUS_RING =
  'focus-visible:ring-2 focus-visible:ring-main-p/30 focus-visible:outline-none';

/** Card elevation used by the toolbar, the table card and each matter card. */
export const CARD_SHADOW = 'shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]';

/**
 * The filter toolbar. Deliberately its own card sitting above the table rather than a band
 * inside it — the toolbar acts on the table but is not part of the data, and the separation is
 * what lets the table card start at its column headers on both screens.
 *
 * Explicitly `flex-nowrap`: the controls are one row of peers, and letting them wrap dropped the
 * search/reset cluster onto a second line the moment the pills grew (a count badge appearing is
 * enough), which reads as two unrelated toolbars stacked. The narrow-viewport story is horizontal
 * scroll — the same choice the queue table makes — with `SEARCH_INPUT` giving up width first so
 * scrolling only ever kicks in once there is genuinely nothing left to give.
 *
 * `scrollbar-none` hides that overflow's scrollbar chrome without disabling the scrolling itself.
 * The app draws a permanent 10px scrollbar (see globals.css), and inside a single-row toolbar that
 * track sat under the controls and ate a tenth of the bar's height — visible as a grey rail across
 * the toolbar even at widths where nothing was actually clipped.
 */
export const FILTER_BAR = `flex flex-nowrap items-center gap-2.5 overflow-x-auto scrollbar-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 ${CARD_SHADOW}`;

/**
 * The right-hand cluster (search + reset). `shrink` is what lets the search inside it absorb a
 * squeeze instead of the row overflowing.
 *
 * `ms-auto` (not `ml-auto`) so the push respects writing direction. It still pins the cluster to
 * the trailing edge — the filters and the controls that act on them are two groups, and letting
 * the search drift left of the edge left it floating mid-row with dead space on both sides. The
 * space this opens between the date pill and the search is the gap *between* those two groups,
 * which is why the row now reads as filters | search+reset rather than one undifferentiated strip.
 */
export const FILTER_BAR_TRAILING = 'ms-auto flex min-w-0 shrink items-center gap-2';

/**
 * Shared pill geometry. Filter tabs, dropdown triggers, the date picker and the reset control
 * all sit on the same 32px track with the same radius, so a toolbar reads as one row of controls
 * rather than a mix of shapes. `shrink-0` keeps a squeezed toolbar from squashing labels — the
 * search gives up its width first.
 */
export const PILL_BASE =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] leading-4 font-medium transition-colors duration-200 ease-in-out';
export const PILL_IDLE =
  'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50';
export const PILL_ACTIVE = 'border-main-p/25 bg-main-p/8 text-main-p';

/** Search field — same 32px track as the pills it sits beside.
 *
 *  `w-60!` (15rem) is sized to the "Search signals…" placeholder and its icon, so the field reads
 *  as one more control in the row rather than an oversized box.
 *
 *  The `!` is required, like the ones beside it: this class lands on antd's own
 *  `.ant-input-affix-wrapper` (the span it wraps a prefixed/clearable Input in), and antd's
 *  runtime CSS-in-JS sets `width: 100%` on that element from a stylesheet injected at a higher
 *  precedence than Tailwind's utility layer. Without it the field stretched to fill the whole
 *  trailing cluster and no plain `w-*` had any effect.
 *
 *  It still gives up width first (`shrink`, down to `min-w`) so a narrow toolbar squeezes the
 *  search rather than the pills' labels — the floor stays under the resting width, since a
 *  `min-w` above it would pin the field and push the squeeze onto the pills instead. */
export const SEARCH_INPUT =
  'h-8 w-60! min-w-[6.5rem] shrink rounded-full! border-slate-200! bg-slate-50! text-[13px]!';

/** Class hook for the antd DatePicker rendered inside a filter toolbar; see globals.css. antd
 *  paints the control's height, font and focus shadow from its own theme, so those four rules
 *  can only be reached from a stylesheet — Tailwind utilities on the wrapper never land on the
 *  inner `<input>`. */
export const FILTER_DATE_PICKER = 'list-filter-date-picker';

/** The table's outer card. */
export const TABLE_CARD = `overflow-hidden rounded-2xl border border-slate-200 bg-white ${CARD_SHADOW}`;

/** Fill of the table's column-header band. Draws from the app-wide token so these tables and
 *  every Ant table stay the same colour. */
export const TABLE_HEADER_BG = 'bg-surface-table-header';

/** Column labels in the header band. Uppercase and tracked out so the band reads as structure
 *  rather than as another row of content. */
export const TABLE_HEADER_LABEL = 'text-[11px] font-bold tracking-wider text-slate-500 uppercase';

/**
 * Row-end "open" affordance — the bordered document button that closes every register and queue
 * row (CE register, EW register, the two dashboard panels, the Awareness list, the Watchtower
 * queue). At rest it is a quiet navy glyph in an outlined box; under the cursor the box lifts to
 * white with a soft shadow and the glyph turns blue, so the row reads as one live target.
 *
 * Defined once because these six tables were built separately and drifted on exactly the axes a
 * user reads as "same product": glyph (chevron vs document), resting colour, box size and radius.
 *
 * Requires `group` on the row element for the hover to carry from anywhere in the row.
 * `cursor-pointer` belongs here rather than on each row: a real `<button>` (and antd's Button)
 * resets the cursor to the default arrow, so it does not inherit the row's pointer and the one
 * control the row is actually pointing at was the one place that stopped reading as clickable.
 * Trailing `!` throughout — antd's Button paints its own size, border and text colour, and Tailwind v4
 * takes the bang at the end of the utility, not the front.
 */
export const ROW_OPEN_BUTTON =
  'flex h-8! w-8! shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200! text-text! transition-all duration-200 ease-in-out group-hover:border-transparent! group-hover:bg-white! group-hover:text-blue-600! group-hover:shadow-sm! hover:border-transparent! hover:bg-white! hover:text-blue-600! hover:shadow-sm!';

/** The glyph inside {@link ROW_OPEN_BUTTON} — lucide's `FileTextIcon` at 16px on every screen. */
export const ROW_OPEN_ICON = 'h-4 w-4';
