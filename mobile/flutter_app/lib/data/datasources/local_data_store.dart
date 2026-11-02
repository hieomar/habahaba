import 'dart:async';
import 'dart:convert';

import 'package:sqflite/sqflite.dart';
import 'package:gtms/data/datasources/connectivity_service.dart';
import 'package:gtms/data/datasources/database_constants.dart';
import 'package:gtms/data/datasources/database_helper.dart';
import 'package:gtms/data/datasources/local_seed_data.dart';
import 'package:gtms/domain/entities/entities.dart';

/// SQLite-backed local data store for the offline-first layer.
/// All writes go to SQLite immediately; in-memory lists serve as a read cache
/// so screens never need to await a database query for every rebuild.
class LocalDataStore {
  LocalDataStore({ConnectivityService? connectivityService}) {
    _connectivityService = connectivityService ?? ConnectivityService();
    _farmers = List<Farmer>.from(LocalSeedData.farmers());
    _purchases = List<CommodityPurchase>.from(LocalSeedData.purchases());
    _lastSyncTime = null;
    _initialize();
  }

  final _farmersController =
      StreamController<List<Farmer>>.broadcast();
  final _purchasesController =
      StreamController<List<CommodityPurchase>>.broadcast();
  final Completer<void> _readyCompleter = Completer<void>();

  late ConnectivityService _connectivityService;
  late List<Farmer> _farmers;
  late List<CommodityPurchase> _purchases;
  AppUser? _currentUser;
  DateTime? _lastSyncTime;
  bool _isOnline = true;
  bool _disposed = false;

  Future<void> get ready => _readyCompleter.future;

  List<Farmer> get farmers => List.unmodifiable(_farmers);
  List<CommodityPurchase> get purchases => List.unmodifiable(_purchases);
  AppUser? get currentUser => _currentUser;
  DateTime? get lastSyncTime => _lastSyncTime;
  bool get isOnline => _isOnline;

  Stream<List<Farmer>> get farmersStream => _farmersController.stream;
  Stream<List<CommodityPurchase>> get purchasesStream =>
      _purchasesController.stream;

  // ─── Initialisation ────────────────────────────────────────────────────────

  Future<void> _initialize() async {
    try {
      final db = await DatabaseHelper.instance.database;
      await _ensureSeedData(db);
      await _loadFromDatabase(db);
      _isOnline = await _connectivityService.checkConnectivity();
      if (!_readyCompleter.isCompleted) _readyCompleter.complete();
    } catch (error, stackTrace) {
      if (!_readyCompleter.isCompleted) {
        _readyCompleter.completeError(error, stackTrace);
      }
      _currentUser = LocalSeedData.demoUser;
      _isOnline = true;
      _farmersController.add(farmers);
      _purchasesController.add(purchases);
    }
  }

  Future<void> _ensureSeedData(Database db) async {
    final existing = await db.query(
      DatabaseConstants.tableAppSettings,
      where: '${DatabaseConstants.columnKey} = ?',
      whereArgs: [DatabaseConstants.seedFlag],
    );
    if (existing.isNotEmpty) return;

    final now = DateTime.now().toUtc().toIso8601String();
    for (final f in LocalSeedData.farmers()) {
      await _insertFarmerRow(db, f, now, isSeed: true);
    }
    for (final p in LocalSeedData.purchases()) {
      await _insertPurchaseRow(db, p, now, isSeed: true);
    }

    // Seed the user.
    await db.insert(DatabaseConstants.tableAppSettings, {
      DatabaseConstants.columnKey: DatabaseConstants.currentUserKey,
      DatabaseConstants.columnValue: jsonEncode({
        'id': LocalSeedData.demoUser.id,
        'name': LocalSeedData.demoUser.name,
        'email': LocalSeedData.demoUser.email,
        'role': LocalSeedData.demoUser.role.name,
        'ipc': LocalSeedData.demoUser.ipc,
      }),
    });

    // Seed sequences so generated IDs never collide with seed data.
    await db.insert(DatabaseConstants.tableAppSettings, {
      DatabaseConstants.columnKey: DatabaseConstants.seqFarmerKey,
      DatabaseConstants.columnValue: '128', // seed goes up to NAS-LLW-00128
    });
    await db.insert(DatabaseConstants.tableAppSettings, {
      DatabaseConstants.columnKey: DatabaseConstants.seqPurchaseKey,
      DatabaseConstants.columnValue: '893', // seed goes up to RCP-2026-0893
    });

    await db.insert(DatabaseConstants.tableAppSettings, {
      DatabaseConstants.columnKey: DatabaseConstants.seedFlag,
      DatabaseConstants.columnValue: 'true',
    });
  }

