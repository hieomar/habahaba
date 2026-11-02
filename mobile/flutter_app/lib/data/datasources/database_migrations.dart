import 'package:sqflite/sqflite.dart';

import 'database_constants.dart';

/// Schema migrations for the local SQLite database.
/// Version history:
///   1 — initial schema (farmers, farms, commodity_purchases, app_settings)
///   2 — add sync_events table; add primaryCrop column to farms
abstract final class DatabaseMigrations {
  static Future<void> apply(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 1) {
      await _v1CreateSchema(db);
    }
    if (oldVersion < 2 && newVersion >= 2) {
      await _v2AddSyncEvents(db);
    }
    if (oldVersion < 3 && newVersion >= 3) {
      await _v3AddBagTagColumns(db);
    }
  }

  // ─── V1 ────────────────────────────────────────────────────────────────────
  static Future<void> _v1CreateSchema(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS ${DatabaseConstants.tableAppSettings} (
        ${DatabaseConstants.columnKey}   TEXT PRIMARY KEY,
        ${DatabaseConstants.columnValue} TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS ${DatabaseConstants.tableFarmers} (
        ${DatabaseConstants.columnId}              TEXT PRIMARY KEY,
        ${DatabaseConstants.columnUuid}            TEXT NOT NULL UNIQUE,
        firstName                                  TEXT NOT NULL,
        lastName                                   TEXT NOT NULL,
        phoneNumber                                TEXT NOT NULL,
        nationalId                                 TEXT,
        ${DatabaseConstants.columnVillage}         TEXT,
        ${DatabaseConstants.columnDistrict}        TEXT,
        ${DatabaseConstants.columnClub}            TEXT,
        ${DatabaseConstants.columnAssociation}     TEXT,
        ${DatabaseConstants.columnCropsJson}       TEXT,
        ${DatabaseConstants.columnLatitude}        REAL,
        ${DatabaseConstants.columnLongitude}       REAL,
        ${DatabaseConstants.columnSeedLoanBalance} REAL,
        ${DatabaseConstants.columnRegisteredAt}    TEXT,
        ${DatabaseConstants.columnSyncStatus}      TEXT NOT NULL,
        ${DatabaseConstants.columnCreatedAt}       TEXT NOT NULL,
        ${DatabaseConstants.columnUpdatedAt}       TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS ${DatabaseConstants.tableFarms} (
        ${DatabaseConstants.columnId}          TEXT PRIMARY KEY,
        ${DatabaseConstants.columnUuid}        TEXT NOT NULL UNIQUE,
        ${DatabaseConstants.columnFarmerUuid}  TEXT NOT NULL,
        ${DatabaseConstants.columnFarmName}    TEXT NOT NULL,
        ${DatabaseConstants.columnLocation}    TEXT NOT NULL,
        ${DatabaseConstants.columnAcreage}     REAL,
        ${DatabaseConstants.columnPrimaryCrop} TEXT,
        ${DatabaseConstants.columnSyncStatus}  TEXT NOT NULL,
        ${DatabaseConstants.columnCreatedAt}   TEXT NOT NULL,
        ${DatabaseConstants.columnUpdatedAt}   TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS ${DatabaseConstants.tableCommodityPurchases} (
        ${DatabaseConstants.columnId}              TEXT PRIMARY KEY,
        ${DatabaseConstants.columnUuid}            TEXT NOT NULL UNIQUE,
        ${DatabaseConstants.columnFarmerUuid}      TEXT NOT NULL,
        ${DatabaseConstants.columnCommodity}       TEXT NOT NULL,
        ${DatabaseConstants.columnQuantity}        REAL NOT NULL,
        ${DatabaseConstants.columnUnitPrice}       REAL NOT NULL,
        ${DatabaseConstants.columnTotalPrice}      REAL NOT NULL,
        ${DatabaseConstants.columnPurchaseDate}    TEXT NOT NULL,
        ${DatabaseConstants.columnFarmerName}      TEXT,
        ${DatabaseConstants.columnVariety}         TEXT,
        ${DatabaseConstants.columnLoanRecovered}   REAL,
        ${DatabaseConstants.columnNetPayment}      REAL,
        ${DatabaseConstants.columnReceiptNumber}   TEXT,
        ${DatabaseConstants.columnBuyingCenter}    TEXT,
        ${DatabaseConstants.columnNumberOfBags}    INTEGER DEFAULT 0,
        ${DatabaseConstants.columnBagTagRange}     TEXT,
        ${DatabaseConstants.columnSyncStatus}      TEXT NOT NULL,
        ${DatabaseConstants.columnCreatedAt}       TEXT NOT NULL,
        ${DatabaseConstants.columnUpdatedAt}       TEXT NOT NULL
      )
    ''');

    // Performance Indexes for Offline Search & Sync
    await db.execute('CREATE INDEX IF NOT EXISTS idx_farmers_sync ON ${DatabaseConstants.tableFarmers}(${DatabaseConstants.columnSyncStatus})');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_purchases_sync ON ${DatabaseConstants.tableCommodityPurchases}(${DatabaseConstants.columnSyncStatus})');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_farms_farmer ON ${DatabaseConstants.tableFarms}(${DatabaseConstants.columnFarmerUuid})');
  }

  // ─── V2 ────────────────────────────────────────────────────────────────────
  static Future<void> _v2AddSyncEvents(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS ${DatabaseConstants.tableSyncEvents} (
        ${DatabaseConstants.columnId}            TEXT PRIMARY KEY,
        ${DatabaseConstants.columnOccurredAt}    TEXT NOT NULL,
        ${DatabaseConstants.columnSuccess}       INTEGER NOT NULL,
        ${DatabaseConstants.columnRecordsSynced} INTEGER NOT NULL DEFAULT 0,
        ${DatabaseConstants.columnErrorMessage}  TEXT
      )
    ''');

    try {
      await db.execute(
        'ALTER TABLE ${DatabaseConstants.tableFarms} '
        'ADD COLUMN ${DatabaseConstants.columnPrimaryCrop} TEXT',
      );
    } catch (_) {}
  }

  // ─── V3 ────────────────────────────────────────────────────────────────────
  static Future<void> _v3AddBagTagColumns(Database db) async {
    try {
      await db.execute(
        'ALTER TABLE ${DatabaseConstants.tableCommodityPurchases} '
        'ADD COLUMN ${DatabaseConstants.columnNumberOfBags} INTEGER DEFAULT 0',
      );
    } catch (_) {}
    try {
      await db.execute(
        'ALTER TABLE ${DatabaseConstants.tableCommodityPurchases} '
        'ADD COLUMN ${DatabaseConstants.columnBagTagRange} TEXT',
      );
    } catch (_) {}

    // Add indexes if upgrading to v3
    try {
      await db.execute('CREATE INDEX IF NOT EXISTS idx_farmers_sync ON ${DatabaseConstants.tableFarmers}(${DatabaseConstants.columnSyncStatus})');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_purchases_sync ON ${DatabaseConstants.tableCommodityPurchases}(${DatabaseConstants.columnSyncStatus})');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_farms_farmer ON ${DatabaseConstants.tableFarms}(${DatabaseConstants.columnFarmerUuid})');
    } catch (_) {}
  }
}
