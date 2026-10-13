# PDF Highlight Engine

Click a value in the JSON panel → the viewer navigates to the page, finds the
exact text, and highlights only that occurrence. Survives zoom, rotation,
virtualisation, and 1000+ page documents.

Built on **react-pdf v10 / pdf.js 5**. It does not replace react-pdf — it
renders the same `pdfjs.TextLayer` react-pdf renders, and attaches to that DOM.

---

## Layout

```
lib/pdf-highlight/            framework-agnostic engine (no React import anywhere)
  types.ts                    every interface; the pdf.js proxy types are derived, not imported
  constants.ts                every tunable in one reviewable place
  utils/
    normalizeText.ts          index-preserving normalisation (the map is the point)
    buildIndex.ts             TextContent → PageIndex
    mapCharacterOffsets.ts    char range → text-item slices  (SpanMapper's arithmetic)
    searchText.ts             the strategy ladder            (SearchEngine's matching)
    highlightSpans.ts         slices → rectangles            (HighlightRenderer's geometry)
  core/
    TextNormalizer.ts         configured, memoising normaliser
    PDFSearchIndex.ts         per-document LRU page-index cache
    SearchEngine.ts           orchestrates matching across pages
    SpanMapper.ts             registry of mounted pages + range → rects
    HighlightManager.ts       observable highlight store (groups, active, per-page snapshots)
    HighlightRenderer.ts      measurement cache keyed by (highlight, rotation)
    NavigationManager.ts      scrolling that lands where it aimed

components/pdf-highlight/     React bindings
  HighlightContext.tsx        provides manager / spanMapper / renderer / navigation
  SearchIndexProvider.tsx     provides PDFSearchIndex + SearchEngine for the open document
  PdfViewer.tsx               toolbar, virtualisation, find bar
  PdfPage.tsx                 canvas + text layer + DOM handle registration
  HighlightLayer.tsx          the rectangles
  hooks/
    usePdfIndex.ts            usePdfIndex / usePinnedPages / useDocumentIndexing
    usePdfSearch.ts           find-in-document state machine
    useHighlight.ts           usePageHighlights / useHighlightActions / useCitationHighlight
    useScrollToPage.ts        navigation bindings

tests/pdf-highlight/          59 unit tests over the pure engine
```

### Why each file exists

