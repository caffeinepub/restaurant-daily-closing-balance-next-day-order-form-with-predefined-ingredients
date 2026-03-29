# Shri Hoshnagi F&B Opp.

## Current State
- App has 7-tab bottom navigation bar shown on all tile pages (DailyEntryPage, StoreIndentsPage, NotActivePage, etc.)
- Admin Reports tab shows 3 sub-tabs but displays records in a flat list, not date-wise pivot table
- Admin panel does not have a way to assign/restrict categories & raw materials per restaurant
- The BottomNavBar is rendered globally in AppLayout for all authenticated pages except login/admin/home

## Requested Changes (Diff)

### Add
- Date-wise pivot report in AdminReportsTab: rows = raw material names, columns = dates in range, each date has 2 sub-columns (Balance | Order). All 3 report types (By Order, By Balance, By Balance & Order) use this format
- In Admin Panel Restaurant Master: when admin clicks on a restaurant, show a new section "Assign Categories & Raw Materials" with checkboxes. All ticked by default. Unticking hides that category/item from that restaurant's users in Daily Entry
- Backend: store restaurantAssignments (per restaurant: allowed category names + allowed item names)
- A "Home" button bar at the bottom of tile pages (replacing the BottomNavBar)

### Modify
- AppLayout: remove BottomNavBar from tile pages (daily-entry, store-indents, wastage, receiving, semifinish, attendance, repair). Show BottomNavBar ONLY on pages where it makes sense, or replace entirely with a single Home button bar
- AdminReportsTab: completely rework report display to pivot table format
- AdminPage / Restaurant Master: add assignment section inside restaurant detail
- DailyEntryForm / StoreIndentsPage: filter categories and items based on restaurant's allowed assignments fetched from backend

### Remove
- BottomNavBar from all tile pages (replaced by Home button)

## Implementation Plan
1. Update backend main.mo:
   - Add restaurantCategoryAssignments and restaurantItemAssignments hashmaps
   - Add getRestaurantAssignments(restaurantName) and setRestaurantAssignments(restaurantName, categories, items) methods
2. Update AdminPage: inside Restaurant Master's restaurant detail view, add checkboxes for all categories and all raw materials
3. Update AdminReportsTab: redesign to pivot/matrix format with dates as columns, items as rows
4. Update AppLayout: conditionally show either BottomNavBar (nowhere now) or a Home button bar on tile pages
5. Update DailyEntryForm: fetch restaurant's allowed categories/items and filter display accordingly
