# Release Notes — Contractor Quotation

Changes to the Compensation Event quotation and assessment screens.

---

## Contractor Quotation screen

**Quotation card**

- The card now totals to the figures it shows. It previously summed only the
  items the extractor happened to break out, so a £14,850 quotation displayed as
  £2,850.
- The quoted cost, the fee and the risk allowance each get one row, in the order
  the design draws them, followed by the total:

  | Row | Amount |
  | --- | --- |
  | Quotation Amount | £14,850 |
  | Fees | £1,350 |
  | Risk Allowance | £1,500 |
  | **Total Quotation** | **£17,700** |

- Categories that restate a figure the card already heads a row with are no
  longer counted a second time among the priced lines. This covers the quoted
  cost under both names the extractor has used — `totalCost` and
  `QuotationAmount` — and the risk allowance.
- **Fixed:** the quoted cost no longer climbs each time the screen is opened.
  Confirming a quotation used to inflate it from £14,850 to £17,700 to £20,550,
  because the register re-sums the stored `totalCost` to cover every item and the
  card read that back as the quoted cost. It now reads the item that names the
  quoted cost, falling back to `totalCost` only where no item does.
- **Fixed:** "Quotation Amount" no longer appears twice.
- Figures are shown exactly as the backend sends them. The card briefly derived a
  percentage-quoted fee itself by reading the rate out of the item's description;
  that arithmetic belongs to the backend, so the frontend no longer recomputes
  anything.
- A rule now runs under the card heading, matching the frame.

**Programme Impact card**

- A rule under the heading, and the claim lines separated by spacing rather than
  a divider between every row — previously the reverse of the frame.
- Rows share the same label/value layout as the rest of the screen.

**Number of Days**

- Reads "days", matching the frame.

---

## PM Assessment screen

- **Fixed:** the assessment card stated every row of the quotation again. It had
  been built from the priced lines alone, so once the quoted cost stopped being a
  line the card lost two of its three rows and a £17,700 quotation was assessed
  as £1,350.
- The quoted cost and the risk allowance are seeded from the contractor's
  quotation and can each be repriced by the PM, alongside the priced lines.
- Both figures now travel with the assessment on implement and in the exported
  workbook. The backend prices off the submitted items, so without this the
  breakdown would not have added up to the assessed total on screen.
- Export is available whenever the card has rows, rather than only when there are
  priced lines behind them.
- **Number of Days** accepts 0–30 whole days. Typing past the cap clamps
  immediately instead of waiting for the field to lose focus, and decimals are no
  longer accepted.

---

## Compensation Event register

- The status filter lists the twelve values of the backend
  `CompensationEventStatus` enum. It previously offered nine hand-written
  groupings, so choosing one sent every status behind it — picking "Quotation to
  be submitted" matched *Accepted*, *Quotation Requested* and *Quotation In
  Progress* together.
- Because those are now selectable separately, a single choice returns a narrower
  set of events than the same-named option did before.

---

## Financials tab

- The **Fees** and **Risk Allowance** tiles are populated. The endpoint had been
  returning both, but they were never mapped and always rendered a dash.
- A reported zero stays distinct from an absent figure.

---

## Notes for reviewers

- **The card total exceeds the contractor's stated `totalCost`.** That figure
  already covers the fee and the allowance, which are now listed as rows of their
  own. This follows the design, which sums its rows the same way. Reproducing the
  contractor's own arithmetic instead would mean deriving the quotation amount
  from the pre-fee cost.
- **The stored `totalCost` still grows on each save** for any quotation that has
  been confirmed, because the field is re-summed from items that already include
  it. The screens no longer read it, but anything reporting off that field
  server-side will be inflated.
- **The 30-day cap is client-side only.** An assessment already holding more than
  30 days still displays as it is, and another caller could still submit one.
- **Filter labels and status badges use different vocabularies.** A row filtered
  as *Quotation Requested* displays as "Quotation to be submitted". Aligning the
  badges is separate work.

---

## Testing

600 unit tests pass, covering the totalling rule, the categories excluded from the
priced lines under each name they arrive under, the assessed items payload, and
the financial tile mapping. Typecheck and Biome are clean.
