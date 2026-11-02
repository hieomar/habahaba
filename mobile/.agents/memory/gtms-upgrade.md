---
name: GTMS production upgrade — completed items
description: Summary of all 12 items patched during the production-level audit
---

## Completed replacements (all live, zero stubs)

1. **LocalDataStore** — full SQLite rewrite: upsertFarm, getFarmsForFarmer, recordSyncEvent, getSyncHistory, DB-backed sequence generators (nextFarmerSequence / nextPurchaseSequence), markAsSynced/markAsFailed persist to SQLite, UUID collision fixed (uses entity.id consistently).

2. **FarmRepositoryImpl** — new; implements FarmRepository via LocalDataStore.

3. **SyncRepositoryImpl** — getSyncHistory() implemented; syncAll() records real SyncEvent to DB with accurate recordsSynced count; syncAllQuiet() for silent auto-sync.

4. **FarmerRepositoryImpl** — added nextFarmerSequence() method exposed for GtmsController.

5. **PurchaseRepositoryImpl** — added nextPurchaseSequence() method exposed for GtmsController.

6. **di.dart** — wires FarmRepositoryImpl; passes ConnectivityService to GtmsController.

7. **GtmsController** — ConnectivityService auto-sync subscription; registerFarm(); farmsForFarmer(); watchFarmsForFarmer(); nextFarmerId() / nextReceiptNumber() using DB sequences.

8. **FarmerRegistrationScreen** — replaced fingerprint/biometric section with National ID text field (optional); farmer ID from DB sequence via controller.

9. **FarmRegistrationScreen** — _save() calls controller.registerFarm(farm) for real SQLite persistence.

10. **FarmerProfileScreen** — farms loaded from DB via controller.farmsForFarmer(); "Record New Purchase" navigates to CommodityPurchaseScreen with farmer pre-selected; real purchase history.

11. **CommodityPurchaseScreen** — receipt number from DB sequence; variety dropdown only shown when varieties exist for selected commodity.

12. **SyncScreen** — real sync history from DB via FutureBuilder pattern; real pending-record lists; history capped at 20 most recent.

13. **DashboardScreen** — recent purchases limited to 5; stats use real counts (no fake fallbacks); "View all" navigates to PurchasesScreen.

## Key decisions
- No backend added; sync marks records locally (field-demo scope)
- path_provider pinned to 2.1.5 (Dart SDK 3.8.0 constraint)
