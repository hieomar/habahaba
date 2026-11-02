import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';
import 'package:gtms/features/farmers/presentation/farmer_profile_screen.dart';
import 'package:gtms/features/farmers/presentation/farmer_registration_screen.dart';

class FarmersScreen extends StatefulWidget {
  const FarmersScreen({super.key});

  @override
  State<FarmersScreen> createState() => _FarmersScreenState();
}

class _FarmersScreenState extends State<FarmersScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  List<Farmer> _filtered(List<Farmer> farmers) {
    if (_query.isEmpty) return farmers;
    final q = _query.toLowerCase();
    return farmers.where((f) {
      return f.fullName.toLowerCase().contains(q) ||
          f.farmerId.toLowerCase().contains(q) ||
          f.village.toLowerCase().contains(q) ||
          f.club.toLowerCase().contains(q);
    }).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final farmers = context.watch<GtmsController>().farmers;
    final filtered = _filtered(farmers);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryTextColor = isDark ? Colors.white : AppTheme.textDark;
    final secondaryTextColor = isDark ? Colors.white70 : AppTheme.textMedium;
    final subTextColor = isDark ? Colors.white54 : AppTheme.textLight;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Farmers'),
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
        heroTag: 'farmers_fab',
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const FarmerRegistrationScreen()),
          );
        },
        backgroundColor: AppTheme.primaryGreen,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add_rounded),
        label: const Text('Register Farmer',
            style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _query = v),
              style: TextStyle(color: primaryTextColor),
              decoration: InputDecoration(
                hintText: 'Search by name, ID, village, club…',
                prefixIcon: Icon(Icons.search_rounded,
                    size: 20, color: subTextColor),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear_rounded,
                            size: 18, color: subTextColor),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _query = '');
                        },
                      )
                    : null,
              ),
            ),
          ),

          // Results count
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text(
                  '${filtered.length} farmer${filtered.length != 1 ? 's' : ''}',
                  style: TextStyle(
                    fontSize: 12,
                    color: secondaryTextColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search_off_rounded,
                            size: 48, color: subTextColor),
                        const SizedBox(height: 12),
                        Text('No farmers found',
                            style: TextStyle(
                                color: secondaryTextColor, fontSize: 15)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding:
                        const EdgeInsets.fromLTRB(16, 0, 16, 100),
                    physics: const ClampingScrollPhysics(),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final farmer = filtered[i];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _FarmerCard(
                          farmer: farmer,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  FarmerProfileScreen(farmer: farmer),
                            ),
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

class _FarmerCard extends StatelessWidget {
  final Farmer farmer;
  final VoidCallback onTap;

  const _FarmerCard({required this.farmer, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardTitleColor = isDark ? Colors.white : AppTheme.textDark;
    final cardSubColor = isDark ? Colors.white70 : AppTheme.textLight;
    final avatarBg = isDark ? const Color(0xFF2C323B) : const Color(0xFFEEEEEE);
    final avatarTextColor = isDark ? Colors.white : AppTheme.textMedium;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Theme.of(context).dividerColor, width: 0.8),
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: avatarBg,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark ? AppTheme.darkDivider : AppTheme.divider,
                  width: 2,
                ),
              ),
              child: Center(
                child: Text(
                  '${farmer.firstName[0]}${farmer.lastName[0]}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: avatarTextColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          farmer.fullName,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: cardTitleColor,
                          ),
                        ),
                      ),
                      if (farmer.seedLoanBalance > 0)
                        Text(
                          'Loan: MK${_fmt(farmer.seedLoanBalance)}',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: isDark ? const Color(0xFFFFB74D) : AppTheme.accentOrange,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined,
                          size: 12, color: cardSubColor),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          '${farmer.village}, ${farmer.district}',
                          style: TextStyle(
                              fontSize: 11, color: cardSubColor),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded,
                color: cardSubColor, size: 20),
          ],
        ),
      ),
    );
  }

  String _fmt(double v) => v.toStringAsFixed(0);
}
