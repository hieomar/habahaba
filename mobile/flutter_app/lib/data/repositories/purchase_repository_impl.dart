import 'package:gtms/data/datasources/local_data_store.dart';
import 'package:gtms/data/datasources/local_seed_data.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/domain/repositories/repositories.dart';

class PurchaseRepositoryImpl implements PurchaseRepository {
  PurchaseRepositoryImpl(this._store);

  final LocalDataStore _store;

  @override
  List<CommodityPurchase> get purchases => _store.purchases;

  @override
  Stream<List<CommodityPurchase>> watchPurchases() => _store.purchasesStream;

  @override
  List<CommodityPurchase> forFarmer(String farmerId) =>
      purchases.where((p) => p.farmerId == farmerId).toList();

  @override
  List<String> get commodityTypes => LocalSeedData.commodityTypes;

  @override
  Map<String, List<String>> get varieties => LocalSeedData.varieties;

  @override
  Future<CommodityPurchase> recordPurchase(CommodityPurchase purchase) async {
    final stored = purchase.copyWith(syncStatus: SyncStatus.pending);
    await _store.upsertPurchase(stored);
    return stored;
  }

  /// Exposed for [GtmsController.nextReceiptNumber].
  Future<int> nextPurchaseSequence() => _store.nextPurchaseSequence();
}