| File                     | Exists because                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normalizeText.ts`       | `toLowerCase().replace(…)` destroys the link between a normalised character and its source. Everything downstream needs that link, so normalisation emits a `map` alongside the text. |
| `buildIndex.ts`          | The page must be read **once**, not on every click. It also decides where word breaks really are, using geometry rather than assuming one space per text item.                        |
| `mapCharacterOffsets.ts` | A match is found in normalised space but has to be drawn on real spans. This is the projection, and it is pure arithmetic on typed arrays — no DOM.                                   |
| `searchText.ts`          | pdf.js splits text a dozen different ways. One matching strategy cannot cover them; this is the ladder that does.                                                                     |
| `highlightSpans.ts`      | Two measurement paths (DOM ranges, PDF geometry) and the merge that turns a dozen touching rects into one clean bar.                                                                  |
| `TextNormalizer.ts`      | Guarantees the index and the query are normalised **identically** — get that wrong and nothing ever matches — and memoises the per-character fold, which is the hot path of indexing. |
| `PDFSearchIndex.ts`      | Pages unmount constantly under virtualisation; the cache must outlive them. LRU + pinning + in-flight de-duplication make it safe on a 1000-page file.                                |
| `SearchEngine.ts`        | Two jobs with opposite shapes — "resolve this citation" (one page, stop early) and "find every occurrence" (whole document, chunked, cancellable) — need different orchestration.     |
| `SpanMapper.ts`          | The only component that knows a page is mounted. Everything else asks it to measure and gets rectangles, geometry-derived rectangles, or `null`.                                      |
| `HighlightRenderer.ts`   | Enforces _measure once per (highlight, rotation)_. This single rule is what makes zoom free and virtualisation flicker-free.                                                          |
| `HighlightManager.ts`    | Highlights need groups (citation / find / manual) so one can be replaced without touching the others, and snapshots stable enough for `useSyncExternalStore`.                         |
| `NavigationManager.ts`   | Scrolling in a virtualised list is a feedback loop. Client-rect positioning, a settle loop, and token cancellation are what stop a jump to page 40 landing on page 38.                |

---

## How search works

A value extracted by an LLM almost never appears in the PDF exactly as the JSON
spells it. `String.includes` fails on every row below:

| JSON          | PDF                    | Caught by                    |
| ------------- | ---------------------- | ---------------------------- |
| `John Smith`  | `John Smith`           | `bounded`                    |
| `John Smith`  | `JOHN SMITH`           | `bounded` (case folded)      |
| `John Smith`  | `John  Smith`          | `bounded` (spaces collapsed) |
| `John Smith`  | `John\nSmith`          | `bounded` (newline → space)  |
| `John Smith`  | `John-\nSmith`         | `bounded` (hyphen → space)   |
| `John Smith`  | `John Sm` + `ith` runs | `compact`                    |
| `insurance`   | `Reinsurance`          | `exact`                      |
| `Z62.2`       | `Z.62.2` / `Z 62 2`    | `clause`                     |
| `X2 X7 X16`   | each code its own table cell | `code-list`            |
| long sentence | reworded / reflowed    | `fuzzy`                      |

Eight tiers, tried in order. **The first tier that produces any hit wins** — all
of its hits are returned, so duplicates are all reported and the caller decides.
Scores are `tier + matched characters + context bonus`, so a weaker tier can
never outrank a stronger one however long its match is.

1. **`short-code`** — a 1–3 letter ALL-CAPS code (an NEC option letter). Matched
   case-sensitively against a case-preserved parallel of the page text, because
   a lowercase `a` appears constantly in body text and would win otherwise.
2. **`clause`** — `Z62.2` compiled to a pattern whose separators are optional,
   so it hits every way the document punctuates it.
3. **`bounded`** — exact, on word boundaries. The common case.
4. **`exact`** — substring. Unbounded for a find-in-document query (Ctrl+F
   behaviour); word-start-anchored for a citation.
5. **`compact`** — **both sides with every space removed.** This is the tier that
   solves "PDF.js splits text": `John-\nSmith`, `John  Smith`, `Joh` + `n Smith`
   and `JOHN SMITH` all collapse to `johnsmith`.
6. **`code-list`** — a citation that is a *list* of NEC-style codes
   (`X2 X7 X11 X15 X16 X18`) rather than a phrase. Each code is searched
   independently and every one found on the page becomes its own highlighted
   range, instead of gambling on the single arbitrary word `fuzzy`/`token`
   would otherwise peel off or land on.
7. **`fuzzy`** — aligns the needle's words against the page's, in order,
   tolerating up to 2 inserted page words and 2 missing needle words. If the
   alignment covers less than half the needle, it instead peels off the longest
   runs that _are_ present and highlights each where it really sits.
8. **`token`** — the single most distinctive word, so a citation lands somewhere
   rather than nowhere. A bare number is refused unless it is the only one on the
   page.

Three shapes get a ladder of exactly one rung: a **short code** and a **clause
number** are exact identifiers, and a looser tier would match `Z44.4` inside
`Z44.44` — a _different clause_. A **code list** stops at its own tier for a
different reason — falling through to `fuzzy`/`token` would confidently
highlight one unrelated occurrence of a single code rather than the cited set.
Highlighting nothing beats confidently highlighting the wrong thing.

`SearchEngine.locate()` searches the cited page, then ±2 pages, then the whole
document. Extracted page numbers are usually right but occasionally off by one
where a document's printed numbering differs from its physical order.

## How span mapping works

`PageIndex.items[i]` is deliberately the same `i` as `TextLayer.textDivs[i]`.
pdf.js pushes one `textDivs` entry per `textContent.items` entry that carries a
`str`, and skips marked-content markers — mirroring that filter exactly gives an
**O(1) map from text item to rendered span**, so nothing ever calls
`querySelectorAll`.

Indexing records two parallel arrays. `itemOf[i]` is the item that produced
normalised character `i`; `offsetOf[i]` is that character's offset inside the
item's _raw_ string:

```
normalized :  j  o  h  n  ␣  s  m  i  t  h
itemOf     :  0  0  0  0 -1  1  1  1  1  1      -1 = injected word break
offsetOf   :  0  1  2  3 -1  1  2  3  4  5      offset inside items[n].str
                                 ▲
   range [5,10) → slice { item 1, chars 1‥6 } → Range(span#1.firstChild, 1, 6)
```

The slice goes straight into a DOM `Range`, and `range.getClientRects()` returns
the true glyph geometry — proportional font advances included, and after the
`transform: scaleX(…)` pdf.js applies to squeeze text to its measured width.
That is why highlighting half a word lands on exactly half the word.

The mapping also absorbs the awkward cases for free: a ligature that expands
(`ﬁ` → two normalised characters from one source character) credits both to the
same source offset, and punctuation the index dropped (`walls,` → `walls`) never
shifts the raw offsets, because the raw offsets were recorded, not re-derived.

There is a fallback. When the text layer has not rendered, or pdf.js refused to
build spans (it caps at 100 000 text divs), geometry is derived from the item's
own transform projected through the page viewport. It is approximate about
character positions but never wrong about which line the text is on, and it lets
a highlight appear before the text layer exists.

## How duplicate matching works

Every occurrence is returned, ranked. Three mechanisms pick between them:

- **Context hints.** Pass sibling values from the same JSON record as
  `contextHints`. Occurrences near one of them score higher, decaying with
  character distance — the same cue a human uses when scanning for the right row
  of a table.
- **Occurrence index.** `locate({ occurrence: n })` selects the nth, wrapping.
- **Cycling.** `useCitationHighlight` remembers the last request; clicking the
  same value again advances to the next occurrence, like "find next".

## How the highlight survives zoom

Rectangles are stored as **fractions of the page box** (0–1) and rendered as CSS
percentages. The page element scales uniformly, so `left: 43.1%` is still
pixel-correct at 50% and at 300%. Nothing is re-measured, no layout is thrashed,
and there is no frame where the highlight is in the wrong place.

`HighlightRenderer` keys its cache on `(highlight, rotation)` — deliberately
**not** on scale:

| Event                | Cache         | Result                                     |
| -------------------- | ------------- | ------------------------------------------ |
| Zoom                 | hit           | CSS re-layout only. No JS, no measurement. |
| Rotate               | miss          | Re-measured once; geometry really changed. |
| Page virtualised out | untouched     | —                                          |
| Page scrolls back in | hit           | Painted on the first frame. No flash.      |
| New highlight        | miss          | Measured once.                             |
| Highlight removed    | that key only | Other highlights unaffected.               |

Layer order matters too:

```
z 0   <canvas>          the rendered page
z 1   HighlightLayer    percentages, pointer-events: none
z 2   .textLayer        transparent selectable pdf.js spans
```

Highlights sit _above_ the canvas, so a redraw can never erase them (the old
implementation painted onto the canvas and lost every highlight on each zoom),
and _below_ the text, so selection and the highlighter tool still work through
them. `mix-blend-mode: multiply` keeps the glyphs legible instead of washing
them out.

---

## Usage

### The whole viewer

```tsx
import { PdfViewer } from '@/components/pdf-highlight';

<PdfViewer
  fileUrl={url}
  title={name}
  activePage={page}
  searchText={value} //  the clicked JSON value
  searchPage={page} //   the page it cites
  highlightNonce={nonce} // bump to re-trigger on a repeat click
  contextHints={siblingValues} // disambiguates duplicates
  onHighlightResult={(found) => setNotFound(!found)}
  onOpenInNewTab={open}
/>;
```

### Just the engine

```ts
import { PDFSearchIndex, SearchEngine } from '@/lib/pdf-highlight';

const index = new PDFSearchIndex(pdf);
const engine = new SearchEngine(index);

const match = await engine.locate('John Smith', {
  page: 4,
  contextHints: ['Project Manager'],
});
// → { pageNumber, start, end, ranges, strategy, score, text }
```

### Around a react-pdf `<Page>`

The engine's DOM contract is _"a page element, and `TextLayer.textDivs`"_ —
which is exactly what react-pdf's `<Page>` produces. Register a handle from
`onRenderTextLayerSuccess` and everything else works unchanged:

```tsx
<HighlightProvider>
  <SearchIndexProvider pdf={pdf}>
    <Document file={url}>
      <Page
        pageNumber={n}
        onRenderTextLayerSuccess={() => {
          spanMapper.registerPage({
            pageNumber: n,
            pageElement: pageRef.current!,
            textLayerElement: pageRef.current!.querySelector('.textLayer'),
            textDivs: [...pageRef.current!.querySelectorAll('.textLayer > span')],
            viewport,
            rotation,
            renderKey: ++keyRef.current,
          });
        }}
      />
      <HighlightLayer pageNumber={n} pageIndex={idx} rotation={rot} renderKey={key} />
    </Document>
  </SearchIndexProvider>
</HighlightProvider>
```

`components/pdf-highlight/PdfPage.tsx` owns the render lifecycle directly rather
than using `<Page>`, because virtualisation mounts and unmounts pages faster
than `<Page>`'s teardown can keep up with — under StrictMode it loses the race
and throws `sendWithPromise of null`. The output is otherwise identical.

## Performance

| Concern                        | How it is handled                                                        |
| ------------------------------ | ------------------------------------------------------------------------ |
| DOM search on every click      | Never happens. Ranges resolve to spans by array index.                   |
| `getTextContent()` per render  | Once per page per document, LRU-cached at 250 pages.                     |
| Re-measuring on zoom           | Never. Fractions are scale-invariant.                                    |
| Blocking on a 1000-page search | Chunked 8 pages at a time, yields to the main thread, `AbortSignal`.     |
| Re-rendering the whole viewer  | Per-page `useSyncExternalStore`; a hit on page 700 cannot touch page 12. |
| Search churn while typing      | Every request supersedes the last through an `AbortController`.          |
| Background indexing            | `requestIdleCallback` with a 12 ms budget; started when find opens.      |
