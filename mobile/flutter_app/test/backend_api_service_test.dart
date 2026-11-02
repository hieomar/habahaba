import 'package:flutter_test/flutter_test.dart';
import 'package:gtms/data/datasources/backend_api_service.dart';
import 'package:gtms/domain/entities/entities.dart';

void main() {
  group('BackendApiService mapping', () {
    test('maps login payload to an AppUser', () {
      final user = BackendApiService.mapUserFromPayload({
        'id': 7,
        'name': 'Admin User',
        'email': 'admin@nasfam.org',
        'role': 'admin',
        'ipc': 'Head Office',
      });

      expect(user.name, 'Admin User');
      expect(user.email, 'admin@nasfam.org');
      expect(user.role, UserRole.marketingOfficer);
    });

    test('maps backend farmer payload to the domain model', () {
      final farmer = BackendApiService.mapFarmerFromPayload({
        'id': 12,
        'farmerId': 'NAS-LLW-00129',
        'firstName': 'Grace',
        'lastName': 'Phiri',
        'phone': '+265991234567',
        'village': 'Chinsapo',
        'district': 'Lilongwe',
        'club': {'name': 'Chinsapo Club'},
        'associationName': 'Lilongwe Association',
        'crops': ['Maize', 'Soybean'],
        'gpsLatitude': -13.98,
        'gpsLongitude': 33.78,
        'seedLoanBalance': 12500,
        'createdAt': '2026-07-24T09:00:00.000Z',
      });

      expect(farmer.id, '12');
      expect(farmer.fullName, 'Grace Phiri');
      expect(farmer.village, 'Chinsapo');
      expect(farmer.syncStatus, SyncStatus.synced);
    });
  });
}
