import 'package:gtms/domain/entities/sync_status.dart';

class Farmer {
  final String id;
  final String farmerId;
  final String firstName;
  final String lastName;
  final String phone;
  final String village;
  final String district;
  final String club;
  final String association;
  final List<String> crops;
  final double? latitude;
  final double? longitude;
  final double seedLoanBalance;
  final DateTime registeredAt;
  final SyncStatus syncStatus;

  const Farmer({
    required this.id,
    required this.farmerId,
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.village,
    required this.district,
    required this.club,
    required this.association,
    required this.crops,
    this.latitude,
    this.longitude,
    required this.seedLoanBalance,
    required this.registeredAt,
    required this.syncStatus,
  });

  String get fullName => '$firstName $lastName';

  Farmer copyWith({
    String? id,
    String? farmerId,
    String? firstName,
    String? lastName,
    String? phone,
    String? village,
    String? district,
    String? club,
    String? association,
    List<String>? crops,
    double? latitude,
    double? longitude,
    double? seedLoanBalance,
    DateTime? registeredAt,
    SyncStatus? syncStatus,
  }) {
    return Farmer(
      id: id ?? this.id,
      farmerId: farmerId ?? this.farmerId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      village: village ?? this.village,
      district: district ?? this.district,
      club: club ?? this.club,
      association: association ?? this.association,
      crops: crops ?? this.crops,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      seedLoanBalance: seedLoanBalance ?? this.seedLoanBalance,
      registeredAt: registeredAt ?? this.registeredAt,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }
}
