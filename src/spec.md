# Specification

## Summary
**Goal:** Fix the Daily Entry draft preview crash caused by an infinite React update loop (Minified React error #185 / Maximum update depth exceeded) so the page renders and stays stable.

**Planned changes:**
- Identify and remove/guard the state update(s) on the Daily Entry page that cause repeated re-renders while idle (e.g., effects that set state every render).
- Ensure backend/actor readiness (loading/ready/error) UI state for Daily Entry only updates React state when the underlying readiness values actually change (avoid writing the same values repeatedly).
- Verify Daily Entry inputs (Restaurant Name select, Balance Date, ingredient Balance/Order) and Save Record interactions do not reintroduce an infinite render loop.

**User-visible outcome:** Opening the draft preview to the Daily Entry page no longer shows the “Something went wrong” fallback, remains stable without looping/crashing, and inputs plus Save Record remain interactive.
