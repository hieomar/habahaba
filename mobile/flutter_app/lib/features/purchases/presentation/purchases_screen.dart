import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';
import 'package:gtms/features/purchases/presentation/commodity_purchase_screen.dart';

class PurchasesScreen extends StatelessWidget {
  const PurchasesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final purchases = context.watch<GtmsController>().purchases;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Commodity Purchases'),
        actions: [
          IconButton(
            tooltip: context.watch<GtmsController>().isDarkMode
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode',
            icon: Icon(
              context.watch<GtmsController>().isDarkMode
                  ? Icons.light_mode_rounded
                  : Icons.dark_mode_outlined,
            ),
            onPressed: () => context.read<GtmsController>().toggleTheme(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'purchases_fab',
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CommodityPurchaseScreen()),
          );
        },
        backgroundColor: AppTheme.primaryGreen,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Record Purchase',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: Column(
        children: [
          // Summary strip
          Container(
            color: AppTheme.primaryGreen,
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            child: Row(
              children: [
                _SummaryItem(
                  label: 'Today',
                  value: '${purchases.length} purchases',
                ),
                const _Divider(),
                _SummaryItem(
                  label: 'Total Kg',
                  value:
                      '${purchases.fold(0.0, (s, p) => s + p.quantityKg).toStringAsFixed(0)} kg',
                ),
                const _Divider(),
                _SummaryItem(
                  label: 'Total Paid',
                  value:
                      'MK ${_fmt(purchases.fold(0.0, (s, p) => s + p.netPayment))}',
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              physics: const ClampingScrollPhysics(),
              itemCount: purchases.length,
              itemBuilder: (ctx, i) {
                final p = purchases[i];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _PurchaseCard(purchase: p),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  static String _fmt(double v) => v.toStringAsFixed(0);
}

class _SummaryItem extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(color: Colors.white60, fontSize: 10)),
          Text(value,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) {
    return Container(
        width: 1, height: 30, color: Colors.white24, margin: const EdgeInsets.symmetric(horizontal: 12));
  }
}

class _PurchaseCard extends StatelessWidget {
  final CommodityPurchase purchase;
  const _PurchaseCard({required this.purchase});

  @override
  Widget build(BuildContext context) {
    final isSynced = purchase.syncStatus == SyncStatus.synced;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final farmerNameColor = isDark ? Colors.white : AppTheme.textDark;
    final iconBg = isDark ? AppTheme.darkInput : const Color(0xFFEEEEEE);
    final iconColor = isDark ? AppTheme.accentGreen : AppTheme.textMedium;
    final bannerBg = isDark ? AppTheme.darkInput : const Color(0xFFEEEEEE);
    final bannerLabelColor = isDark ? Colors.white70 : AppTheme.textMedium;
    final bannerValueColor = isDark ? Colors.white : AppTheme.textDark;
    final subTextColor = isDark ? Colors.white54 : AppTheme.textLight;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            decoration: BoxDecoration(
              border: Border(
                  bottom: BorderSide(color: Theme.of(context).dividerColor, width: 0.8)),
            ),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.grain_rounded,
                      color: iconColor, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        purchase.farmerName,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: farmerNameColor,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  isSynced ? 'Synced' : 'Pending',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isSynced
                        ? (isDark ? AppTheme.accentGreen : AppTheme.primaryGreen)
                        : AppTheme.accentAmber,
                  ),
                ),
              ],
            ),
          ),

          // Body
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  children: [
                    _Detail(
                        label: 'Commodity',
                        value:
                            '${purchase.commodityType} — ${purchase.variety}'),
                    _Detail(
                        label: 'Quantity',
                        value:
                            '${purchase.quantityKg.toStringAsFixed(0)} kg'),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    _Detail(
                        label: 'Price/kg',
                        value:
                            'MK ${purchase.pricePerKg.toStringAsFixed(0)}'),
                    _Detail(
                        label: 'Loan Recovered',
                        value: purchase.loanRecovered > 0
                            ? 'MK ${_fmt(purchase.loanRecovered)}'
                            : 'None'),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: bannerBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Net Payment to Farmer',
                                style: TextStyle(
                                    fontSize: 11, color: bannerLabelColor)),
                            Text(
                              'MK ${_fmt(purchase.netPayment)}',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: bannerValueColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            purchase.receiptNumber,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: bannerLabelColor,
                              fontFamily: 'monospace',
                            ),
                          ),
                          if (purchase.bagTagRange.isNotEmpty)
                            Text(
                              purchase.bagTagRange,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w500,
                                color: bannerLabelColor,
                                fontFamily: 'monospace',
                              ),
                            ),
                          Text(
                            purchase.buyingCenter,
                            style: TextStyle(
                                fontSize: 10, color: subTextColor),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _fmt(double v) => v.toStringAsFixed(0);
}

class _Detail extends StatelessWidget {
  final String label;
  final String value;
  const _Detail({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor = isDark ? Colors.white54 : AppTheme.textLight;
    final valueColor = isDark ? Colors.white : AppTheme.textDark;

    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style:
                  TextStyle(fontSize: 10, color: labelColor)),
          Text(value,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: valueColor)),
        ],
      ),
    );
  }
}
