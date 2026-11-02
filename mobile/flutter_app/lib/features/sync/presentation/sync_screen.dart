import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/core/utils/formatters.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';

class SyncScreen extends StatefulWidget {
  const SyncScreen({super.key});

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  List<SyncEvent> _history = [];
  bool _historyLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final events =
        await context.read<GtmsController>().getSyncHistory();
    if (!mounted) return;
    setState(() {
      _history = events;
      _historyLoading = false;
    });
  }

  Future<void> _sync(BuildContext context) async {
    final controller = context.read<GtmsController>();
    final ok = await controller.syncAll();
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok
              ? 'All records synced successfully'
              : (controller.errorMessage ?? 'Sync failed'),
        ),
        backgroundColor: ok ? AppTheme.primaryGreen : AppTheme.errorRed,
      ),
    );
    if (ok) _loadHistory();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GtmsController>();
    final stats = controller.stats;
    final pendingCount = controller.pendingSyncCount;
    final pendingFarmers = controller.pendingFarmers;
    final pendingPurchases = controller.pendingPurchases;
    final isSyncing = controller.isBusy;
    final lastSync = controller.lastSyncTime;
    final lastSyncText =
        lastSync == null ? 'Never' : Formatters.dateTime(lastSync);

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryTextColor =
        isDark ? Colors.white : AppTheme.textDark;
    final secondaryTextColor =
        isDark ? Colors.white70 : AppTheme.textMedium;
    final cardBg = Theme.of(context).cardColor;
    final statusBoxBg =
        isDark ? AppTheme.darkInput : const Color(0xFFEEEEEE);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Data Synchronization'),
        actions: [
          IconButton(
            tooltip: controller.isDarkMode
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode',
            icon: Icon(
              controller.isDarkMode
                  ? Icons.light_mode_rounded
                  : Icons.dark_mode_outlined,
            ),
            onPressed: () =>
                context.read<GtmsController>().toggleTheme(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        physics: const ClampingScrollPhysics(),
        children: [
          // Status card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: statusBoxBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                  color: Theme.of(context).dividerColor, width: 0.8),
            ),
            child: Column(
              children: [
                Icon(
                  pendingCount == 0
                      ? Icons.cloud_done_rounded
                      : Icons.cloud_upload_rounded,
                  color: isDark
                      ? AppTheme.accentGreen
                      : AppTheme.textMedium,
                  size: 48,
                ),
                const SizedBox(height: 12),
                Text(
                  pendingCount == 0
                      ? 'All data is synced'
                      : '$pendingCount record${pendingCount == 1 ? '' : 's'} pending sync',
                  style: TextStyle(
                    color: primaryTextColor,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Last synced: $lastSyncText',
                  style: TextStyle(
                    color: secondaryTextColor,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: stats.isOnline
                            ? (isDark
                                ? AppTheme.accentGreen
                                : AppTheme.successGreen)
                            : AppTheme.errorRed,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      stats.isOnline
                          ? 'Connected to internet'
                          : 'No internet connection',
                      style: TextStyle(
                          color: secondaryTextColor, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Sync button
          ElevatedButton.icon(
            onPressed: (isSyncing || !stats.isOnline)
                ? null
                : () => _sync(context),
            icon: isSyncing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : const Icon(Icons.sync_rounded, size: 18),
            label: Text(isSyncing
                ? 'Syncing…'
                : !stats.isOnline
                    ? 'Offline — sync unavailable'
                    : 'Sync Now'),
          ),

          const SizedBox(height: 20),

          // Pending records
          Text(
            'Pending Records',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: primaryTextColor,
            ),
          ),
          const SizedBox(height: 10),
          if (pendingCount == 0)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: Column(
                children: [
                  Icon(Icons.check_circle_outline_rounded,
                      color: secondaryTextColor, size: 40),
                  const SizedBox(height: 10),
                  Text('No pending records',
                      style: TextStyle(
                          color: secondaryTextColor, fontSize: 14)),
                ],
              ),
            )
          else ...[
            ...pendingFarmers.map(
              (f) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _PendingTile(
                  icon: Icons.person_add_outlined,
                  title: f.fullName,
                  subtitle: f.farmerId,
                  type: 'Farmer Registration',
                ),
              ),
            ),
            ...pendingPurchases.map(
              (p) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _PendingTile(
                  icon: Icons.receipt_long_outlined,
                  title: p.farmerName,
                  subtitle:
                      '${p.commodityType} — ${p.quantityKg.toStringAsFixed(0)} kg',
                  type: 'Purchase Record',
                ),
              ),
            ),
          ],

          const SizedBox(height: 20),

          // Real sync history
          Text(
            'Sync History',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: primaryTextColor,
            ),
          ),
          const SizedBox(height: 10),
          if (_historyLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_history.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: Text(
                'No sync history yet.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: secondaryTextColor, fontSize: 13),
              ),
            )
          else
            ...(_history.take(20).map(
                  (e) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _HistoryTile(event: e),
                  ),
                )),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _PendingTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String type;

  const _PendingTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.type,
  });

  @override
  Widget build(BuildContext context) {
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
        border:
            Border.all(color: Theme.of(context).dividerColor, width: 0.8),
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
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: titleColor)),
                Text(subtitle,
                    style:
                        TextStyle(fontSize: 11, color: subColor)),
              ],
            ),
          ),
          Text(type,
              style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.accentAmber)),
        ],
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  final SyncEvent event;

  const _HistoryTile({required this.event});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final timeColor = isDark ? Colors.white : AppTheme.textDark;
    final detailColor =
        isDark ? Colors.white70 : AppTheme.textMedium;
    final iconColor = isDark ? Colors.white70 : AppTheme.textMedium;

    final timeStr = Formatters.dateTime(event.occurredAt);
    final detail = event.success
        ? '${event.recordsSynced} record${event.recordsSynced == 1 ? '' : 's'} synced'
        : (event.errorMessage ?? 'Sync failed');

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Row(
        children: [
          Icon(
            event.success
                ? Icons.check_circle_rounded
                : Icons.error_outline_rounded,
            color: iconColor,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(timeStr,
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: timeColor)),
                Text(detail,
                    style:
                        TextStyle(fontSize: 11, color: detailColor)),
              ],
            ),
          ),
          Text(
            event.success ? 'Success' : 'Failed',
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: event.success
                    ? (isDark
                        ? AppTheme.accentGreen
                        : AppTheme.successGreen)
                    : AppTheme.errorRed),
          ),
        ],
      ),
    );
  }
}
