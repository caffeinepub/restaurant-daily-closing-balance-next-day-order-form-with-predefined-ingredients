# Restaurant Daily Closing Balance & Next-Day Order Form

## Current State
HistoryPage has a date range filter (From/To date inputs) that applies reactively — records filter automatically as dates are typed. There is a search text box and a "Clear All" button. The RecordDetailPage has "Copy Order Details" and "Export CSV" buttons per individual record.

## Requested Changes (Diff)

### Add
- A **Search button** in the date range panel that, when clicked, triggers the date range filter (records only appear after the button is pressed, not reactively as dates are typed).
- An **Export button** directly on each history list row/card (alongside "View Details"), with two format options shown as a small dropdown or modal choice:
  - **Plain Text** — same format as the existing "Copy Order to Vendor" message (sent to clipboard or downloaded as .txt).
  - **CSV** — same as existing Export CSV (downloadable .csv file).

### Modify
- Date range filtering in HistoryPage: change from reactive (auto-filters on date input change) to **manual** (only filters when Search button is clicked). Displayed results should be empty/show prompt until Search is pressed.
- On initial load, show all records (no date filter active). After user sets dates and clicks Search, show filtered results. If dates are cleared, clicking Search again shows all records.
- Keep the existing "Clear All" behavior (only clears search text, not date range).

### Remove
- Nothing removed.

## Implementation Plan
1. Add local state `appliedFromDate` / `appliedToDate` in HistoryPage — these are the committed filter values used in `filterRecords`. The `fromDate`/`toDate` inputs remain draft state.
2. Add a **Search** button next to the date inputs. On click: set `appliedFromDate = fromDate`, `appliedToDate = toDate`.
3. Filter records using `appliedFromDate`/`appliedToDate` instead of `fromDate`/`toDate`.
4. On initial load, `appliedFromDate` and `appliedToDate` are both empty strings so all records show.
5. In HistoryPage, add an **Export** button per row/card with a dropdown offering "Plain Text" and "CSV" options. Plain text copies to clipboard (same as copy vendor message); CSV triggers file download.
6. Import `formatRecordAsPlainText` and `exportRecordToCSV` utilities into HistoryPage for use in the inline export buttons.