  Future<void> _loadFromDatabase(Database db) async {
    final farmerRows =
        await db.query(DatabaseConstants.tableFarmers);
    final purchaseRows =
        await db.query(DatabaseConstants.tableCommodityPurchases);
    final currentUserRow = await db.query(
      DatabaseConstants.tableAppSettings,
      where: '${DatabaseConstants.columnKey} = ?',
      whereArgs: [DatabaseConstants.currentUserKey],
    );
    final lastSyncRow = await db.query(
      DatabaseConstants.tableAppSettings,
      where: '${DatabaseConstants.columnKey} = ?',
      whereArgs: [DatabaseConstants.lastSyncKey],
    );

    _farmers = farmerRows.isEmpty
        ? List<Farmer>.from(LocalSeedData.farmers())
        : farmerRows.map(_mapFarmerRow).toList();
    _purchases = purchaseRows.isEmpty
        ? List<CommodityPurchase>.from(LocalSeedData.purchases())
        : purchaseRows.map(_mapPurchaseRow).toList();

    if (currentUserRow.isNotEmpty) {
      final raw =
          currentUserRow.first[DatabaseConstants.columnValue] as String?;
      if (raw != null) {
        final m = jsonDecode(raw) as Map<String, dynamic>;
        _currentUser = AppUser(
          id: m['id'] as String,
          name: m['name'] as String,
          email: m['email'] as String,
          role: UserRole.values.firstWhere(
            (r) => r.name == (m['role'] as String),
            orElse: () => UserRole.marketingOfficer,
          ),
          ipc: m['ipc'] as String,
        );
      }
    }

    if (lastSyncRow.isNotEmpty) {
      final v =
          lastSyncRow.first[DatabaseConstants.columnValue] as String?;
      if (v != null) _lastSyncTime = DateTime.tryParse(v);
    }

    _farmersController.add(farmers);
    _purchasesController.add(purchases);
  }

  // ─── Sequence generators ───────────────────────────────────────────────────

