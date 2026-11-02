import 'package:flutter_test/flutter_test.dart';
import 'package:gtms/data/datasources/local_data_store.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  sqfliteFfiInit();
  databaseFactory = databaseFactoryFfi;

  test('store exposes the expected farmer and purchase state', () async {
    final store = LocalDataStore();
    await store.ready;

    expect(store.farmers, isNotEmpty);
    expect(store.purchases, isNotEmpty);
    expect(store.pendingCount, greaterThanOrEqualTo(0));

    final farmer = Farmer(
      id: 'f_test_persist',
      farmerId: 'NAS-TEST-00001',
      firstName: 'Test',
      lastName: 'Farmer',
      phone: '+265999000111',
      village: 'Test Village',
      district: 'Lilongwe',
      club: 'Test Club',
      association: 'Test Association',
      crops: const ['Maize'],
      latitude: -13.9,
      longitude: 33.7,
      seedLoanBalance: 0,
      registeredAt: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );

    await store.upsertFarmer(farmer);
    expect(store.farmers.any((item) => item.id == farmer.id), isTrue);

    await store.dispose();
  });
}
