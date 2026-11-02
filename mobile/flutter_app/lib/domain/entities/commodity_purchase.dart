import 'package:gtms/domain/entities/sync_status.dart';

class CommodityPurchase {
  final String id;
  final String farmerId;
  final String farmerName;
  final String commodityType;
  final String variety;
  final double quantityKg;
  final double pricePerKg;
  final double totalAmount;
  final double loanRecovered;
  final double netPayment;
  final String receiptNumber;
  final int numberOfBags;
  final String bagTagRange;
  final DateTime purchasedAt;
  final String buyingCenter;
  final SyncStatus syncStatus;

  const CommodityPurchase({
    required this.id,
    required this.farmerId,
    required this.farmerName,
    required this.commodityType,
    required this.variety,
    required this.quantityKg,
    required this.pricePerKg,
    required this.totalAmount,
    required this.loanRecovered,
    required this.netPayment,
    required this.receiptNumber,
    this.numberOfBags = 0,
    this.bagTagRange = '',
    required this.purchasedAt,
    required this.buyingCenter,
    required this.syncStatus,
  });

  CommodityPurchase copyWith({
    String? id,
    String? farmerId,
    String? farmerName,
    String? commodityType,
    String? variety,
    double? quantityKg,
    double? pricePerKg,
    double? totalAmount,
    double? loanRecovered,
    double? netPayment,
    String? receiptNumber,
    int? numberOfBags,
    String? bagTagRange,
    DateTime? purchasedAt,
    String? buyingCenter,
    SyncStatus? syncStatus,
  }) {
    return CommodityPurchase(
      id: id ?? this.id,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      commodityType: commodityType ?? this.commodityType,
      variety: variety ?? this.variety,
      quantityKg: quantityKg ?? this.quantityKg,
      pricePerKg: pricePerKg ?? this.pricePerKg,
      totalAmount: totalAmount ?? this.totalAmount,
      loanRecovered: loanRecovered ?? this.loanRecovered,
      netPayment: netPayment ?? this.netPayment,
      receiptNumber: receiptNumber ?? this.receiptNumber,
      numberOfBags: numberOfBags ?? this.numberOfBags,
      bagTagRange: bagTagRange ?? this.bagTagRange,
      purchasedAt: purchasedAt ?? this.purchasedAt,
      buyingCenter: buyingCenter ?? this.buyingCenter,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }
}
