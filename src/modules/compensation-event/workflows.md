# Compensation Event — Workflows

Screen-by-screen walkthrough of the six CE workflows, including sequence
diagrams and key details. For the full journey (entry points, lifecycle, state
machine, data flow) see [end-to-end-flow.md](./end-to-end-flow.md). For module
architecture and design decisions see [README.md](./README.md).

---

## 1. CE Register (List & Browse)

The register is the landing screen for the entire CE workflow.

**Route:** `/compensation-event`
**Container:** `compensation-event-list-page` → **Presentational:** `compensation-event-table`

```mermaid
sequenceDiagram
    actor User
    participant Page as List Page
    participant Hook as useGetCompensationEvents
    participant Service as compensationEventService
    participant API as Backend

    User->>Page: Navigate to /compensation-event
    Page->>Hook: useGetCompensationEvents({ projectId })
    Hook->>Service: getListByProject(projectId, { skip, top, term })
    Service->>API: GET /api/compensation-events/project/:projectId
    API-->>Service: CompensationEventPageResultDto
    Service-->>Hook: toCompensationEventListResponse(dto)
    Hook-->>Page: CompensationEvent[] (with keepPreviousData)
    Page->>Page: buildStateCounts(events) → filter pills
    Page->>Page: resolveRegisterState(status) → state badges
    Page-->>User: Table with Load More pagination

    User->>Page: Click row (CE-2024-015)
    Page->>Page: Navigate to /compensation-event/{id}
```

**Key details:**
- Uses `skipLoader: true` — the full-screen overlay never blocks list navigation.
- `keepPreviousData` prevents flash-of-empty-table when paging.
- State filtering is **client-side** — the server has no status filter endpoint yet.
- `Load More` grows `visibleCount` by 10 instead of traditional pagination.
- Legacy API statuses (`SUBMITTED`, `APPROVED`, etc.) are folded into the
  register vocabulary via `resolveRegisterState()`.
- Mock data (`MOCK_COMPENSATION_EVENT`) falls back only when the API errors or
  returns empty.

---

## 2. CE Notice (Create)

The notice form creates a new CE, optionally linked to an Early Warning.

**Route:** `/compensation-event/new`
**Container:** `compensation-event-notice-page`

```mermaid
sequenceDiagram
    actor User
    participant Page as Notice Page
    participant Hook as useCreateCompensationEventNotice
    participant ClauseHook as useGetEventClauseOptions
    participant RefHook as useVerifyCompensationEventReference
    participant Service as compensationEventService
    participant API as Backend

    User->>Page: Navigate to /compensation-event/new
    Page->>ClauseHook: useGetEventClauseOptions(projectId)
    ClauseHook->>API: GET /api/event-clauses/project/:projectId
    API-->>ClauseHook: EventClauseResponseDto[]
    ClauseHook-->>Page: Select options (splitContractClause)

    User->>Page: Fill form (To, From, Clause, Description...)
    Page->>RefHook: useVerifyCompensationEventReference (on blur)
    RefHook->>API: GET /api/compensation-events/verify-reference?Reference=X
    API-->>RefHook: { isAvailable: true }

    User->>Page: Click "Notify"
    Page->>Page: toCompensationEventNoticeInput(values, context)
    Page->>Hook: useCreateCompensationEventNotice.mutate(input)
    Hook->>Service: createNotice(FormData)
    Service->>API: POST /api/compensation-events (multipart)
    API-->>Service: CompensationEventResponseDto
    Service-->>Hook: invalidateQueries(COMPENSATION_EVENT_QUERY_KEY)
    Hook-->>Page: Success → navigate to register
```

**Key details:**
- Form data is sent as **multipart FormData** (attachments ride along).
- The right rail (progress, time bar, documents) is hidden on `/new` since there's
  no saved CE to attach them to — the form runs full width.
- `Progress %` is derived from filled fields, not hardcoded.
- `Time Bar` = `dateIssued + 14 days` (NEC4 Cl.62.3 reply period).
- Reference number is verified against the backend before submit.
- Clause options come from the project's configured clause catalogue.
- Impact & Requirements fields default to `0` since the notice screen doesn't
  collect them.

---

## 3. CE Detail (Overview)

The detail page shows the full picture of a CE after creation.

