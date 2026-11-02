import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';
import 'package:gtms/features/farmers/presentation/farm_registration_screen.dart';
import 'package:gtms/features/purchases/presentation/commodity_purchase_screen.dart';

class FarmerProfileScreen extends StatefulWidget {
  final Farmer farmer;
  const FarmerProfileScreen({super.key, required this.farmer});

  @override
  State<FarmerProfileScreen> createState() =>
      _FarmerProfileScreenState();
}

class _FarmerProfileScreenState extends State<FarmerProfileScreen> {
  List<Farm> _farms = [];
  bool _farmsLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFarms();
  }

  Future<void> _loadFarms() async {
    final farms = await context
        .read<GtmsController>()
        .farmsForFarmer(widget.farmer.id);
    if (!mounted) return;
    setState(() {
      _farms = farms;
      _farmsLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final purchases = context
        .watch<GtmsController>()
        .purchases
        .where((p) => p.farmerId == widget.farmer.farmerId)
        .toList();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryTextColor =
        isDark ? Colors.white : AppTheme.textDark;
    final secondaryTextColor =
        isDark ? Colors.white70 : AppTheme.textMedium;
    final subTextColor = isDark ? Colors.white54 : AppTheme.textLight;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        physics: const ClampingScrollPhysics(),
        slivers: [
          // Header
          SliverAppBar(
            pinned: true,
            expandedHeight: 180,
            backgroundColor: AppTheme.primaryGreen,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: AppTheme.primaryGreen,
                padding:
                    const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: Colors.white.withValues(alpha: 0.5),
                                width: 2),
                          ),
                          child: Center(
                            child: Text(
                              '${widget.farmer.firstName[0]}${widget.farmer.lastName[0]}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.farmer.fullName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.white
                                      .withValues(alpha: 0.2),
                                  borderRadius:
                                      BorderRadius.circular(6),
                                ),
                                child: Text(
                                  widget.farmer.farmerId,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            title: Text(widget.farmer.fullName,
                style: const TextStyle(fontSize: 16)),
            actions: [
              IconButton(
                tooltip: context.watch<GtmsController>().isDarkMode
                    ? 'Switch to Light Mode'
                    : 'Switch to Dark Mode',
                icon: Icon(
                  context.watch<GtmsController>().isDarkMode
                      ? Icons.light_mode_rounded
                      : Icons.dark_mode_outlined,
                  color: Colors.white,
                ),
                onPressed: () =>
                    context.read<GtmsController>().toggleTheme(),
              ),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Seed loan alert
                if (widget.farmer.seedLoanBalance > 0) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF2B251D)
                          : const Color(0xFFEEEEEE),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: isDark
                              ? AppTheme.accentOrange
                                  .withValues(alpha: 0.5)
                              : AppTheme.divider),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline_rounded,
                            color: isDark
                                ? const Color(0xFFFFB74D)
                                : AppTheme.textMedium,
                            size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Outstanding Seed Loan',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                  color: primaryTextColor,
                                ),
                              ),
                              Text(
                                'MK ${widget.farmer.seedLoanBalance.toStringAsFixed(2)} — will be recovered on next purchase',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: secondaryTextColor),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                ],

                // Personal details
                _InfoSection(title: 'Personal Details', children: [
                  _InfoRow(
                      label: 'Full Name',
                      value: widget.farmer.fullName),
                  _InfoRow(
                      label: 'Phone',
                      value: widget.farmer.phone),
                  _InfoRow(
                      label: 'Village',
                      value: widget.farmer.village),
                  _InfoRow(
                      label: 'District',
                      value: widget.farmer.district),
                  _InfoRow(
                      label: 'Registered',
                      value: _formatDate(widget.farmer.registeredAt)),
                ]),

                const SizedBox(height: 14),

                _InfoSection(
                    title: 'Club & Association',
                    children: [
                      _InfoRow(
                          label: 'Club',
                          value: widget.farmer.club),
                      _InfoRow(
                          label: 'Association',
                          value: widget.farmer.association),
                    ]),

                const SizedBox(height: 14),

                _InfoSection(title: 'Crops Grown', children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: widget.farmer.crops
                          .map((c) => Chip(
                                label: Text(c),
                                backgroundColor: isDark
                                    ? AppTheme.darkInput
                                    : AppTheme.lightGreen,
                                labelStyle: TextStyle(
                                  color: isDark
                                      ? Colors.white
                                      : AppTheme.primaryGreen,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                                padding: EdgeInsets.zero,
                                materialTapTargetSize:
                                    MaterialTapTargetSize.shrinkWrap,
                              ))
                          .toList(),
                    ),
                  ),
                ]),

                const SizedBox(height: 14),

                if (widget.farmer.latitude != null) ...[
                  _InfoSection(title: 'GPS Location', children: [
                    _InfoRow(
                        label: 'Latitude',
                        value: widget.farmer.latitude!
                            .toStringAsFixed(4)),
                    _InfoRow(
                        label: 'Longitude',
                        value: widget.farmer.longitude!
                            .toStringAsFixed(4)),
                  ]),
                  const SizedBox(height: 14),
                ],

                // Farms section
                Row(
                  mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Registered Farms',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: primaryTextColor,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppTheme.darkInput
                                : AppTheme.lightGreen,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            _farmsLoading ? '…' : '${_farms.length}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? AppTheme.accentGreen
                                  : AppTheme.primaryGreen,
                            ),
                          ),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      onPressed: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => FarmRegistrationScreen(
                                farmer: widget.farmer),
                          ),
                        );
                        _loadFarms();
                      },
                      icon: const Icon(Icons.add_rounded, size: 16),
                      label: const Text('Add Farm',
                          style: TextStyle(fontSize: 13)),
                      style: TextButton.styleFrom(
                        foregroundColor: isDark
                            ? AppTheme.accentGreen
                            : AppTheme.primaryGreen,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize:
                            MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (_farmsLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (_farms.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text('No farms registered yet.',
                          style: TextStyle(
                              color: subTextColor, fontSize: 13)),
                    ),
                  )
                else
                  ..._farms.map(
                    (farm) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _FarmTile(farm: farm),
                    ),
                  ),

                const SizedBox(height: 24),

                // Purchase history
                Row(
                  children: [
                    Text(
                      'Purchase History',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: primaryTextColor,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppTheme.darkInput
                            : AppTheme.lightGreen,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${purchases.length}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? AppTheme.accentGreen
                              : AppTheme.primaryGreen,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (purchases.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text('No purchases recorded yet.',
                          style: TextStyle(color: subTextColor)),
                    ),
                  )
                else
                  ...purchases.map((p) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _PurchaseHistoryTile(purchase: p),
                      )),

                const SizedBox(height: 20),

                // Record purchase button — pre-selects this farmer.
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CommodityPurchaseScreen(
                          preselectedFarmer: widget.farmer,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(
                      Icons.add_shopping_cart_rounded,
                      size: 18),
                  label: const Text('Record New Purchase'),
                ),
                const SizedBox(height: 24),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime d) =>
      '${d.day} ${_months[d.month - 1]} ${d.year}';

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
}

