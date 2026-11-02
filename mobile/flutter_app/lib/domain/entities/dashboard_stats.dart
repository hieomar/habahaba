class DashboardStats {
  final int totalFarmers;
  final int farmersRegisteredToday;
  final int purchasesToday;
  final double totalKgToday;
  final int pendingSyncItems;
  final DateTime? lastSyncTime;
  final bool isOnline;

  const DashboardStats({
    required this.totalFarmers,
    required this.farmersRegisteredToday,
    required this.purchasesToday,
    required this.totalKgToday,
    required this.pendingSyncItems,
    this.lastSyncTime,
    required this.isOnline,
  });

  DashboardStats copyWith({
    int? totalFarmers,
    int? farmersRegisteredToday,
    int? purchasesToday,
    double? totalKgToday,
    int? pendingSyncItems,
    DateTime? lastSyncTime,
    bool? isOnline,
  }) {
    return DashboardStats(
      totalFarmers: totalFarmers ?? this.totalFarmers,
      farmersRegisteredToday:
          farmersRegisteredToday ?? this.farmersRegisteredToday,
      purchasesToday: purchasesToday ?? this.purchasesToday,
      totalKgToday: totalKgToday ?? this.totalKgToday,
      pendingSyncItems: pendingSyncItems ?? this.pendingSyncItems,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
      isOnline: isOnline ?? this.isOnline,
    );
  }
}