**Route:** `/compensation-event/[id]`
**Container:** `compensation-event-detail-page` → Tabs: Overview, Financials, Email Thread, Documents, Audit Trail

```mermaid
sequenceDiagram
    actor User
    participant Page as Detail Page
    participant DetailHook as useGetCompensationEventById
    participant FinHook as useGetCompensationEventFinancialSummary
    participant AuditHook as useGetAuditLogs
    participant Service as compensationEventService
    participant API as Backend

    User->>Page: Navigate to /compensation-event/{id}
    Page->>DetailHook: useGetCompensationEventById({ id })
    DetailHook->>Service: getById(id)
    Service->>API: GET /api/compensation-events/:id
    API-->>DetailHook: CompensationEventResponseDto
    DetailHook-->>Page: CompensationEvent (via toCompensationEvent)

    Page->>Page: buildCompensationEventFinancials(event)
    Page->>Page: Impact at a Glance (estimated vs implemented cost and days)
    Page->>Page: Event Details / Event Record / Contract Clause panels

    opt User clicks Financials tab
        Page->>FinHook: useGetCompensationEventFinancialSummary({ id })
        FinHook->>Service: getFinancialSummary(id)
        Service->>API: GET /api/compensation-events/:id/financial
        API-->>FinHook: CompensationEventFinancialResponseDto
        FinHook-->>Page: CompensationEventFinancials
    end

    opt User clicks Audit Trail tab
        Page->>AuditHook: useGetAuditLogs(entityId)
        AuditHook-->>Page: AuditLogEntry[] → toAuditEntry()
    end
```

**Tab architecture:**

| Tab | Component | Data Source |
|-----|-----------|-------------|
| Overview | `compensation-event-overview-tab` | `useGetCompensationEventById` |
| Financials | `compensation-event-financials-tab` | `useGetCompensationEventFinancialSummary` + client-derived figures |
| Email Thread | `compensation-event-email-thread-tab` | `useGetCompensationEventEmailThread` |
| Documents | `compensation-event-evidence-pack` | `event.evidence` (empty — awaiting backend) |
| Audit Trail | `compensation-event-audit-trail-tab` | `useGetAuditLogs` (shared infra) |

---

## 4. Contractor Quotation

The contractor submits a quotation in response to the CE notice.

**Route:** `/compensation-event/quotation/[id]?alertId=<guid>`
**Container:** `compensation-event-quotation-page`

```mermaid
sequenceDiagram
    actor Contractor
    participant Page as Quotation Page
    participant QuotHook as useQuotations
    participant AcceptHook as useAcceptQuotation
    participant RevHook as useRequestQuotationRevision
    participant Service as quotationService
    participant API as Backend

    Contractor->>Page: Navigate via Early Warning notification
    Page->>QuotHook: useGetQuotations(compensationEventId)
    QuotHook->>Service: getByCompensationEvent(id)
    Service->>API: GET /api/quotations/compensation-event/:id
    API-->>QuotHook: QuotationResponseDto[]
    QuotHook-->>Page: Quotation data

    Page->>Page: getQuotationTotal(lines) → sum line items
    Page->>Page: getTotalWithRiskAllowance(total + allowance)

    alt PM accepts quotation
        Contractor->>Page: Click "Accept Quotation"
        Page->>Page: Popconfirm ("This decision is not reversible")
        Contractor->>Page: Confirm
        Page->>AcceptHook: useAcceptQuotation.mutate({ projectAlertId })
        AcceptHook->>Service: accept({ projectAlertId })
        Service->>API: POST /api/quotations/accept
        API-->>AcceptHook: Success
        AcceptHook->>AcceptHook: invalidateQueries(CE + project-alerts)
    end

    alt PM requests revision
        Contractor->>Page: Click "Request Revised Quotation"
        Page->>Page: Open request-revision-modal (Subject + Comment + Upload Documents)
        Contractor->>Page: Fill comment, optionally attach documents
        Contractor->>Page: Click Confirm
        Page->>Page: Open confirm-action-modal (type REQUEST to unlock)
        Contractor->>Page: Confirm
        Page->>RevHook: useRequestQuotationRevision.mutate(input)
        RevHook->>Service: requestRevision({ quotationId, subject: fixed, description, attachments })
        Service->>API: POST /api/quotations/request-revision (multipart)
        API-->>RevHook: Success
        RevHook->>RevHook: invalidateQueries(CE + project-alerts)
    end
```

