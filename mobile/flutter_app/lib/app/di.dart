import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';

import 'package:gtms/data/datasources/connectivity_service.dart';
import 'package:gtms/data/datasources/local_data_store.dart';
import 'package:gtms/data/repositories/auth_repository_impl.dart';
import 'package:gtms/data/repositories/farm_repository_impl.dart';
import 'package:gtms/data/repositories/farmer_repository_impl.dart';
import 'package:gtms/data/repositories/purchase_repository_impl.dart';
import 'package:gtms/data/repositories/sync_repository_impl.dart';
import 'package:gtms/domain/repositories/repositories.dart';
import 'package:gtms/state/gtms_controller.dart';

/// Composition root — wires data sources, repositories, and app state.
List<SingleChildWidget> buildAppProviders() {
  final connectivityService = ConnectivityService();
  final store = LocalDataStore(connectivityService: connectivityService);
  final authRepo = AuthRepositoryImpl(store);
  final farmerRepo = FarmerRepositoryImpl(store);
  final farmRepo = FarmRepositoryImpl(store);
  final purchaseRepo = PurchaseRepositoryImpl(store);
  final syncRepo = SyncRepositoryImpl(store);

  return [
    Provider<ConnectivityService>.value(value: connectivityService),
    Provider<LocalDataStore>.value(value: store),
    Provider<AuthRepository>.value(value: authRepo),
    Provider<FarmerRepository>.value(value: farmerRepo),
    Provider<FarmRepository>.value(value: farmRepo),
    Provider<PurchaseRepository>.value(value: purchaseRepo),
    Provider<SyncRepository>.value(value: syncRepo),
    ChangeNotifierProvider<GtmsController>(
      create: (_) => GtmsController(
        authRepository: authRepo,
        farmerRepository: farmerRepo,
        farmRepository: farmRepo,
        purchaseRepository: purchaseRepo,
        syncRepository: syncRepo,
        connectivityService: connectivityService,
      ),
    ),
  ];
}

/// Convenience extensions for reading repositories from [BuildContext].
extension GtmsContextX on BuildContext {
  GtmsController get gtms => read<GtmsController>();
  GtmsController get watchGtms => watch<GtmsController>();
  FarmerRepository get farmers => read<FarmerRepository>();
  FarmRepository get farms => read<FarmRepository>();
  PurchaseRepository get purchases => read<PurchaseRepository>();
  SyncRepository get sync => read<SyncRepository>();
  AuthRepository get auth => read<AuthRepository>();
}
