import 'package:gtms/domain/entities/entities.dart';

abstract class AuthRepository {
  AppUser? get currentUser;
  bool get isAuthenticated;
  Future<AppUser> login({required String username, required String password});
  Future<void> logout();
}

abstract class FarmerRepository {
  List<Farmer> get farmers;
  List<Farmer> search(String query);
  Farmer? findById(String id);
  Farmer? findByFarmerId(String farmerId);
  Future<Farmer> registerFarmer(Farmer farmer);
  Stream<List<Farmer>> watchFarmers();
}

abstract class FarmRepository {
  Future<Farm> registerFarm(Farm farm);
  Future<List<Farm>> farmsForFarmer(String farmerUuid);
  Stream<List<Farm>> watchFarmsForFarmer(String farmerUuid);
}

abstract class PurchaseRepository {
  List<CommodityPurchase> get purchases;
  List<CommodityPurchase> forFarmer(String farmerId);
  List<String> get commodityTypes;
  Map<String, List<String>> get varieties;
  Future<CommodityPurchase> recordPurchase(CommodityPurchase purchase);
  Stream<List<CommodityPurchase>> watchPurchases();
}

abstract class SyncRepository {
  int get pendingCount;
  DateTime? get lastSyncTime;
  bool get isOnline;
  List<Farmer> get pendingFarmers;
  List<CommodityPurchase> get pendingPurchases;
  Future<void> syncAll();
  Future<List<SyncEvent>> getSyncHistory();
  DashboardStats dashboardStats();
}
