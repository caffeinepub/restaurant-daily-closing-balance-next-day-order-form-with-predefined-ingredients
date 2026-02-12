# Specification

## Summary
**Goal:** Fix the production deployment failure and production runtime connectivity issues so the app can be redeployed successfully and works end-to-end on the live environment.

**Planned changes:**
- Identify and fix the root cause of the current production deployment failure, and ensure build/deploy output includes a brief developer-readable explanation of the original failure.
- Update frontend production actor/canister resolution so the correct backend canister ID is used in production and connectivity failures are handled gracefully.
- Add a clear UI error state (English) with a retry action when actor creation or the first backend call fails, without modifying immutable hook/UI files.
- Redeploy to production and verify on the live app that saving a daily record, viewing it in History, and opening Record Details works (including copy/export without regressions).

**User-visible outcome:** The live app deploys successfully, can connect to the backend in production, and users can save a daily record and view it in History/Record Details; if connectivity fails, they see a clear error with a retry option instead of a blank/crashed UI.
