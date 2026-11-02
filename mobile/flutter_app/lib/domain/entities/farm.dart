import 'package:gtms/domain/entities/sync_status.dart';

class Farm {
  final String id;
  final String farmerUuid;
  final String farmName;
  final String location;
  final double? acreage;
  final String? primaryCrop;
  final SyncStatus syncStatus;
  final DateTime createdAt;

  const Farm({
    required this.id,
    required this.farmerUuid,
    required this.farmName,
    required this.location,
    this.acreage,
    this.primaryCrop,
    required this.syncStatus,
    required this.createdAt,
  });

  Farm copyWith({
    String? id,
    String? farmerUuid,
    String? farmName,
    String? location,
    double? acreage,
    String? primaryCrop,
    SyncStatus? syncStatus,
    DateTime? createdAt,
  }) {
    return Farm(
      id: id ?? this.id,
      farmerUuid: farmerUuid ?? this.farmerUuid,
      farmName: farmName ?? this.farmName,
      location: location ?? this.location,
      acreage: acreage ?? this.acreage,
      primaryCrop: primaryCrop ?? this.primaryCrop,
      syncStatus: syncStatus ?? this.syncStatus,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
