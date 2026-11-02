import 'package:gtms/data/datasources/local_data_store.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/domain/repositories/repositories.dart';

class FarmerRepositoryImpl implements FarmerRepository {
  FarmerRepositoryImpl(this._store);

  final LocalDataStore _store;

  @override
  List<Farmer> get farmers => _store.farmers;

  @override
  Stream<List<Farmer>> watchFarmers() => _store.farmersStream;

  @override
  List<Farmer> search(String query) {
    if (query.trim().isEmpty) return farmers;
    final q = query.toLowerCase();
    return farmers.where((f) {
      return f.fullName.toLowerCase().contains(q) ||
          f.farmerId.toLowerCase().contains(q) ||
          f.village.toLowerCase().contains(q) ||
          f.club.toLowerCase().contains(q) ||
          f.phone.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Farmer? findById(String id) {
    try {
      return farmers.firstWhere((f) => f.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Farmer? findByFarmerId(String farmerId) {
    try {
      return farmers.firstWhere((f) => f.farmerId == farmerId);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Farmer> registerFarmer(Farmer farmer) async {
    final stored = farmer.copyWith(syncStatus: SyncStatus.pending);
    await _store.upsertFarmer(stored);
    return stored;
  }

  /// Exposed for [GtmsController.nextFarmerId].
  Future<int> nextFarmerSequence() => _store.nextFarmerSequence();
}
