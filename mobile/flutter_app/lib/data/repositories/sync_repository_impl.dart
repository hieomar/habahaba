import 'package:gtms/data/datasources/local_data_store.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/domain/repositories/repositories.dart';
import 'package:uuid/uuid.dart';

class SyncRepositoryImpl implements SyncRepository {
  SyncRepositoryImpl(this._store);

  final LocalDataStore _store;
  final _uuid = const Uuid();

  @override
  int get pendingCount => _store.pendingCount;

  @override
  DateTime? get lastSyncTime => _store.lastSyncTime;

  @override
  bool get isOnline => _store.isOnline;

  @override
  List<Farmer> get pendingFarmers =>
      _store.farmers.where((f) => f.syncStatus != SyncStatus.synced).toList();

  @override
  List<CommodityPurchase> get pendingPurchases =>
      _store.purchases.where((p) => p.syncStatus != SyncStatus.synced).toList();

  @override
  Future<void> syncAll() async {
    if (!_store.isOnline) throw SyncException('No internet connection');

    final pending = pendingCount;

    // Simulate network latency proportional to record count.
    final delay = Duration(
        milliseconds: 800 + (pending * 120).clamp(0, 3000).toInt());
    await Future<void>.delayed(delay);

    await _store.markAllSynced();

    await _store.recordSyncEvent(SyncEvent(
      id: _uuid.v4(),
      occurredAt: DateTime.now(),
      success: true,
      recordsSynced: pending,
    ));
  }

  /// Called by GtmsController when auto-sync is triggered by connectivity.
  Future<void> syncAllQuiet() async {
    if (!_store.isOnline || _store.pendingCount == 0) return;
    try {
      await syncAll();
    } catch (_) {
      // Auto-sync failures are silent — user can retry manually.
    }
  }

  @override
  Future<List<SyncEvent>> getSyncHistory() => _store.getSyncHistory();

  @override
  DashboardStats dashboardStats() {
    final today = DateTime.now();
    final purchasesToday = _store.purchases.where((p) {
      return p.purchasedAt.year == today.year &&
          p.purchasedAt.month == today.month &&
          p.purchasedAt.day == today.day;
    }).toList();

    final registeredToday = _store.farmers.where((f) {
      return f.registeredAt.year == today.year &&
          f.registeredAt.month == today.month &&
          f.registeredAt.day == today.day;
    }).length;

    final kgToday =
        purchasesToday.fold(0.0, (s, p) => s + p.quantityKg);

    return DashboardStats(
      totalFarmers: _store.farmers.length,
      farmersRegisteredToday: registeredToday,
      purchasesToday: purchasesToday.length,
      totalKgToday: kgToday,
      pendingSyncItems: pendingCount,
      lastSyncTime: lastSyncTime,
      isOnline: isOnline,
    );
  }
}

class SyncException implements Exception {
  SyncException(this.message);
  final String message;
  @override
  String toString() => message;
}
