import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';
import 'package:gtms/features/farmers/presentation/farmer_profile_screen.dart';

class TraceLookupScreen extends StatefulWidget {
  const TraceLookupScreen({super.key});

  @override
  State<TraceLookupScreen> createState() => _TraceLookupScreenState();
}

class _TraceLookupScreenState extends State<TraceLookupScreen> {
  final _searchCtrl = TextEditingController();
  bool _isSearching = false;
  bool _hasResult = false;
  bool _isScanningCamera = false;
  
  // Mock results
  Farmer? _mockFarmer;
  CommodityPurchase? _mockPurchase;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _performSearch() async {
    final query = _searchCtrl.text.trim();
    if (query.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a trace ID or bag number')),
      );
      return;
    }
    
    setState(() {
      _isSearching = true;
      _hasResult = false;
      _mockFarmer = null;
      _mockPurchase = null;
    });

    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;

    final controller = context.read<GtmsController>();
    
    // 1. Try to find a real purchase matching the receipt number or ID
    final queryLower = query.toLowerCase();
    CommodityPurchase? foundPurchase;
    for (final p in controller.purchases) {
      if (p.receiptNumber.toLowerCase().contains(queryLower) ||
          p.id.toLowerCase().contains(queryLower)) {
        foundPurchase = p;
        break;
      }
    }
    
    Farmer? foundFarmer;
    if (foundPurchase != null) {
      // Find the farmer for this purchase
      for (final f in controller.farmers) {
        if (f.farmerId == foundPurchase.farmerId) {
          foundFarmer = f;
          break;
        }
      }
      // Fallback to match by name
      if (foundFarmer == null) {
        for (final f in controller.farmers) {
          if (f.fullName.toLowerCase() == foundPurchase.farmerName.toLowerCase()) {
            foundFarmer = f;
            break;
          }
        }
      }
    }
    
    // 2. Fallback to first purchase/farmer if search query is the mock BAG-12345
    if (foundPurchase == null && (queryLower == 'bag-12345' || queryLower.contains('12345'))) {
      foundPurchase = controller.purchases.isNotEmpty ? controller.purchases.first : null;
      foundFarmer = controller.farmers.isNotEmpty ? controller.farmers.first : null;
    }
    
    setState(() {
      _isSearching = false;
      _hasResult = true;
      _mockPurchase = foundPurchase;
      _mockFarmer = foundFarmer;
    });

    if (foundPurchase == null || foundFarmer == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('No traceability record found for "$query"'),
          backgroundColor: AppTheme.textMedium,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Trace Bag Lookup'),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            GestureDetector(
              onTap: () async {
                if (_isScanningCamera || _isSearching) return;
                setState(() => _isScanningCamera = true);
                await Future.delayed(const Duration(seconds: 2));
                if (!mounted) return;
                setState(() {
                  _isScanningCamera = false;
                  _searchCtrl.text = 'BAG-12345';
                });
                _performSearch();
              },
              child: Container(
                height: 200,
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkCard : Colors.black87,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Theme.of(context).dividerColor, width: 0.8),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Icon(
                      Icons.qr_code_scanner_rounded, 
                      size: 80, 
                      color: _isScanningCamera ? Colors.white : Colors.white54,
                    ),
                    if (_isScanningCamera)
                      const CircularProgressIndicator(color: AppTheme.accentGreen),
                    Positioned(
                      bottom: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _isScanningCamera ? 'Scanning QR Code...' : 'Tap to simulate camera QR scan',
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _searchCtrl,
              style: TextStyle(color: isDark ? Colors.white : AppTheme.textDark),
              decoration: InputDecoration(
                hintText: 'Enter Bag ID / Receipt Number',
                prefixIcon: Icon(Icons.search, color: isDark ? Colors.white70 : AppTheme.textLight),
                suffixIcon: IconButton(
                  icon: Icon(Icons.arrow_forward_rounded, color: isDark ? AppTheme.accentGreen : AppTheme.primaryGreen),
                  onPressed: _performSearch,
                ),
              ),
              onSubmitted: (_) => _performSearch(),
            ),
            const SizedBox(height: 24),
            if (_isSearching)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_hasResult)
              _mockPurchase != null && _mockFarmer != null
                  ? _buildResultCard(context, _mockPurchase!, _mockFarmer!)
                  : _buildNotFoundCard(context),
          ],
        ),
      ),
    );
  }

  Widget _buildNotFoundCard(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Column(
        children: [
          const Icon(Icons.search_off_rounded, size: 48, color: AppTheme.errorRed),
          const SizedBox(height: 12),
          Text(
            'No Record Found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : AppTheme.textDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'No purchase or bag traceability record matching "${_searchCtrl.text}"',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : AppTheme.textMedium),
          ),
        ],
      ),
    );
  }

  Widget _buildResultCard(BuildContext context, CommodityPurchase purchase, Farmer farmer) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final headerBg = isDark ? AppTheme.darkInput : AppTheme.lightGreen;
    final headerTitleColor = isDark ? AppTheme.accentGreen : AppTheme.primaryGreen;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: headerBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Icon(Icons.verified_rounded, color: isDark ? AppTheme.accentGreen : AppTheme.textMedium, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Traceability Record Found',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: headerTitleColor,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInfoRow(context, 'Trace ID', _searchCtrl.text),
                Divider(height: 24, color: Theme.of(context).dividerColor),
                _buildInfoRow(context, 'Commodity', '${purchase.commodityType} - ${purchase.variety}'),
                const SizedBox(height: 12),
                _buildInfoRow(context, 'Quantity', '${purchase.quantityKg} kg'),
                const SizedBox(height: 12),
                _buildInfoRow(context, 'Date Purchased', purchase.purchasedAt.toString().split(' ')[0]),
                Divider(height: 24, color: Theme.of(context).dividerColor),
                _buildInfoRow(context, 'Farmer Name', farmer.fullName),
                const SizedBox(height: 12),
                _buildInfoRow(context, 'Farmer ID', farmer.farmerId),
                const SizedBox(height: 12),
                _buildInfoRow(context, 'Village', farmer.village),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => FarmerProfileScreen(farmer: farmer),
                        ),
                      );
                    },
                    icon: const Icon(Icons.person_outline_rounded),
                    label: const Text('View Farmer Profile'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: isDark ? AppTheme.accentGreen : AppTheme.primaryGreen,
                      side: BorderSide(color: isDark ? AppTheme.accentGreen : AppTheme.primaryGreen),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor = isDark ? Colors.white70 : AppTheme.textMedium;
    final valueColor = isDark ? Colors.white : AppTheme.textDark;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: TextStyle(
              color: labelColor,
              fontSize: 13,
            ),
          ),
        ),
        Expanded(
          flex: 3,
          child: Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: valueColor,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}
