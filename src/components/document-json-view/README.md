# Document Review — Reusable Structure

This folder implements a reusable "Document Review" dashboard: a header, page
thumbnails, and a document viewer (cover page / info sheet / fallback pages)
that are **identical for every document type**, plus a left-hand "Metadata
Panel" that is **swapped per document type**.

## Folder layout

```
document-json-view/
  shared/                     <- reusable across ALL document types, do not duplicate
    types.ts                  <- DocumentMeta, BadgeProps, DashboardState, ViewMode
    DocumentReviewLayout.tsx  <- the shell: header + thumbnails + viewer + {children}
    DashboardHeader.tsx        (props-driven via `meta`)
    DocumentViewer.tsx          (props-driven via `meta`)
    DocumentCoverPage.tsx        (page 1, props-driven via `meta`)
    DocumentInfoSheetPage.tsx     (page 2, props-driven via `meta`)
    DocumentFallbackPage.tsx       (pages > 2, generic placeholder)
    ThumbnailStrip.tsx
    RefBadge.tsx
    SectionHeader.tsx

  view-scope-document/        <- "Scope of Works" metadata panel (existing)
    constants.ts              <- SCOPE_DOCUMENT_META + JsonDataScopeDocument
    types.ts                  <- DocumentMeta + JsonScopeDocument data shapes
    JsonMetadataPanel.tsx     <- renders JsonDataScopeDocument generically by section id
    CitationBadge.tsx         <- maps a JsonCitation onto RefBadge

  ViewScopeDocument.tsx       <- page entry: <DocumentReviewLayout meta={...}><MetadataPanel /></DocumentReviewLayout>

  conditions-of-contract/     <- placeholder for next document type
  contract-data-part-1/
  contract-data-part-2/
  form-of-agreement/
  hsqe-requirements/
  site-information/
  z-clauses/
```

## Adding a new document type

1. **Create a `<DocType>_DOCUMENT_META` constant** of type `DocumentMeta`
   (see `shared/types.ts`) — this drives the header title/subtitle, cover
   page, info sheet, page count, and "open in new tab" file URL.

2. **Build a `MetadataPanel`** for the new document type inside its own
   folder (e.g. `site-information/MetadataPanel.tsx`), composed from
   smaller section components (use `RefBadge` / `SectionHeader` from
   `shared/` for consistent styling).

3. **Wire up the page entry component**:

   ```tsx
   'use client';

   import { DocumentReviewLayout } from '../shared/DocumentReviewLayout';
   import { MetadataPanel } from './MetadataPanel';
   import { SITE_INFO_DOCUMENT_META } from './constants';

   export default function ViewSiteInformationDocument() {
     return (
       <DocumentReviewLayout meta={SITE_INFO_DOCUMENT_META}>
         <MetadataPanel />
       </DocumentReviewLayout>
     );
   }
   ```

   For a JSON-driven panel (see `view-scope-document/JsonMetadataPanel.tsx`),
   type the source data as a `JsonScopeDocument`-like shape (summary cards +
   `sections[]`, each with an `id` and a `citation` per item) and switch on
   `section.id` to pick the renderer — this lets the panel be regenerated
   whenever the backend JSON changes without touching component code.

4. Point the corresponding `app/(dashboard)/projects/<doc-type>/[id]/page.tsx`
   at the new component.

## Rules

- Never duplicate `shared/` components into a per-document folder — import
  from `../shared/...`.
- Header, cover page, info sheet, thumbnails, and viewer chrome must stay
  visually identical across document types — only `meta` values and the
  `MetadataPanel` children differ.
- Per-document data (arrays of clauses, specs, obligations, etc.) lives in
  that document's own `constants.ts` + `types.ts`.
