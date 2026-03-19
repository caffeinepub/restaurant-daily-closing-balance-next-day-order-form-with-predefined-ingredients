# Shri Hoshnagi F&B — Backend Connection Fix

## Current State
The production canister (gtn3f-qaaaa-aaaah-atokq-cai) is stopped on the Internet Computer, causing IC0508 errors on the History page when `getAllDailyRecords` is called. Additionally, `useActor.ts` still calls `_initializeAccessControlWithSecret` which is a leftover from the old Internet Identity admin flow and is unnecessary.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Rebuild backend to get a fresh running canister
- Remove `_initializeAccessControlWithSecret` call from `useActor.ts` since admin now uses password login

### Remove
- Stale `_initializeAccessControlWithSecret` actor call

## Implementation Plan
1. Regenerate Motoko backend (creates new canister)
2. Update `useActor.ts` to remove stale `_initializeAccessControlWithSecret` call
3. Validate and deploy
