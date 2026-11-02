import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';

class CommodityPurchaseScreen extends StatefulWidget {
  /// Pre-select a farmer when launched from a farmer's profile.
  final Farmer? preselectedFarmer;

  const CommodityPurchaseScreen({super.key, this.preselectedFarmer});

  @override
  State<CommodityPurchaseScreen> createState() =>
      _CommodityPurchaseScreenState();
}

class _CommodityPurchaseScreenState
    extends State<CommodityPurchaseScreen> {
  final _formKey = GlobalKey<FormState>();
  Farmer? _selectedFarmer;
  String? _selectedCommodity;
  String? _selectedVariety;
  final _quantityCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _centerCtrl =
      TextEditingController(text: 'Lilongwe Buying Centre');
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.preselectedFarmer != null) {
      _selectedFarmer = widget.preselectedFarmer;
    }
  }

  double get _totalAmount {
    final qty = double.tryParse(_quantityCtrl.text) ?? 0;
    final price = double.tryParse(_priceCtrl.text) ?? 0;
    return qty * price;
  }

  double get _loanToRecover => _selectedFarmer?.seedLoanBalance ?? 0;

  double get _netPayment =>
      (_totalAmount - _loanToRecover).clamp(0, double.infinity);

  int get _calculatedBags {
    final qty = double.tryParse(_quantityCtrl.text) ?? 0;
    if (qty <= 0) return 0;
    return (qty / 50).ceil();
  }

  String _buildBagTagRange(int numBags, String receiptNo) {
    if (numBags <= 0) return 'BAG-2026-00000';
    final prefix = receiptNo.replaceAll('RCP', 'BAG');
    if (numBags == 1) return '$prefix-001';
    final endPad = numBags.toString().padLeft(3, '0');
    return '$prefix-001 to $prefix-$endPad';
  }

  List<String> _varietiesFor(Map<String, List<String>> varieties) =>
      _selectedCommodity != null
          ? (varieties[_selectedCommodity] ?? [])
          : [];

  @override
  void dispose() {
    _quantityCtrl.dispose();
    _priceCtrl.dispose();
    _centerCtrl.dispose();
    super.dispose();
  }

  void _recalc() => setState(() {});

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedFarmer == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a farmer')),
      );
      return;
    }

    setState(() => _isSaving = true);
    final controller = context.read<GtmsController>();
    final qty = double.parse(_quantityCtrl.text);
    final price = double.parse(_priceCtrl.text);
    final total = qty * price;
    final loan = _selectedFarmer!.seedLoanBalance;
    final net = (total - loan).clamp(0, double.infinity).toDouble();

    // Collision-free receipt number from DB sequence.
    final receiptNo = await controller.nextReceiptNumber();

    final bagsCount = (qty / 50).ceil();
    final bagTags = _buildBagTagRange(bagsCount, receiptNo);

    await controller.recordPurchase(
      CommodityPurchase(
        id: 'p_${DateTime.now().millisecondsSinceEpoch}',
        farmerId: _selectedFarmer!.farmerId,
        farmerName: _selectedFarmer!.fullName,
        commodityType: _selectedCommodity!,
        variety: _selectedVariety ?? '',
        quantityKg: qty,
        pricePerKg: price,
        totalAmount: total,
        loanRecovered: loan > 0 ? loan : 0,
        netPayment: net,
        receiptNumber: receiptNo,
        numberOfBags: bagsCount,
        bagTagRange: bagTags,
        purchasedAt: DateTime.now(),
        buyingCenter: _centerCtrl.text.trim(),
        syncStatus: SyncStatus.pending,
      ),
    );

    if (!mounted) return;
    setState(() => _isSaving = false);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: const BoxDecoration(
                  color: Color(0xFFEEEEEE), shape: BoxShape.circle),
              child: const Icon(Icons.receipt_long_rounded,
                  color: AppTheme.textMedium, size: 30),
            ),
            const SizedBox(height: 14),
            const Text('Purchase Recorded',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textDark)),
            const SizedBox(height: 10),
            _ReceiptRow(
                label: 'Farmer',
                value: _selectedFarmer!.fullName),
            _ReceiptRow(
                label: 'Commodity',
                value: _selectedVariety != null && _selectedVariety!.isNotEmpty
                    ? '$_selectedCommodity ($_selectedVariety)'
                    : _selectedCommodity!),
            _ReceiptRow(
                label: 'Quantity',
                value: '${_quantityCtrl.text} kg ($bagsCount bags)'),
            _ReceiptRow(
                label: 'Bag Tag Range',
                value: bagTags),
            _ReceiptRow(
                label: 'Total Amount',
                value:
                    'MK ${_totalAmount.toStringAsFixed(2)}'),
            if (_loanToRecover > 0)
              _ReceiptRow(
                  label: 'Loan Recovered',
                  value:
                      'MK ${_loanToRecover.toStringAsFixed(2)}'),
            const Divider(),
            _ReceiptRow(
                label: 'Net Payment',
                value: 'MK ${_netPayment.toStringAsFixed(2)}',
                highlight: true),
            const SizedBox(height: 8),
            Text(receiptNo,
                style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textLight,
                    fontFamily: 'monospace')),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF8E1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('⏳ Pending synchronization',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.accentAmber)),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<GtmsController>();
    final farmers = controller.farmers;
    final commodityTypes = controller.commodityTypes;
    final varieties = _varietiesFor(controller.varieties);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Record Purchase'),
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
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          physics: const ClampingScrollPhysics(),
          children: [
            // Farmer selection
            _SectionCard(
              title: 'Farmer Identification',
              icon: Icons.person_search_rounded,
              child: Column(
                children: [
                  DropdownButtonFormField<Farmer>(
                    value: _selectedFarmer,
                    decoration: const InputDecoration(
                        labelText: 'Select Farmer'),
                    hint: const Text('Search and select farmer'),
                    items: farmers.map((f) {
                      return DropdownMenuItem(
                        value: f,
                        child: Text(
                          '${f.fullName} — ${f.farmerId}',
                          style: const TextStyle(fontSize: 13),
                        ),
                      );
                    }).toList(),
                    onChanged: (f) =>
                        setState(() => _selectedFarmer = f),
                    validator: (v) =>
                        v == null ? 'Please select a farmer' : null,
                  ),
                  if (_selectedFarmer != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _selectedFarmer!.seedLoanBalance > 0
                            ? const Color(0xFFFFF3E0)
                            : AppTheme.lightGreen,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _selectedFarmer!.seedLoanBalance > 0
                                ? Icons.warning_amber_rounded
                                : Icons.check_circle_rounded,
                            size: 18,
                            color: AppTheme.textMedium,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _selectedFarmer!.seedLoanBalance > 0
                                  ? 'Outstanding seed loan: MK ${_selectedFarmer!.seedLoanBalance.toStringAsFixed(2)} — will be recovered'
                                  : 'No outstanding seed loan',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color:
                                    _selectedFarmer!.seedLoanBalance > 0
                                        ? const Color(0xFF5D4037)
                                        : AppTheme.primaryGreen,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Commodity details
            _SectionCard(
              title: 'Commodity Details',
              icon: Icons.grain_rounded,
              child: Column(
                children: [
                  DropdownButtonFormField<String>(
                    value: _selectedCommodity,
                    decoration: const InputDecoration(
                        labelText: 'Commodity Type'),
                    items: commodityTypes.map((c) {
                      return DropdownMenuItem(
                          value: c, child: Text(c));
                    }).toList(),
                    onChanged: (v) => setState(() {
                      _selectedCommodity = v;
                      _selectedVariety = null;
                    }),
                    validator: (v) =>
                        v == null ? 'Please select a commodity' : null,
                  ),
                  if (varieties.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _selectedVariety,
                      decoration:
                          const InputDecoration(labelText: 'Variety'),
                      items: varieties.map((v) {
                        return DropdownMenuItem(
                            value: v, child: Text(v));
                      }).toList(),
                      onChanged: (v) =>
                          setState(() => _selectedVariety = v),
                      // Optional — not all commodities have varieties.
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Quantity and price
            _SectionCard(
              title: 'Quantity & Pricing',
              icon: Icons.scale_outlined,
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _quantityCtrl,
                          keyboardType:
                              const TextInputType.numberWithOptions(
                                  decimal: true),
                          decoration: const InputDecoration(
                              labelText: 'Quantity (kg)',
                              suffixText: 'kg'),
                          onChanged: (_) => _recalc(),
                          validator: (v) {
                            if (v == null || v.isEmpty) {
                              return 'Required';
                            }
                            if (double.tryParse(v) == null) {
                              return 'Invalid number';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _priceCtrl,
                          keyboardType:
                              const TextInputType.numberWithOptions(
                                  decimal: true),
                          decoration: const InputDecoration(
                              labelText: 'Price per kg (MK)',
                              prefixText: 'MK '),
                          onChanged: (_) => _recalc(),
                          validator: (v) {
                            if (v == null || v.isEmpty) {
                              return 'Required';
                            }
                            if (double.tryParse(v) == null) {
                              return 'Invalid';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  // Payment summary
                  if (_totalAmount > 0)
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppTheme.darkInput
                            : AppTheme.backgroundGrey,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        children: [
                          _CalcRow(
                              label: 'Total Amount',
                              value:
                                  'MK ${_totalAmount.toStringAsFixed(2)}'),
                          _CalcRow(
                              label: 'Est. 50kg Bags',
                              value: '$_calculatedBags bag${_calculatedBags == 1 ? "" : "s"}'),
                          if (_calculatedBags > 0)
                            _CalcRow(
                                label: 'Bag Barcode Range',
                                value: _buildBagTagRange(_calculatedBags, 'RCP-2026-TEMP')),
                          if (_loanToRecover > 0) ...[
                            _CalcRow(
                                label: 'Seed Loan Recovery',
                                value:
                                    '- MK ${_loanToRecover.toStringAsFixed(2)}',
                                color: isDark
                                    ? const Color(0xFFFFB74D)
                                    : AppTheme.accentOrange),
                          ],
                          Divider(
                              height: 16,
                              color: Theme.of(context).dividerColor),
                          _CalcRow(
                            label: 'Net Payment',
                            value:
                                'MK ${_netPayment.toStringAsFixed(2)}',
                            bold: true,
                            color: isDark
                                ? AppTheme.accentGreen
                                : AppTheme.primaryGreen,
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            _SectionCard(
              title: 'Buying Centre',
              icon: Icons.storefront_outlined,
              child: TextFormField(
                controller: _centerCtrl,
                decoration: const InputDecoration(
                    labelText: 'Buying Centre / Collection Point'),
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'Required' : null,
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: _isSaving ? null : _submit,
              icon: _isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.check_rounded, size: 18),
              label: const Text('Confirm Purchase'),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;

  const _SectionCard(
      {required this.title, required this.icon, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? Colors.white : AppTheme.textDark;
    final iconColor =
        isDark ? AppTheme.accentGreen : AppTheme.textMedium;

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
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                Icon(icon, size: 16, color: iconColor),
                const SizedBox(width: 8),
                Text(title,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: titleColor)),
              ],
            ),
          ),
          Divider(height: 1, color: Theme.of(context).dividerColor),
          Padding(
              padding: const EdgeInsets.all(16), child: child),
        ],
      ),
    );
  }
}

class _CalcRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color? color;

  const _CalcRow(
      {required this.label,
      required this.value,
      this.bold = false,
      this.color});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final defaultLabelColor = bold
        ? (isDark ? Colors.white : AppTheme.textDark)
        : (isDark ? Colors.white70 : AppTheme.textMedium);
    final defaultValueColor =
        color ?? (isDark ? Colors.white : AppTheme.textDark);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Expanded(
            child: Text(label,
                style: TextStyle(
                    fontSize: 12,
                    color: defaultLabelColor,
                    fontWeight: bold
                        ? FontWeight.w700
                        : FontWeight.w500)),
          ),
          Text(value,
              style: TextStyle(
                  fontSize: bold ? 15 : 13,
                  fontWeight:
                      bold ? FontWeight.w800 : FontWeight.w600,
                  color: defaultValueColor)),
        ],
      ),
    );
  }
}

class _ReceiptRow extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;

  const _ReceiptRow(
      {required this.label,
      required this.value,
      this.highlight = false});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor =
        isDark ? Colors.white70 : AppTheme.textMedium;
    final valueColor = highlight
        ? (isDark ? AppTheme.accentGreen : AppTheme.primaryGreen)
        : (isDark ? Colors.white : AppTheme.textDark);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
              width: 110,
              child: Text(label,
                  style:
                      TextStyle(fontSize: 12, color: labelColor))),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: highlight ? 15 : 12,
                fontWeight: highlight
                    ? FontWeight.w800
                    : FontWeight.w600,
                color: valueColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
