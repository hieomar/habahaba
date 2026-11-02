import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/core/constants/app_constants.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<GtmsController>().currentUser!;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Profile'),
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
      body: ListView(
        padding: const EdgeInsets.all(16),
        physics: const ClampingScrollPhysics(),
        children: [
          // Profile card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primaryGreen, AppTheme.midGreen],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.4),
                        width: 2),
                  ),
                  child: Center(
                    child: Text(
                      user.name.split(' ').map((n) => n[0]).take(2).join(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.name,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800)),
                      const SizedBox(height: 2),
                      Text(user.role.label,
                          style: const TextStyle(
                              color: Colors.white70, fontSize: 12)),
                      Text(user.ipc,
                          style: const TextStyle(
                              color: Colors.white60, fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Account info
          _SettingsSection(
            title: 'Account',
            items: [
              _SettingsTile(
                icon: Icons.badge_outlined,
                label: 'User ID',
                value: user.id,
              ),
              _SettingsTile(
                icon: Icons.email_outlined,
                label: 'Email',
                value: user.email,
              ),
              _SettingsTile(
                icon: Icons.business_outlined,
                label: 'IPC',
                value: user.ipc,
              ),
              _SettingsTile(
                icon: Icons.verified_user_outlined,
                label: 'Role',
                value: user.role.label,
              ),
            ],
          ),

          const SizedBox(height: 14),

          _SettingsSection(
            title: 'App Settings',
            items: [
              _SettingsTile(
                icon: Icons.language_outlined,
                label: 'Language',
                value: 'English',
                trailing: Icons.chevron_right_rounded,
                onTap: () {},
              ),
              _SettingsTile(
                icon: Icons.lock_reset_outlined,
                label: 'Change Password',
                trailing: Icons.chevron_right_rounded,
                onTap: () {},
              ),
              _SettingsTile(
                icon: Icons.notifications_outlined,
                label: 'Notifications',
                trailing: Icons.chevron_right_rounded,
                onTap: () {},
              ),
            ],
          ),

          const SizedBox(height: 14),

          _SettingsSection(
            title: 'System',
            items: [
              _SettingsTile(
                icon: Icons.info_outline_rounded,
                label: 'App Version',
                value: AppConstants.versionLabel,
              ),
              _SettingsTile(
                icon: Icons.policy_outlined,
                label: 'Privacy Policy',
                trailing: Icons.chevron_right_rounded,
                onTap: () {},
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Sign out
          OutlinedButton.icon(
            onPressed: () => context.read<GtmsController>().logout(),
            icon: const Icon(Icons.logout_rounded,
                size: 18, color: AppTheme.errorRed),
            label: const Text('Sign Out',
                style: TextStyle(color: AppTheme.errorRed)),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 52),
              side: const BorderSide(color: AppTheme.errorRed),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),

          const SizedBox(height: 12),

          Center(
            child: Column(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Theme.of(context).dividerColor, width: 0.8),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.asset(
                      'assets/images/logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${AppConstants.appName}\n${AppConstants.organization} — Malawi',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    color: Theme.of(context).brightness == Brightness.dark ? Colors.white54 : AppTheme.textLight,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> items;

  const _SettingsSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final headerColor = isDark ? AppTheme.accentGreen : AppTheme.textLight;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: Text(
              title.toUpperCase(),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: headerColor,
                letterSpacing: 0.8,
              ),
            ),
          ),
          Divider(height: 1, color: Theme.of(context).dividerColor),
          ...items,
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? value;
  final IconData? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.label,
    this.value,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor = isDark ? AppTheme.accentGreen : AppTheme.textMedium;
    final labelColor = isDark ? Colors.white : AppTheme.textDark;
    final valueColor = isDark ? Colors.white70 : AppTheme.textMedium;
    final trailingColor = isDark ? Colors.white54 : AppTheme.textLight;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 20, color: iconColor),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label,
                  style: TextStyle(
                      fontSize: 14, color: labelColor)),
            ),
            if (value != null)
              Text(value!,
                  style: TextStyle(
                      fontSize: 13, color: valueColor)),
            if (trailing != null)
              Icon(trailing, size: 18, color: trailingColor),
          ],
        ),
      ),
    );
  }
}
