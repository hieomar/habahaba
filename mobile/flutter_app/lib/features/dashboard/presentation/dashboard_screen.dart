import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/core/widgets/section_header.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';
import 'package:gtms/features/trace/presentation/trace_lookup_screen.dart';
import 'package:gtms/features/farmers/presentation/farmer_registration_screen.dart';
import 'package:gtms/features/purchases/presentation/commodity_purchase_screen.dart';
import 'package:gtms/features/purchases/presentation/purchases_screen.dart';
import 'package:gtms/features/farmers/presentation/farmers_screen.dart';
import 'package:gtms/features/dashboard/presentation/notifications_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GtmsController>();
    final stats = controller.stats;
    final user = controller.currentUser!;
    // Show only the 5 most recent purchases.
    final recentPurchases = controller.purchases.take(5).toList();

    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Good morning,'
        : hour < 17
            ? 'Good afternoon,'
            : 'Good evening,';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Fixed header
        Container(
          color: AppTheme.primaryGreen,
          padding: EdgeInsets.fromLTRB(
              20, MediaQuery.of(context).padding.top + 16, 20, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(5),
                          child: Image.asset(
                            'assets/images/logo.png',
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'NASFAM GTMS',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            greeting,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.8),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        tooltip: controller.isDarkMode
                            ? 'Switch to Light Mode'
                            : 'Switch to Dark Mode',
                        icon: Icon(
                          controller.isDarkMode
                              ? Icons.light_mode_rounded
                              : Icons.dark_mode_outlined,
                          color: Colors.white,
                          size: 22,
                        ),
                        onPressed: () =>
                            context.read<GtmsController>().toggleTheme(),
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.only(right: 14),
                      ),
                      IconButton(
                        icon: const Icon(
                            Icons.notifications_outlined,
                            color: Colors.white,
                            size: 22),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const NotificationsScreen(),
                            ),
                          );
                        },
                        constraints: const BoxConstraints(),
                        padding: EdgeInsets.zero,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Text(
                      user.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25)),
                    ),
                    child: Text(
                      user.role.label,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Scrollable body
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Today's activity
                _SectionLabel(label: "Today's Activity"),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _StatCard(
                        label: 'Purchases\nRecorded',
                        value: '${stats.purchasesToday}',
                        icon: Icons.receipt_long_outlined,
                        iconColor: AppTheme.textMedium,
                        bgColor: const Color(0xFFEEEEEE),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _StatCard(
                        label: 'Total\nKg Bought',
                        value: stats.totalKgToday >= 1000
                            ? '${(stats.totalKgToday / 1000).toStringAsFixed(1)}t'
                            : '${stats.totalKgToday.toStringAsFixed(0)} kg',
                        icon: Icons.scale_outlined,
                        iconColor: AppTheme.textMedium,
                        bgColor: const Color(0xFFEEEEEE),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Sync status banner
                if (stats.pendingSyncItems > 0) ...[
                  GestureDetector(
                    onTap: () {},
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEEEEE),
                        borderRadius: BorderRadius.circular(12),
                        border:
                            Border.all(color: AppTheme.divider),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.sync_problem_outlined,
                              color: AppTheme.textMedium, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              '${stats.pendingSyncItems} record${stats.pendingSyncItems == 1 ? '' : 's'} pending synchronization',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.textDark,
                              ),
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded,
                              color: AppTheme.textMedium, size: 20),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Total farmers
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        AppTheme.primaryGreen,
                        AppTheme.midGreen
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Total Registered Farmers',
                            style: TextStyle(
                                color: Colors.white70, fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${stats.totalFarmers}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            user.ipc,
                            style: const TextStyle(
                                color: Colors.white60, fontSize: 11),
                          ),
                        ],
                      ),
                      const Spacer(),
                      const Icon(Icons.people_outline_rounded,
                          color: Colors.white30, size: 64),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Recent purchases
                SectionHeader(
                  title: 'Recent Purchases',
                  actionLabel: 'View all',
                  onAction: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const PurchasesScreen()),
                  ),
                ),
                const SizedBox(height: 10),
                if (recentPurchases.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: Theme.of(context).dividerColor),
                    ),
                    child: Center(
                      child: Text(
                        'No purchases recorded yet.',
                        style: TextStyle(
                            color: Theme.of(context).brightness ==
                                    Brightness.dark
                                ? Colors.white54
                                : AppTheme.textLight,
                            fontSize: 13),
                      ),
                    ),
                  )
                else
                  ...recentPurchases.map((p) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _PurchaseTile(purchase: p),
                      )),

                const SizedBox(height: 8),

                // Quick actions
                _SectionLabel(label: 'Quick Actions'),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _QuickAction(
                        icon: Icons.person_add_rounded,
                        label: 'Register\nFarmer',
                        color: AppTheme.textMedium,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) =>
                                  const FarmerRegistrationScreen()),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _QuickAction(
                        icon: Icons.add_shopping_cart_rounded,
                        label: 'Record\nPurchase',
                        color: AppTheme.textMedium,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) =>
                                  const CommodityPurchaseScreen()),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _QuickAction(
                        icon: Icons.person_search_rounded,
                        label: 'Search\nFarmer',
                        color: AppTheme.textMedium,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const FarmersScreen()),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _QuickAction(
                        icon: Icons.qr_code_scanner_rounded,
                        label: 'Trace\nBag',
                        color: AppTheme.textMedium,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) =>
                                  const TraceLookupScreen()),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Text(
      label,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.white : AppTheme.textDark,
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color iconColor;
  final Color bgColor;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.iconColor,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final valueColor = isDark ? Colors.white : AppTheme.textDark;
    final labelColor =
        isDark ? Colors.white70 : AppTheme.textMedium;
    final containerBg = isDark ? AppTheme.darkInput : bgColor;
    final activeIconColor =
        isDark ? AppTheme.accentGreen : iconColor;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: containerBg,
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, size: 18, color: activeIconColor),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: valueColor,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: labelColor,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}

class _PurchaseTile extends StatelessWidget {
  final CommodityPurchase purchase;
  const _PurchaseTile({required this.purchase});

  @override
  Widget build(BuildContext context) {
    final isSynced = purchase.syncStatus == SyncStatus.synced;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? Colors.white : AppTheme.textDark;
    final subColor = isDark ? Colors.white70 : AppTheme.textMedium;
    final iconBg =
        isDark ? AppTheme.darkInput : const Color(0xFFEEEEEE);
    final iconColor =
        isDark ? AppTheme.accentGreen : AppTheme.textMedium;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child:
                Icon(Icons.grain_rounded, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  purchase.farmerName,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                  ),
                ),
                Text(
                  '${purchase.commodityType}${purchase.variety.isNotEmpty ? ' • ${purchase.variety}' : ''} • ${purchase.quantityKg.toStringAsFixed(0)} kg',
                  style: TextStyle(fontSize: 11, color: subColor),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'MK ${_formatAmount(purchase.netPayment)}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                isSynced ? 'Synced' : 'Pending',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  color: isSynced
                      ? (isDark
                          ? AppTheme.accentGreen
                          : AppTheme.primaryGreen)
                      : AppTheme.accentAmber,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatAmount(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M';
    }
    return amount.toStringAsFixed(0);
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final actionIconColor = isDark ? AppTheme.accentGreen : color;
    final actionLabelColor =
        isDark ? Colors.white : AppTheme.textDark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: Theme.of(context).dividerColor, width: 0.8),
        ),
        child: Column(
          children: [
            SizedBox(
              height: 42,
              child: Center(
                child:
                    Icon(icon, color: actionIconColor, size: 28),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: actionLabelColor,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
