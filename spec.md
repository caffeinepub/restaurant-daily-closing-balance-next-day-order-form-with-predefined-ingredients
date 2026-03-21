# Shri Hoshnagi F&B Opp. — Update Round

## Current State

- App name is "Shri Hoshnagi F&B" throughout (login, header, footer, exported images)
- Raised Concern button in HistoryPage only shows when `isWithin24h(record) || concernSaved` — orders past 24h with no saved concern get NO button, hiding the feature from users
- In RaisedConcernPage (exported image via exportTableAsImage.ts), header shows "Shri Hoshnagi F&B" at bold 16px at the very top (y=28), before order details
- The concern table and exported image show "Balance Date" and use `record.timestamp` as the balance date
- Admin user dialog has a single restaurant `<Select>` dropdown — one restaurant per user only
- Backend `RestaurantUser` type has `restaurantName: Text` (single restaurant)

## Requested Changes (Diff)

### Add
- Multi-restaurant selector in Admin user dialog (checkboxes for each restaurant)
- Restaurant picker dialog in login flow when user has access to multiple restaurants

### Modify
1. **Branding**: "Shri Hoshnagi F&B" → "Shri Hoshnagi F&B Opp." in ALL files: `AppLayout.tsx`, `UserLoginPage.tsx`, `exportTableAsImage.ts` (×2), `RecordDetailPage.tsx`
2. **Raised Concern button visibility**: Always show the button for every order in history, regardless of 24h window. Remove `isWithin24h(record) || concernSaved` condition — always render button. Inside `RaisedConcernPage`, the 24h check already controls active vs read-only. Button label: within 24h = "Raised Concern", past 24h = "View Concern"
3. **Header text in Raised Concern exported image**: In `exportTableAsImage.ts`, reduce "Shri Hoshnagi F&B Opp." font from `bold 16px` to `bold 8px` and move it to BELOW "Total Ingredients" text (last line in header, after y=106)
4. **Order Date in Raised Concern screen**: In `RaisedConcernPage.tsx`, change "Date:" label to "Order Date:" and show `formatDateDDMMYYYY(Number(record.timestamp) + 86400000)` (balance + 1 day). In `exportTableAsImage.ts`, rename param `balanceDate` to `orderDate` and label `Balance Date:` to `Order Date:`. Update caller in `RaisedConcernPage.tsx`
5. **Admin multi-restaurant**: Store comma-separated restaurant names in the existing `restaurantName: Text` field (no backend type change needed — backward compatible). In Admin user dialog, replace single `<Select>` with checkboxes for each restaurant. Display comma-separated names in user table. In login flow, if `restaurantName.includes(',')`, show restaurant picker dialog before navigating

### Remove
- Nothing removed

## Implementation Plan

1. `AppLayout.tsx`: Replace all "Shri Hoshnagi F&B" with "Shri Hoshnagi F&B Opp."
2. `UserLoginPage.tsx`: Replace all "Shri Hoshnagi F&B" with "Shri Hoshnagi F&B Opp.". After `loginUser()` resolves, if `user.restaurantName` contains commas, show restaurant picker dialog. On pick, call `login(user.username, user.password, selectedRestaurant)` and navigate
3. `HistoryPage.tsx`: Always show Raised Concern button (remove 24h condition). Button label: `isWithin24h(record) ? 'Raised Concern' : 'View Concern'`
4. `RaisedConcernPage.tsx`: Change "Date:" → "Order Date:", display `formatDateDDMMYYYY(Number(record.timestamp) + 86400000)`. Update `handleExportImage` to pass `orderDate` instead of `balanceDate`
5. `exportTableAsImage.ts`: Rename param `balanceDate` → `orderDate`, label `Balance Date:` → `Order Date:`. Move the brand text (now "Shri Hoshnagi F&B Opp.") to after `Total Ingredients` at reduced font size `bold 8px` (adjust canvas header height accordingly)
6. `AdminPage.tsx` `RestaurantMasterTab`: Replace single `<Select>` for restaurant with a list of checkboxes (one per restaurant). State becomes `uRestaurants: string[]`. On save, join with comma: `uRestaurants.join(',')`. On edit open, split stored value: `u.restaurantName.split(',')`. Table column shows the full comma-separated or multi-line list
7. `masterData.ts`: No change needed (already passes restaurantName as string)
