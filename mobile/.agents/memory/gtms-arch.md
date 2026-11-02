---
name: Flutter GTMS app architecture
description: Key architectural decisions and wiring for the NASFAM GTMS Flutter app
---

## Layers
- `domain/entities/` — pure value objects (Farmer, Farm, CommodityPurchase, SyncEvent, AppUser, DashboardStats)
- `domain/repositories/` — abstract interfaces
- `data/datasources/LocalDataStore` — single SQLite-backed source of truth; exposes Streams for live UI updates
- `data/repositories/` — concrete impls (Farmer, Farm, Purchase, Sync, Auth)
- `state/GtmsController` — ChangeNotifier; listens to farmer/purchase streams; manages auth, sync, auto-sync
- DI root: `app/di.dart` `buildAppProviders()` — wires everything into Provider tree

## Database
- `DatabaseHelper` singleton via `sqflite`
- Schema version 2: farmers, farms, commodity_purchases, app_settings, sync_events
- Sequences stored in `app_settings` (keys `seq_farmer`, `seq_purchase`); initial seeds 128 and 893
- Migrations in `DatabaseMigrations.apply(db, oldVersion, newVersion)`

## Key field names (actual SQLite column names, NOT constants)
- Farmers table: `firstName`, `lastName`, `phoneNumber`, `nationalId` (these are raw strings in CREATE TABLE, not using constants)
- All other tables use DatabaseConstants values

## Auto-sync
- `GtmsController` subscribes to `ConnectivityService.stream`
- On going online + pendingCount > 0: calls `SyncRepositoryImpl.syncAllQuiet()` silently

**Why:** Offline-first field tool; no real backend yet — sync marks records as synced locally after simulated delay.
