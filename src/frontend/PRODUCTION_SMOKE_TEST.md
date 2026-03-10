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

### 3. Daily Entry Page Stability Check (Regression Test for React Error #185)
- [ ] Navigate to the "Daily Entry" page (should be the default view)
- [ ] Wait for the page to finish loading (no "Connecting to backend..." spinner)
- [ ] Verify the page renders normally without showing a generic "Something went wrong" error fallback
- [ ] Leave the page idle (no interaction) for at least 30 seconds
- [ ] Confirm the page remains stable and does not crash or show error messages
- [ ] Verify all inputs remain interactive:
  - Restaurant Name select dropdown opens and closes normally
  - Balance Date input accepts date selection
  - Ingredient Balance and Order inputs accept numeric values
- [ ] Verify the Save Record button remains clickable (not grayed out after backend is ready)

### 4. Verify New Ingredients Appear
- [ ] Scroll through the Vegetables section on Daily Entry page
- [ ] Confirm "BROKELY /kg" appears in the Vegetables section
- [ ] Confirm "BABYCORN/ pkt" appears in the Vegetables section
- [ ] Confirm "PALAK/ kg" appears in the Vegetables section
- [ ] Scroll through the Dairy section on Daily Entry page
- [ ] Confirm "NOODLE /pkt" appears in the Dairy section
- [ ] Verify all new ingredients have Balance and Order input fields

### 5. Daily Entry Button Functionality Check
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

### 6. Save a Daily Entry Record
- [ ] Select a Restaurant Name (Andaaz or Kai wok Express)
- [ ] Select a Balance Date using the date picker
- [ ] Enter test data for at least 3 ingredients:
  - Example: Tomato - Balance: 5, Order: 10
  - Example: Milk - Balance: 3, Order: 8
  - Example: Chicken boneless - Balance: 2, Order: 5
- [ ] Click the "Save Record" button
- [ ] Verify a success message appears (toast notification)
- [ ] Confirm the form clears after saving
- [ ] Verify the app automatically navigates to the Record Details page for the saved record

### 7. Verify Record in History
- [ ] Navigate to the "History" page using the navigation link
- [ ] Verify the record you just saved appears in the list
- [ ] Check that the Restaurant Name and Balance Date match what you entered
- [ ] Confirm the record shows the correct number of ingredients

### 8. View Record Details
- [ ] Click "View Details" on the record you just saved
- [ ] Verify all ingredient data is displayed correctly
- [ ] Check that Balance and Order values match your input
- [ ] Verify the "Copy" button is present
- [ ] Verify the "Export CSV" button is present

### 9. Test New Ingredients in Saved Records
- [ ] Save a new record with data for the new ingredients:
  - Enter values for "BROKELY /kg" (e.g., Balance: 2, Order: 5)
  - Enter values for "BABYCORN/ pkt" (e.g., Balance: 1, Order: 3)
  - Enter values for "PALAK/ kg" (e.g., Balance: 3, Order: 7)
  - Enter values for "NOODLE /pkt" (e.g., Balance: 4, Order: 6)
- [ ] Navigate to the saved record's detail page
- [ ] Verify all new ingredients appear in the record details
- [ ] Click "Copy" and verify new ingredients with non-zero Order values appear in the copied text
- [ ] Click "Export CSV" and verify new ingredients appear as rows in the CSV file

### 10. Test Copy Functionality (Optional)
- [ ] Click "Copy" on the record detail page
- [ ] Paste the content into a text editor
- [ ] Verify the format is readable and includes all ingredient data

### 11. Test CSV Export (Optional)
- [ ] Click "Export CSV" on the record detail page
- [ ] Verify a CSV file downloads
- [ ] Open the CSV file and confirm data is properly formatted

## Success Criteria

✅ **PASS**: All steps complete without errors, record saves and displays correctly, and navigation to saved record works

❌ **FAIL**: Any of the following occur:
- Connection error card appears
- "Canister Id not resolved" error
- "Version 11" label is not visible in the header
- Daily Entry page shows generic "Something went wrong" error fallback
- Daily Entry page crashes or enters infinite render loop (React error #185)
- Daily Entry page becomes unresponsive after 30 seconds of idle time
- Restaurant Name, Balance Date, or ingredient inputs become non-interactive
- Daily Entry action buttons are disabled or non-responsive after page finishes loading
- "Clear Form" button does not clear inputs or reset Balance Date
- "Copy for Vendor" button does not copy or show validation toast
- New ingredients (BROKELY, BABYCORN, PALAK, NOODLE) do not appear in their respective categories
- New ingredients do not appear in saved record details
- New ingredients do not appear in Copy output (when Order > 0)
- New ingredients do not appear in CSV export
- Unable to save a record
- App does not navigate to Record Details after saving
- Saved record does not appear in History
- Record details page shows incorrect data or cannot be accessed

## Notes

- If the test fails at step 2 (Backend Connectivity), the deployment may not be complete or there may be a configuration issue
- If the test fails at step 3 (Page Stability), there is likely an infinite render loop in the Daily Entry page
- If the test fails at step 4 (New Ingredients), the predefined ingredients list was not updated correctly
- If the test fails at step 5 (Button Functionality), the actor diagnostics may not be detecting the backend connection correctly
- The app should automatically navigate to the saved record's detail page after a successful save (step 6)
- All other failures should be investigated as potential bugs
- This smoke test should be run after every production deployment
