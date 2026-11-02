import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';

class FarmerRegistrationScreen extends StatefulWidget {
  const FarmerRegistrationScreen({super.key});

  @override
  State<FarmerRegistrationScreen> createState() =>
      _FarmerRegistrationScreenState();
}

class _FarmerRegistrationScreenState
    extends State<FarmerRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _nationalIdCtrl = TextEditingController();
  final _villageCtrl = TextEditingController();
  final _districtCtrl = TextEditingController();
  final _clubCtrl = TextEditingController();
  final _associationCtrl = TextEditingController();
  final _seedLoanCtrl = TextEditingController(text: '0.00');

  final List<String> _selectedCrops = [];
  bool _gpsCapturing = false;
  String? _gpsStatus;
  bool _isSaving = false;
  double? _latitude;
  double? _longitude;

  static const List<String> _crops = [
    'Maize',
    'Soybean',
    'Groundnuts',
    'Beans',
    'Pigeon Peas',
    'Sunflower',
    'Sesame',
  ];

  @override
  void dispose() {
    for (final c in [
      _firstNameCtrl,
      _lastNameCtrl,
      _phoneCtrl,
      _nationalIdCtrl,
      _villageCtrl,
      _districtCtrl,
      _clubCtrl,
      _associationCtrl,
      _seedLoanCtrl,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _captureGPS() async {
    setState(() {
      _gpsCapturing = true;
      _gpsStatus = null;
    });
    // Simulate GPS acquisition (real GPS via geolocator when deployed to device).
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    // Demo coordinates for Lilongwe; a real build would use geolocator.
    const lat = -13.9833;
    const lon = 33.7833;
    setState(() {
      _gpsCapturing = false;
      _latitude = lat;
      _longitude = lon;
      _gpsStatus =
          'Location captured: ${lat.toStringAsFixed(4)}°S, ${lon.toStringAsFixed(4)}°E';
    });
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCrops.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Please select at least one crop')),
      );
      return;
    }
    setState(() => _isSaving = true);

    final controller = context.read<GtmsController>();

    // Unique farmer ID from DB sequence — collision-free.
    final farmerId = await controller.nextFarmerId();

    final farmer = Farmer(
      id: 'f_${DateTime.now().millisecondsSinceEpoch}',
      farmerId: farmerId,
      firstName: _firstNameCtrl.text.trim(),
      lastName: _lastNameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      village: _villageCtrl.text.trim(),
      district: _districtCtrl.text.trim(),
      club: _clubCtrl.text.trim(),
      association: _associationCtrl.text.trim(),
      crops: List<String>.from(_selectedCrops),
      latitude: _latitude,
      longitude: _longitude,
      seedLoanBalance:
          double.tryParse(_seedLoanCtrl.text) ?? 0,
      registeredAt: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );

    await controller.registerFarmer(farmer);
    if (!mounted) return;
    setState(() => _isSaving = false);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: const BoxDecoration(
                color: Color(0xFFEEEEEE),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded,
                  color: AppTheme.textMedium, size: 32),
            ),
            const SizedBox(height: 16),
            const Text(
              'Farmer Registered',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textDark),
            ),
            const SizedBox(height: 8),
            Text(
              '${_firstNameCtrl.text.trim()} ${_lastNameCtrl.text.trim()}',
              style: const TextStyle(
                  fontSize: 15, color: AppTheme.textMedium),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.lightGreen,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                farmerId,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryGreen,
                  fontFamily: 'monospace',
                ),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Farmer ID assigned',
              style:
                  TextStyle(fontSize: 11, color: AppTheme.textLight),
            ),
            const SizedBox(height: 8),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF8E1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '⏳ Pending synchronization',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.accentAmber),
              ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final avatarBg =
        isDark ? const Color(0xFF2C323B) : const Color(0xFFEEEEEE);
    final avatarIconColor =
        isDark ? Colors.white70 : AppTheme.textMedium;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Register Farmer'),
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
            // Avatar placeholder
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 45,
                    backgroundColor: avatarBg,
                    child: Icon(Icons.person,
                        size: 45, color: avatarIconColor),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppTheme.accentGreen
                            : AppTheme.textMedium,
                        shape: BoxShape.circle,
                        border:
                            Border.all(color: Colors.white, width: 2),
                      ),
                      child: const Icon(Icons.camera_alt,
                          size: 16, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Personal Information ────────────────────────────────
            _FormSection(
              title: 'Personal Information',
              icon: Icons.person_outline_rounded,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _Field(
                        controller: _firstNameCtrl,
                        label: 'First Name',
                        validator: _required,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _Field(
                        controller: _lastNameCtrl,
                        label: 'Last Name',
                        validator: _required,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _Field(
                  controller: _phoneCtrl,
                  label: 'Phone Number',
                  keyboardType: TextInputType.phone,
                  validator: _required,
                  hint: '+265 9XX XXX XXX',
                ),
              ],
            ),

            const SizedBox(height: 14),

            // ── Identification ─────────────────────────────────────
            _FormSection(
              title: 'Identification',
              icon: Icons.badge_outlined,
              children: [
                _Field(
                  controller: _nationalIdCtrl,
                  label: 'National ID / Voter ID',
                  hint: 'e.g. 12345678910',
                  validator: null, // optional
                ),
                const SizedBox(height: 6),
                Text(
                  'Enter the farmer\'s government-issued ID number. '
                  'A NASFAM farmer ID will be auto-assigned on registration.',
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? Colors.white54 : AppTheme.textLight,
                    height: 1.4,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // ── Location ───────────────────────────────────────────
            _FormSection(
              title: 'Location',
              icon: Icons.location_on_outlined,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _Field(
                        controller: _villageCtrl,
                        label: 'Village / Area',
                        validator: _required,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _Field(
                        controller: _districtCtrl,
                        label: 'District',
                        validator: _required,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // GPS capture
                GestureDetector(
                  onTap: _gpsCapturing ? null : _captureGPS,
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: _gpsStatus != null
                          ? AppTheme.lightGreen
                          : (isDark ? AppTheme.darkInput : Colors.white),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: _gpsStatus != null
                            ? AppTheme.accentGreen.withValues(alpha: 0.4)
                            : Theme.of(context).dividerColor,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _gpsStatus != null
                              ? Icons.gps_fixed_rounded
                              : Icons.gps_not_fixed_rounded,
                          color: AppTheme.textMedium,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _gpsCapturing
                                ? 'Acquiring GPS signal…'
                                : _gpsStatus ??
                                    'Tap to capture GPS coordinates',
                            style: TextStyle(
                              fontSize: 13,
                              color: _gpsStatus != null
                                  ? AppTheme.primaryGreen
                                  : AppTheme.textLight,
                              fontWeight: _gpsStatus != null
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                        ),
                        if (_gpsCapturing)
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppTheme.primaryGreen,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // ── Club & Association ─────────────────────────────────
            _FormSection(
              title: 'Club & Association',
              icon: Icons.group_outlined,
              children: [
                _Field(
                  controller: _clubCtrl,
                  label: 'Farmer Club Name',
                  validator: _required,
                ),
                const SizedBox(height: 12),
                _Field(
                  controller: _associationCtrl,
                  label: 'Association Name',
                  validator: _required,
                ),
              ],
            ),

            const SizedBox(height: 14),

            // ── Crops Grown ────────────────────────────────────────
            _FormSection(
              title: 'Crops Grown',
              icon: Icons.eco_outlined,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _crops.map((crop) {
                    final selected = _selectedCrops.contains(crop);
                    return FilterChip(
                      label: Text(crop),
                      selected: selected,
                      onSelected: (v) => setState(() => v
                          ? _selectedCrops.add(crop)
                          : _selectedCrops.remove(crop)),
                      selectedColor: AppTheme.lightGreen,
                      checkmarkColor: AppTheme.primaryGreen,
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: selected
                            ? AppTheme.primaryGreen
                            : AppTheme.textMedium,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: selected
                              ? AppTheme.accentGreen
                              : AppTheme.divider,
                        ),
                      ),
                      backgroundColor: isDark
                          ? AppTheme.darkInput
                          : Colors.white,
                    );
                  }).toList(),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // ── Seed Loan ──────────────────────────────────────────
            _FormSection(
              title: 'Seed Loan',
              icon: Icons.payments_outlined,
              children: [
                _Field(
                  controller: _seedLoanCtrl,
                  label: 'Outstanding Seed Loan (MK)',
                  keyboardType: const TextInputType.numberWithOptions(
                      decimal: true),
                  hint: '0.00',
                ),
              ],
            ),

            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: _isSaving ? null : _save,
              icon: _isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.save_outlined, size: 18),
              label: const Text('Save & Register Farmer'),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  String? _required(String? v) =>
      (v == null || v.trim().isEmpty) ? 'This field is required' : null;
}

// ─── Shared form widgets ───────────────────────────────────────────────────────

class _FormSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;

  const _FormSection({
    required this.title,
    required this.icon,
    required this.children,
  });

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
        border:
            Border.all(color: Theme.of(context).dividerColor, width: 0.8),
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
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Theme.of(context).dividerColor),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  const _Field({
    required this.controller,
    required this.label,
    this.hint,
    this.keyboardType,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
      ),
    );
  }
}