  /// Returns the next zero-padded farmer sequence (e.g. 129, 130, …).
  Future<int> nextFarmerSequence() async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    return db.transaction<int>((txn) async {
      final rows = await txn.query(
        DatabaseConstants.tableAppSettings,
        where: '${DatabaseConstants.columnKey} = ?',
        whereArgs: [DatabaseConstants.seqFarmerKey],
      );
      final current = rows.isEmpty
          ? 128
          : int.tryParse(
                  rows.first[DatabaseConstants.columnValue] as String? ?? '128') ??
              128;
      final next = current + 1;
      await txn.insert(
        DatabaseConstants.tableAppSettings,
        {
          DatabaseConstants.columnKey: DatabaseConstants.seqFarmerKey,
          DatabaseConstants.columnValue: next.toString(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      return next;
    });
  }

  /// Returns the next purchase sequence number.
  Future<int> nextPurchaseSequence() async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    return db.transaction<int>((txn) async {
      final rows = await txn.query(
        DatabaseConstants.tableAppSettings,
        where: '${DatabaseConstants.columnKey} = ?',
        whereArgs: [DatabaseConstants.seqPurchaseKey],
      );
      final current = rows.isEmpty
          ? 893
          : int.tryParse(
                  rows.first[DatabaseConstants.columnValue] as String? ?? '893') ??
              893;
      final next = current + 1;
      await txn.insert(
        DatabaseConstants.tableAppSettings,
        {
          DatabaseConstants.columnKey: DatabaseConstants.seqPurchaseKey,
          DatabaseConstants.columnValue: next.toString(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
      return next;
    });
  }

  // ─── User ──────────────────────────────────────────────────────────────────

  Future<void> setUser(AppUser? user) async {
    await ready;
    _currentUser = user;
    final db = await DatabaseHelper.instance.database;
    if (user == null) {
      await db.delete(
        DatabaseConstants.tableAppSettings,
        where: '${DatabaseConstants.columnKey} = ?',
        whereArgs: [DatabaseConstants.currentUserKey],
      );
    } else {
      await db.insert(
        DatabaseConstants.tableAppSettings,
        {
          DatabaseConstants.columnKey: DatabaseConstants.currentUserKey,
          DatabaseConstants.columnValue: jsonEncode({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role.name,
            'ipc': user.ipc,
          }),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    if (!_disposed) {
      _farmersController.add(farmers);
      _purchasesController.add(purchases);
    }
  }

  Future<void> setOnline(bool value) async {
    _isOnline = value;
  }

  // ─── Farmers ───────────────────────────────────────────────────────────────

  Future<void> upsertFarmer(Farmer farmer) async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final now = DateTime.now().toUtc().toIso8601String();
    await _insertFarmerRow(db, farmer, now);
    final index = _farmers.indexWhere((f) => f.id == farmer.id);
    if (index >= 0) {
      _farmers[index] = farmer;
    } else {
      _farmers = [farmer, ..._farmers];
    }
    if (!_disposed) _farmersController.add(farmers);
  }

  // ─── Purchases ─────────────────────────────────────────────────────────────

  Future<void> upsertPurchase(CommodityPurchase purchase) async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final now = DateTime.now().toUtc().toIso8601String();
    await _insertPurchaseRow(db, purchase, now);
    final index = _purchases.indexWhere((p) => p.id == purchase.id);
    if (index >= 0) {
      _purchases[index] = purchase;
    } else {
      _purchases = [purchase, ..._purchases];
    }
    if (!_disposed) _purchasesController.add(purchases);
  }

  // ─── Farms ─────────────────────────────────────────────────────────────────

  Future<void> upsertFarm(Farm farm) async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final now = DateTime.now().toUtc().toIso8601String();
    await db.insert(
      DatabaseConstants.tableFarms,
      {
        DatabaseConstants.columnId: farm.id,
        DatabaseConstants.columnUuid: farm.id,
        DatabaseConstants.columnFarmerUuid: farm.farmerUuid,
        DatabaseConstants.columnFarmName: farm.farmName,
        DatabaseConstants.columnLocation: farm.location,
        DatabaseConstants.columnAcreage: farm.acreage,
        DatabaseConstants.columnPrimaryCrop: farm.primaryCrop,
        DatabaseConstants.columnSyncStatus: farm.syncStatus.name,
        DatabaseConstants.columnCreatedAt: farm.createdAt.toUtc().toIso8601String(),
        DatabaseConstants.columnUpdatedAt: now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Farm>> getFarmsForFarmer(String farmerUuid) async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final rows = await db.query(
      DatabaseConstants.tableFarms,
      where: '${DatabaseConstants.columnFarmerUuid} = ?',
      whereArgs: [farmerUuid],
      orderBy: '${DatabaseConstants.columnCreatedAt} DESC',
    );
    return rows.map(_mapFarmRow).toList();
  }

  // ─── Sync ──────────────────────────────────────────────────────────────────

  int get pendingCount {
    final pf = _farmers.where((f) => f.syncStatus != SyncStatus.synced).length;
    final pp = _purchases.where((p) => p.syncStatus != SyncStatus.synced).length;
    return pf + pp;
  }

  Future<List<Farmer>> getPendingFarmers() async {
    await ready;
    return _farmers.where((f) => f.syncStatus != SyncStatus.synced).toList();
  }

  Future<List<CommodityPurchase>> getPendingPurchases() async {
    await ready;
    return _purchases.where((p) => p.syncStatus != SyncStatus.synced).toList();
  }

  Future<void> markAllSynced() async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final now = DateTime.now().toUtc().toIso8601String();

    _farmers = _farmers
        .map((f) => f.copyWith(syncStatus: SyncStatus.synced))
        .toList();
    _purchases = _purchases
        .map((p) => p.copyWith(syncStatus: SyncStatus.synced))
        .toList();

    await db.update(
      DatabaseConstants.tableFarmers,
      {
        DatabaseConstants.columnSyncStatus: SyncStatus.synced.name,
        DatabaseConstants.columnUpdatedAt: now,
      },
      where:
          '${DatabaseConstants.columnSyncStatus} != ?',
      whereArgs: [SyncStatus.synced.name],
    );
    await db.update(
      DatabaseConstants.tableCommodityPurchases,
      {
        DatabaseConstants.columnSyncStatus: SyncStatus.synced.name,
        DatabaseConstants.columnUpdatedAt: now,
      },
      where: '${DatabaseConstants.columnSyncStatus} != ?',
      whereArgs: [SyncStatus.synced.name],
    );

    _lastSyncTime = DateTime.now();
    await db.insert(
      DatabaseConstants.tableAppSettings,
      {
        DatabaseConstants.columnKey: DatabaseConstants.lastSyncKey,
        DatabaseConstants.columnValue: _lastSyncTime!.toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    if (!_disposed) {
      _farmersController.add(farmers);
      _purchasesController.add(purchases);
    }
  }

  Future<void> markAsSynced(String id, {required bool isFarmer}) async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final now = DateTime.now().toUtc().toIso8601String();
    if (isFarmer) {
      final index = _farmers.indexWhere((f) => f.id == id);
      if (index >= 0) {
        _farmers[index] = _farmers[index].copyWith(syncStatus: SyncStatus.synced);
        await db.update(
          DatabaseConstants.tableFarmers,
          {
            DatabaseConstants.columnSyncStatus: SyncStatus.synced.name,
            DatabaseConstants.columnUpdatedAt: now,
          },
          where: '${DatabaseConstants.columnId} = ?',
          whereArgs: [id],
        );
      }
    } else {
      final index = _purchases.indexWhere((p) => p.id == id);
      if (index >= 0) {
        _purchases[index] =
            _purchases[index].copyWith(syncStatus: SyncStatus.synced);
        await db.update(
          DatabaseConstants.tableCommodityPurchases,
          {
            DatabaseConstants.columnSyncStatus: SyncStatus.synced.name,
            DatabaseConstants.columnUpdatedAt: now,
          },
          where: '${DatabaseConstants.columnId} = ?',
          whereArgs: [id],
        );
      }
    }
    if (!_disposed) {
      _farmersController.add(farmers);
      _purchasesController.add(purchases);
    }
  }

  Future<void> markAsFailed(String id, {required bool isFarmer}) async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final now = DateTime.now().toUtc().toIso8601String();
    if (isFarmer) {
      final index = _farmers.indexWhere((f) => f.id == id);
      if (index >= 0) {
        _farmers[index] =
            _farmers[index].copyWith(syncStatus: SyncStatus.failed);
        await db.update(
          DatabaseConstants.tableFarmers,
          {
            DatabaseConstants.columnSyncStatus: SyncStatus.failed.name,
            DatabaseConstants.columnUpdatedAt: now,
          },
          where: '${DatabaseConstants.columnId} = ?',
          whereArgs: [id],
        );
      }
    } else {
      final index = _purchases.indexWhere((p) => p.id == id);
      if (index >= 0) {
        _purchases[index] =
            _purchases[index].copyWith(syncStatus: SyncStatus.failed);
        await db.update(
          DatabaseConstants.tableCommodityPurchases,
          {
            DatabaseConstants.columnSyncStatus: SyncStatus.failed.name,
            DatabaseConstants.columnUpdatedAt: now,
          },
          where: '${DatabaseConstants.columnId} = ?',
          whereArgs: [id],
        );
      }
    }
    if (!_disposed) {
      _farmersController.add(farmers);
      _purchasesController.add(purchases);
    }
  }

  // ─── Sync events ───────────────────────────────────────────────────────────

  Future<void> recordSyncEvent(SyncEvent event) async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    await db.insert(
      DatabaseConstants.tableSyncEvents,
      {
        DatabaseConstants.columnId: event.id,
        DatabaseConstants.columnOccurredAt:
            event.occurredAt.toUtc().toIso8601String(),
        DatabaseConstants.columnSuccess: event.success ? 1 : 0,
        DatabaseConstants.columnRecordsSynced: event.recordsSynced,
        DatabaseConstants.columnErrorMessage: event.errorMessage,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<SyncEvent>> getSyncHistory() async {
    await ready;
    final db = await DatabaseHelper.instance.database;
    final rows = await db.query(
      DatabaseConstants.tableSyncEvents,
      orderBy: '${DatabaseConstants.columnOccurredAt} DESC',
      limit: 50,
    );
    return rows.map(_mapSyncEventRow).toList();
  }

  // ─── SQLite row builders ───────────────────────────────────────────────────

  Future<void> _insertFarmerRow(
    Database db,
    Farmer farmer,
    String timestamp, {
    bool isSeed = false,
  }) async {
    await db.insert(
      DatabaseConstants.tableFarmers,
      {
        DatabaseConstants.columnId: farmer.id,
        // Use the farmer's own id as the uuid so it never changes on upsert.
        DatabaseConstants.columnUuid: farmer.id,
        'firstName': farmer.firstName,
        'lastName': farmer.lastName,
        'phoneNumber': farmer.phone,
        'nationalId': farmer.farmerId,
        DatabaseConstants.columnVillage: farmer.village,
        DatabaseConstants.columnDistrict: farmer.district,
        DatabaseConstants.columnClub: farmer.club,
        DatabaseConstants.columnAssociation: farmer.association,
        DatabaseConstants.columnCropsJson: jsonEncode(farmer.crops),
        DatabaseConstants.columnLatitude: farmer.latitude,
        DatabaseConstants.columnLongitude: farmer.longitude,
        DatabaseConstants.columnSeedLoanBalance: farmer.seedLoanBalance,
        DatabaseConstants.columnRegisteredAt:
            farmer.registeredAt.toUtc().toIso8601String(),
        DatabaseConstants.columnSyncStatus: farmer.syncStatus.name,
        DatabaseConstants.columnCreatedAt: timestamp,
        DatabaseConstants.columnUpdatedAt: timestamp,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> _insertPurchaseRow(
    Database db,
    CommodityPurchase purchase,
    String timestamp, {
    bool isSeed = false,
  }) async {
    await db.insert(
      DatabaseConstants.tableCommodityPurchases,
      {
        DatabaseConstants.columnId: purchase.id,
        DatabaseConstants.columnUuid: purchase.id,
        DatabaseConstants.columnFarmerUuid: purchase.farmerId,
        DatabaseConstants.columnCommodity: purchase.commodityType,
        DatabaseConstants.columnQuantity: purchase.quantityKg,
        DatabaseConstants.columnUnitPrice: purchase.pricePerKg,
        DatabaseConstants.columnTotalPrice: purchase.totalAmount,
        DatabaseConstants.columnPurchaseDate:
            purchase.purchasedAt.toUtc().toIso8601String(),
        DatabaseConstants.columnFarmerName: purchase.farmerName,
        DatabaseConstants.columnVariety: purchase.variety,
        DatabaseConstants.columnLoanRecovered: purchase.loanRecovered,
        DatabaseConstants.columnNetPayment: purchase.netPayment,
        DatabaseConstants.columnReceiptNumber: purchase.receiptNumber,
        DatabaseConstants.columnBuyingCenter: purchase.buyingCenter,
        DatabaseConstants.columnNumberOfBags: purchase.numberOfBags,
        DatabaseConstants.columnBagTagRange: purchase.bagTagRange,
        DatabaseConstants.columnSyncStatus: purchase.syncStatus.name,
        DatabaseConstants.columnCreatedAt: timestamp,
        DatabaseConstants.columnUpdatedAt: timestamp,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // ─── SQLite row mappers ────────────────────────────────────────────────────

  Farmer _mapFarmerRow(Map<String, dynamic> row) {
    final cropsJson = row[DatabaseConstants.columnCropsJson] as String?;
    return Farmer(
      id: row[DatabaseConstants.columnId] as String,
      farmerId: row['nationalId'] as String? ??
          row[DatabaseConstants.columnUuid] as String,
      firstName: row['firstName'] as String,
      lastName: row['lastName'] as String,
      phone: row['phoneNumber'] as String,
      village: row[DatabaseConstants.columnVillage] as String? ?? '',
      district: row[DatabaseConstants.columnDistrict] as String? ?? '',
      club: row[DatabaseConstants.columnClub] as String? ?? '',
      association: row[DatabaseConstants.columnAssociation] as String? ?? '',
      crops: cropsJson == null
          ? const []
          : List<String>.from(jsonDecode(cropsJson) as List),
      latitude: row[DatabaseConstants.columnLatitude] as double?,
      longitude: row[DatabaseConstants.columnLongitude] as double?,
      seedLoanBalance:
          (row[DatabaseConstants.columnSeedLoanBalance] as num?)?.toDouble() ??
              0,
      registeredAt: DateTime.parse(
          row[DatabaseConstants.columnRegisteredAt] as String),
      syncStatus: SyncStatus.values.firstWhere(
        (s) => s.name == (row[DatabaseConstants.columnSyncStatus] as String),
        orElse: () => SyncStatus.pending,
      ),
    );
  }

  CommodityPurchase _mapPurchaseRow(Map<String, dynamic> row) {
    return CommodityPurchase(
      id: row[DatabaseConstants.columnId] as String,
      farmerId: row[DatabaseConstants.columnFarmerUuid] as String,
      farmerName: row[DatabaseConstants.columnFarmerName] as String? ?? '',
      commodityType: row[DatabaseConstants.columnCommodity] as String,
      variety: row[DatabaseConstants.columnVariety] as String? ?? '',
      quantityKg: (row[DatabaseConstants.columnQuantity] as num).toDouble(),
      pricePerKg: (row[DatabaseConstants.columnUnitPrice] as num).toDouble(),
      totalAmount: (row[DatabaseConstants.columnTotalPrice] as num).toDouble(),
      loanRecovered:
          (row[DatabaseConstants.columnLoanRecovered] as num?)?.toDouble() ?? 0,
      netPayment:
          (row[DatabaseConstants.columnNetPayment] as num?)?.toDouble() ?? 0,
      receiptNumber: row[DatabaseConstants.columnReceiptNumber] as String? ?? '',
      numberOfBags: (row[DatabaseConstants.columnNumberOfBags] as num?)?.toInt() ?? 0,
      bagTagRange: row[DatabaseConstants.columnBagTagRange] as String? ?? '',
      purchasedAt: DateTime.parse(
          row[DatabaseConstants.columnPurchaseDate] as String),
      buyingCenter: row[DatabaseConstants.columnBuyingCenter] as String? ?? '',
      syncStatus: SyncStatus.values.firstWhere(
        (s) => s.name == (row[DatabaseConstants.columnSyncStatus] as String),
        orElse: () => SyncStatus.pending,
      ),
    );
  }

  Farm _mapFarmRow(Map<String, dynamic> row) {
    return Farm(
      id: row[DatabaseConstants.columnId] as String,
      farmerUuid: row[DatabaseConstants.columnFarmerUuid] as String,
      farmName: row[DatabaseConstants.columnFarmName] as String,
      location: row[DatabaseConstants.columnLocation] as String,
      acreage: (row[DatabaseConstants.columnAcreage] as num?)?.toDouble(),
      primaryCrop: row[DatabaseConstants.columnPrimaryCrop] as String?,
      syncStatus: SyncStatus.values.firstWhere(
        (s) => s.name == (row[DatabaseConstants.columnSyncStatus] as String? ?? 'pending'),
        orElse: () => SyncStatus.pending,
      ),
      createdAt: DateTime.parse(
          row[DatabaseConstants.columnCreatedAt] as String),
    );
  }

  SyncEvent _mapSyncEventRow(Map<String, dynamic> row) {
    return SyncEvent(
      id: row[DatabaseConstants.columnId] as String,
      occurredAt:
          DateTime.parse(row[DatabaseConstants.columnOccurredAt] as String),
      success: (row[DatabaseConstants.columnSuccess] as int) == 1,
      recordsSynced: row[DatabaseConstants.columnRecordsSynced] as int,
      errorMessage: row[DatabaseConstants.columnErrorMessage] as String?,
    );
  }

  // ─── Disposal ──────────────────────────────────────────────────────────────

  Future<void> dispose() async {
    if (_disposed) return;
    _disposed = true;
    _connectivityService.dispose();
    await _farmersController.close();
    await _purchasesController.close();
  }
}
