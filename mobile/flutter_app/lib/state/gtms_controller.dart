import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gtms/data/datasources/connectivity_service.dart';
import 'package:gtms/data/repositories/sync_repository_impl.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/domain/repositories/repositories.dart';

/// Application-facing state for presentation layers.
class GtmsController extends ChangeNotifier {
  GtmsController({
    required AuthRepository authRepository,
    required FarmerRepository farmerRepository,
    required FarmRepository farmRepository,
    required PurchaseRepository purchaseRepository,
    required SyncRepository syncRepository,
    required ConnectivityService connectivityService,
  })  : _auth = authRepository,
        _farmers = farmerRepository,
        _farms = farmRepository,
        _purchases = purchaseRepository,
        _sync = syncRepository {
    _farmerSub = _farmers.watchFarmers().listen((_) => notifyListeners());
    _purchaseSub = _purchases.watchPurchases().listen((_) => notifyListeners());
    // Auto-sync pending records when the device comes back online.
    _connectivitySub = connectivityService.stream.listen(_onConnectivityChanged);
  }

  final AuthRepository _auth;
  final FarmerRepository _farmers;
  final FarmRepository _farms;
  final PurchaseRepository _purchases;
  final SyncRepository _sync;

  StreamSubscription<List<Farmer>>? _farmerSub;
  StreamSubscription<List<CommodityPurchase>>? _purchaseSub;
  StreamSubscription<bool>? _connectivitySub;

  bool _isBusy = false;
  String? _errorMessage;
  ThemeMode _themeMode = ThemeMode.light;

  bool get isBusy => _isBusy;
  String? get errorMessage => _errorMessage;
  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  void toggleTheme() {
    _themeMode =
        _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }

  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }

  bool get isAuthenticated => _auth.isAuthenticated;
  AppUser? get currentUser => _auth.currentUser;

  List<Farmer> get farmers => _farmers.farmers;
  List<CommodityPurchase> get purchases => _purchases.purchases;
  List<String> get commodityTypes => _purchases.commodityTypes;
  Map<String, List<String>> get varieties => _purchases.varieties;

  DashboardStats get stats => _sync.dashboardStats();
  int get pendingSyncCount => _sync.pendingCount;
  bool get isOnline => _sync.isOnline;
  DateTime? get lastSyncTime => _sync.lastSyncTime;
  List<Farmer> get pendingFarmers => _sync.pendingFarmers;
  List<CommodityPurchase> get pendingPurchases => _sync.pendingPurchases;

  List<Farmer> searchFarmers(String query) => _farmers.search(query);

  List<CommodityPurchase> purchasesForFarmer(String farmerId) =>
      _purchases.forFarmer(farmerId);

  Future<List<SyncEvent>> getSyncHistory() => _sync.getSyncHistory();

  // ─── Auth ──────────────────────────────────────────────────────────────────

  Future<bool> login(String username, String password) async {
    _setBusy(true);
    try {
      await _auth.login(username: username, password: password);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      _setBusy(false);
    }
  }

  Future<void> logout() async {
    await _auth.logout();
    notifyListeners();
  }

  // ─── Farmers & farms ───────────────────────────────────────────────────────

  Future<Farmer> registerFarmer(Farmer farmer) async {
    final saved = await _farmers.registerFarmer(farmer);
    notifyListeners();
    return saved;
  }

  Future<Farm> registerFarm(Farm farm) async {
    final saved = await _farms.registerFarm(farm);
    notifyListeners();
    return saved;
  }

  Future<List<Farm>> farmsForFarmer(String farmerUuid) =>
      _farms.farmsForFarmer(farmerUuid);

  Stream<List<Farm>> watchFarmsForFarmer(String farmerUuid) =>
      _farms.watchFarmsForFarmer(farmerUuid);

  // ─── Purchases ─────────────────────────────────────────────────────────────

  Future<CommodityPurchase> recordPurchase(CommodityPurchase purchase) async {
    final saved = await _purchases.recordPurchase(purchase);
    notifyListeners();
    return saved;
  }

  // ─── Sequence generators ───────────────────────────────────────────────────

  /// Returns the next farmer ID string, e.g. "NAS-LLW-00129".
  Future<String> nextFarmerId() async {
    // Access the store through the sync repo's store; or do it via auth.
    // We use a shared accessor via the local data store exposed on di.
    // Since we don't have direct store access here, delegate through the repo.
    // FarmerRepository doesn't expose this — call nextFarmerSequence via the
    // PurchaseRepository's underlying store or via a thin method we add.
    // Simplest: expose it through FarmerRepository interface.
    final seq = await (_farmers as dynamic).nextFarmerSequence() as int;
    return 'NAS-LLW-${seq.toString().padLeft(5, '0')}';
  }

  /// Returns the next receipt number string, e.g. "RCP-2026-0894".
  Future<String> nextReceiptNumber() async {
    final seq = await (_purchases as dynamic).nextPurchaseSequence() as int;
    final year = DateTime.now().year;
    return 'RCP-$year-${seq.toString().padLeft(4, '0')}';
  }

  // ─── Sync ──────────────────────────────────────────────────────────────────

  Future<bool> syncAll() async {
    _setBusy(true);
    try {
      await _sync.syncAll();
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      _setBusy(false);
    }
  }

  void _onConnectivityChanged(bool online) {
    notifyListeners(); // Refresh UI for online indicator.
    if (online && _sync.pendingCount > 0 && !_isBusy) {
      // Auto-sync silently in the background.
      (_sync as SyncRepositoryImpl).syncAllQuiet().then((_) {
        notifyListeners();
      });
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void _setBusy(bool value) {
    _isBusy = value;
    notifyListeners();
  }

  @override
  void dispose() {
    _farmerSub?.cancel();
    _purchaseSub?.cancel();
    _connectivitySub?.cancel();
    super.dispose();
  }
}