**Key details:**
- Every total is **derived from line items** — `getQuotationTotal` sums members;
  `getTotalWithRiskAllowance` adds the allowance.
- Accept is keyed on `projectAlertId` (from `?alertId=`), **not** the CE id.
  Without it, the button reports "unavailable" instead of sending a bad request.
- "Proceed to assessment" is a navigation action (no API call).
- The compose email modal is reusable (props-driven) and validates recipients
  before send.
- Quotation data currently uses mock data (`CONTRACTOR_QUOTATION_MOCK`).

---

## 5. PM Assessment

The project manager reviews the quotation and records their assessment.

**Route:** `/compensation-event/[id]/assessment`
**Container:** `compensation-event-assessment-page`

```mermaid
sequenceDiagram
    actor PM
    participant Page as Assessment Page
    participant Lines as Assessment Lines
    participant Days as Number of Days
    participant Comment as Comment Card

    PM->>Page: Arrive from "Proceed to assessment"
    Page->>Lines: Render quotation lines (tree data)
    Page->>Days: Display estimatedDays field
    Page->>Comment: Empty comment textarea

    PM->>Lines: Click pencil on a member row
    Lines->>Lines: Swap DESCRIPTION + AMOUNT cells to inputs
    PM->>Lines: Edit amount
    Lines->>Lines: onLineChange → setQuotationMemberAmount
    Lines->>Lines: getQuotationTotal(lines) → reprice group total

    PM->>Days: Enter assessed calendar days
    PM->>Comment: Write assessment comment

    PM->>Page: Click "Implement"
    Note over Page: (endpoint not yet wired)
```

**Key details:**
- The assessment table reuses the quotation table structure with **editable cells**
  (pencil toggle on each member row).
- Editing a member amount **auto-recalculates** the group total and grand total.
- Group rows are read-only — their amount is the sum of members.
- The `relatedTarget` blur handler prevents accidental commits when tabbing
  between the DESCRIPTION and AMOUNT inputs on the same row.
- "Implement" button exists but the endpoint is not wired yet.
- "Export" button exists but the endpoint is not wired yet.
- The 63.7 late-EW warning banner appears when applicable.

---

## 6. Email Thread

Email communication is tracked per CE across all its conversations.

**Route:** Visible as a tab on the Detail page (`/compensation-event/[id]`)
**Tab:** `compensation-event-email-thread-tab` → `compensation-event-email-thread`

```mermaid
sequenceDiagram
    actor User
    participant Tab as Email Thread Tab
    participant Hook as useGetCompensationEventEmailThread
    participant ConvHook as useGetEntityConversations
    participant ThreadHook as useQueries (per conversation)
    participant Service as projectEmailService
    participant API as Backend

    User->>Tab: Click "Email Thread" tab
    Tab->>Hook: useGetCompensationEventEmailThread({ id, projectId })
    Hook->>ConvHook: useGetEntityConversations({ entityId: ceId })
    ConvHook->>Service: getConversationsByEntity(ceId)
    Service->>API: GET /api/project-emails/:entityId/conversations
    API-->>ConvHook: EntityConversationDto[]

    loop For each conversation
        Hook->>ThreadHook: getProjectEmailThread(projectId, conversationId)
        ThreadHook->>API: GET /api/project-emails/thread?projectId=X&conversationId=Y
        API-->>ThreadHook: ProjectEmailMessageDto[]
    end

    ThreadHook-->>Hook: messages[] (flattened)
    Hook-->>Tab: All messages across all conversations
    Tab->>Tab: EmailThreadList rows (shared with Early Warning)
    Tab->>Tab: stripEmailHtml(body) → plain text preview
    Tab-->>User: Thread list with Load More (8 at a time)
```

**Key details:**
- A CE can have **multiple conversations** — the tab shows all messages across all
  of them, fetched in parallel via `useQueries`.
- Email HTML is stripped to plain text via `stripEmailHtml()`.
- Rows render through the shared `EmailThreadList` component (`src/components/shared/`),
  so CE correspondence reads exactly like the Early Warning thread list — same avatar
  tinting, direction badges and timestamp format.
- "View All" opens with client-side "Load More" pagination (8 per page).
- Currently returns empty state — `CompensationEventResponseDto` has no
  thread/attachment fields yet. Wired and waiting for the backend.

---
