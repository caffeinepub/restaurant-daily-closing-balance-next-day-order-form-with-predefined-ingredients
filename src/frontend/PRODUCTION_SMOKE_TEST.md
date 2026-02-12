# Production Smoke Test Checklist

This checklist verifies that the Daily Inventory Balance app is working correctly in production.

## Prerequisites
- Have the production URL from `LIVE_URL.md`
- Use a modern web browser (Chrome, Firefox, Safari, or Edge)
- Ensure you have a stable internet connection

## Test Steps

### 1. Access the Application
- [ ] Open the production URL in your browser
- [ ] Verify the page loads without errors
- [ ] Confirm the header shows "Restaurant Inventory" with "Daily closing & order tracker" subtitle
- [ ] Verify "Version 11" label is visible in the header (top-right area)
- [ ] Check that navigation links (Daily Entry, History) are visible

### 2. Backend Connectivity Check
- [ ] Verify NO connection error card is displayed on the page
- [ ] If you see "Backend Connection Error" or "Canister Id not resolved":
  - This indicates a deployment or configuration issue
  - Do NOT proceed with testing
  - Report the error message immediately

### 3. Daily Entry Button Functionality Check
- [ ] Navigate to the "Daily Entry" page (should be the default view)
- [ ] Wait for the page to finish loading (no "Connecting to backend..." spinner)
- [ ] Verify all three action buttons are clickable (not disabled/grayed out):
  - "Clear Form" button
  - "Copy for Vendor" button
  - "Save Record" button
- [ ] Test "Clear Form" button:
  - Enter some test data in a few ingredient fields
  - Select a Balance Date
  - Click "Clear Form"
  - Verify all inputs are cleared AND the Balance Date field is reset
- [ ] Test "Copy for Vendor" button without date:
  - Click "Copy for Vendor" without selecting a Balance Date
  - Verify an error toast appears asking you to select a Balance Date
- [ ] Test "Copy for Vendor" button with date:
  - Select a Balance Date
  - Enter test data for at least 2 ingredients
  - Click "Copy for Vendor"
  - Verify a success toast appears
  - Paste into a text editor and verify the formatted message appears

### 4. Save a Daily Entry Record
- [ ] Select a Balance Date using the date picker
- [ ] Enter test data for at least 3 ingredients:
  - Example: Tomato - Closing: 5, Order: 10
  - Example: Milk - Closing: 3, Order: 8
  - Example: Chicken boneless - Closing: 2, Order: 5
- [ ] Click the "Save Record" button
- [ ] Verify a success message appears (toast notification)
- [ ] Confirm the form clears after saving
- [ ] Verify the app automatically navigates to the Record Details page for the saved record

### 5. Verify Record in History
- [ ] Navigate to the "History" page using the navigation link
- [ ] Verify the record you just saved appears in the list
- [ ] Check that the Balance Date matches what you entered
- [ ] Confirm the record shows the correct number of ingredients

### 6. View Record Details
- [ ] Click "View Details" on the record you just saved
- [ ] Verify all ingredient data is displayed correctly
- [ ] Check that Closing Balance and Next Day Order values match your input
- [ ] Verify the "Copy" button is present
- [ ] Verify the "Export CSV" button is present

### 7. Test Copy Functionality (Optional)
- [ ] Click "Copy" on the record detail page
- [ ] Paste the content into a text editor
- [ ] Verify the format is readable and includes all ingredient data

### 8. Test CSV Export (Optional)
- [ ] Click "Export CSV" on the record detail page
- [ ] Verify a CSV file downloads
- [ ] Open the CSV file and confirm data is properly formatted

## Success Criteria

✅ **PASS**: All steps complete without errors, record saves and displays correctly, and navigation to saved record works

❌ **FAIL**: Any of the following occur:
- Connection error card appears
- "Canister Id not resolved" error
- "Version 11" label is not visible in the header
- Daily Entry action buttons are disabled or non-responsive after page finishes loading
- "Clear Form" button does not clear inputs or reset Balance Date
- "Copy for Vendor" button does not copy or show validation toast
- Unable to save a record
- App does not navigate to Record Details after saving
- Saved record does not appear in History
- Record details page shows incorrect data or cannot be accessed

## Notes

- If the test fails at step 2 (Backend Connectivity), the deployment may not be complete or there may be a configuration issue
- If the test fails at step 3 (Button Functionality), the actor diagnostics may not be detecting the backend connection correctly
- The app should automatically navigate to the saved record's detail page after a successful save (step 4)
- All other failures should be investigated as potential bugs
- This smoke test should be run after every production deployment
