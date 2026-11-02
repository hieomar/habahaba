import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/state/gtms_controller.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final DateTime time;
  final IconData icon;
  final Color iconBgColor;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.iconBgColor,
    this.isRead = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      title: 'Commodity Prices Updated',
      message: 'New buying prices for Soybean (MK 850/kg) and Groundnuts (MK 1200/kg) are now active.',
      time: DateTime.now().subtract(const Duration(minutes: 15)),
      icon: Icons.trending_up_rounded,
      iconBgColor: AppTheme.primaryGreen.withValues(alpha: 0.1),
    ),
    NotificationItem(
      id: '2',
      title: 'Pending Records Alert',
      message: 'You have 3 purchase records pending synchronization. Connect to internet to sync.',
      time: DateTime.now().subtract(const Duration(hours: 2)),
      icon: Icons.sync_problem_rounded,
      iconBgColor: AppTheme.accentOrange.withValues(alpha: 0.1),
    ),
    NotificationItem(
      id: '3',
      title: 'Farmer Loan Outstanding',
      message: 'Mercy Tembo has an outstanding seed loan of MK 5,500.00 that will be recovered.',
      time: DateTime.now().subtract(const Duration(days: 1)),
      icon: Icons.warning_amber_rounded,
      iconBgColor: AppTheme.errorRed.withValues(alpha: 0.1),
    ),
    NotificationItem(
      id: '4',
      title: 'Sync Successful',
      message: '5 registered farmers synced successfully with the central NASFAM database.',
      time: DateTime.now().subtract(const Duration(days: 2)),
      icon: Icons.cloud_done_rounded,
      iconBgColor: Colors.blue.withValues(alpha: 0.1),
      isRead: true,
    ),
  ];

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
  }

  void _clearAll() {
    setState(() {
      _notifications.clear();
    });
  }

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else {
      return '${diff.inDays}d ago';
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryTextColor = isDark ? Colors.white : AppTheme.textDark;
    final secondaryTextColor = isDark ? Colors.white70 : AppTheme.textMedium;
    final iconBg = isDark ? AppTheme.darkInput : const Color(0xFFEEEEEE);
    final iconColor = isDark ? AppTheme.accentGreen : AppTheme.textMedium;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Notifications'),
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
          if (_notifications.isNotEmpty) ...[
            TextButton(
              onPressed: _markAllAsRead,
              style: TextButton.styleFrom(foregroundColor: Colors.white),
              child: const Text('Mark read'),
            ),
            IconButton(
              icon: const Icon(Icons.delete_sweep_rounded),
              tooltip: 'Clear All',
              onPressed: _clearAll,
            ),
          ],
        ],
      ),
      body: _notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: iconBg,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.notifications_none_rounded,
                      size: 36,
                      color: iconColor,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'All Caught Up!',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: primaryTextColor,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'No new notifications at this time.',
                    style: TextStyle(
                      fontSize: 13,
                      color: secondaryTextColor,
                    ),
                  ),
                ],
              ),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (unreadCount > 0)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                    child: Text(
                      'YOU HAVE $unreadCount UNREAD NOTIFICATION${unreadCount != 1 ? 'S' : ''}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: isDark ? AppTheme.accentGreen : AppTheme.textMedium,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: _notifications.length,
                    separatorBuilder: (_, __) => Divider(height: 1, color: Theme.of(context).dividerColor),
                    itemBuilder: (context, index) {
                      final item = _notifications[index];
                      return Container(
                        color: item.isRead ? Colors.transparent : Theme.of(context).cardColor,
                        child: ListTile(
                          onTap: () {
                            setState(() {
                              item.isRead = true;
                            });
                          },
                          leading: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: iconBg,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              item.icon,
                              size: 20,
                              color: iconColor,
                            ),
                          ),
                          title: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  item.title,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: item.isRead
                                        ? FontWeight.w600
                                        : FontWeight.w800,
                                    color: primaryTextColor,
                                  ),
                                ),
                              ),
                              Text(
                                _formatTime(item.time),
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isDark ? Colors.white54 : AppTheme.textLight,
                                ),
                              ),
                            ],
                          ),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Text(
                              item.message,
                              style: TextStyle(
                                fontSize: 11,
                                height: 1.35,
                                color: secondaryTextColor,
                              ),
                            ),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