// ─── Farm tile ────────────────────────────────────────────────────────────────

class _FarmTile extends StatelessWidget {
  final Farm farm;
  const _FarmTile({required this.farm});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? Colors.white : AppTheme.textDark;
    final subColor = isDark ? Colors.white70 : AppTheme.textMedium;
    final iconColor =
        isDark ? AppTheme.accentGreen : AppTheme.textMedium;
    final iconBg =
        isDark ? AppTheme.darkInput : const Color(0xFFEEEEEE);

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
                Icon(Icons.grass_rounded, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(farm.farmName,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: titleColor)),
                Text(
                  [
                    if (farm.primaryCrop != null) farm.primaryCrop!,
                    if (farm.acreage != null)
                      '${farm.acreage!.toStringAsFixed(1)} ha',
                    farm.location,
                  ].join(' • '),
                  style: TextStyle(fontSize: 11, color: subColor),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Text(
            farm.syncStatus == SyncStatus.synced ? 'Synced' : 'Pending',
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: farm.syncStatus == SyncStatus.synced
                  ? (isDark
                      ? AppTheme.accentGreen
                      : AppTheme.primaryGreen)
                  : AppTheme.accentAmber,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Shared info widgets ──────────────────────────────────────────────────────

class _InfoSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _InfoSection(
      {required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final headerColor =
        isDark ? AppTheme.accentGreen : AppTheme.textLight;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
            color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: headerColor,
                letterSpacing: 0.5,
              ),
            ),
          ),
          Divider(height: 1, color: Theme.of(context).dividerColor),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor =
        isDark ? Colors.white70 : AppTheme.textMedium;
    final valueColor = isDark ? Colors.white : AppTheme.textDark;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(label,
                style:
                    TextStyle(fontSize: 12, color: labelColor)),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: valueColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PurchaseHistoryTile extends StatelessWidget {
  final CommodityPurchase purchase;
  const _PurchaseHistoryTile({required this.purchase});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dateColor = isDark ? Colors.white54 : AppTheme.textLight;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                purchase.receiptNumber,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isDark
                      ? AppTheme.accentGreen
                      : AppTheme.primaryGreen,
                  fontFamily: 'monospace',
                ),
              ),
              const Spacer(),
              Text(
                _formatDate(purchase.purchasedAt),
                style: TextStyle(fontSize: 11, color: dateColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _PurchaseStat(
                  label: 'Commodity',
                  value: purchase.variety.isNotEmpty
                      ? '${purchase.commodityType} (${purchase.variety})'
                      : purchase.commodityType),
              const SizedBox(width: 16),
              _PurchaseStat(
                  label: 'Quantity',
                  value:
                      '${purchase.quantityKg.toStringAsFixed(0)} kg'),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              _PurchaseStat(
                  label: 'Total',
                  value: 'MK ${_fmt(purchase.totalAmount)}'),
              const SizedBox(width: 16),
              if (purchase.loanRecovered > 0) ...[
                _PurchaseStat(
                    label: 'Loan Recovered',
                    value: 'MK ${_fmt(purchase.loanRecovered)}'),
                const SizedBox(width: 16),
              ],
              _PurchaseStat(
                  label: 'Net Payment',
                  value: 'MK ${_fmt(purchase.netPayment)}'),
            ],
          ),
        ],
      ),
    );
  }

  String _fmt(double v) => v.toStringAsFixed(0);

  String _formatDate(DateTime d) =>
      '${d.day} ${_months[d.month - 1]} ${d.year}';

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
}

class _PurchaseStat extends StatelessWidget {
  final String label;
  final String value;
  const _PurchaseStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor = isDark ? Colors.white54 : AppTheme.textLight;
    final valueColor = isDark ? Colors.white : AppTheme.textDark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(fontSize: 10, color: labelColor)),
        Text(value,
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: valueColor)),
      ],
    );
  }
}
