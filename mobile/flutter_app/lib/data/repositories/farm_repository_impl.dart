import 'dart:async';

import 'package:gtms/data/datasources/local_data_store.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/domain/repositories/repositories.dart';

class FarmRepositoryImpl implements FarmRepository {
  FarmRepositoryImpl(this._store);

  final LocalDataStore _store;
  final _controllers = <String, StreamController<List<Farm>>>{};

  @override
  Future<Farm> registerFarm(Farm farm) async {
    final stored = farm.copyWith(syncStatus: SyncStatus.pending);
    await _store.upsertFarm(stored);
    _notifyFarmer(farm.farmerUuid);
    return stored;
  }

  @override
  Future<List<Farm>> farmsForFarmer(String farmerUuid) =>
      _store.getFarmsForFarmer(farmerUuid);

  @override
  Stream<List<Farm>> watchFarmsForFarmer(String farmerUuid) {
    _controllers.putIfAbsent(
        farmerUuid, () => StreamController<List<Farm>>.broadcast());
    // Emit current state immediately.
    _store.getFarmsForFarmer(farmerUuid).then((farms) {
      final ctrl = _controllers[farmerUuid];
      if (ctrl != null && !ctrl.isClosed) ctrl.add(farms);
    });
    return _controllers[farmerUuid]!.stream;
  }

  void _notifyFarmer(String farmerUuid) {
    _store.getFarmsForFarmer(farmerUuid).then((farms) {
      final ctrl = _controllers[farmerUuid];
      if (ctrl != null && !ctrl.isClosed) ctrl.add(farms);
    });
  }
}
