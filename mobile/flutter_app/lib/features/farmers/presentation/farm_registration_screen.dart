import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gtms/core/theme/app_theme.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/state/gtms_controller.dart';

class FarmRegistrationScreen extends StatefulWidget {
  final Farmer farmer;

  const FarmRegistrationScreen({super.key, required this.farmer});

  @override
  State<FarmRegistrationScreen> createState() =>
      _FarmRegistrationScreenState();
}

class _FarmRegistrationScreenState
    extends State<FarmRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _farmNameCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _sizeCtrl = TextEditingController();
  String? _selectedCrop;
  bool _isSaving = false;

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
    _farmNameCtrl.dispose();
    _locationCtrl.dispose();
    _sizeCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCrop == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a primary crop')),
      );
      return;
    }
    setState(() => _isSaving = true);

    final farm = Farm(
      id: 'farm_${DateTime.now().millisecondsSinceEpoch}',
      farmerUuid: widget.farmer.id,
      farmName: _farmNameCtrl.text.trim(),
      location: _locationCtrl.text.trim().isEmpty
          ? widget.farmer.village
          : _locationCtrl.text.trim(),
      acreage: double.tryParse(_sizeCtrl.text),
      primaryCrop: _selectedCrop,
      syncStatus: SyncStatus.pending,
      createdAt: DateTime.now(),
    );

    await context.read<GtmsController>().registerFarm(farm);
    if (!mounted) return;
    setState(() => _isSaving = false);

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Farm "${farm.farmName}" registered and saved offline.'),
        backgroundColor: AppTheme.primaryGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryTextColor =
        isDark ? Colors.white : AppTheme.textDark;
    final secondaryTextColor =
        isDark ? Colors.white70 : AppTheme.textMedium;
    final subTextColor = isDark ? Colors.white54 : AppTheme.textLight;
    final inputBg = isDark ? AppTheme.darkInput : Colors.white;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Register Farm'),
        backgroundColor:
            isDark ? AppTheme.darkCard : AppTheme.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
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
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          physics: const ClampingScrollPhysics(),
          children: [
            // Farmer banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark
                    ? AppTheme.darkCard
                    : AppTheme.primaryGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark
                      ? AppTheme.accentGreen.withValues(alpha: 0.3)
                      : AppTheme.primaryGreen.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.person,
                    color: isDark
                        ? AppTheme.accentGreen
                        : AppTheme.textMedium,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Farmer',
                            style: TextStyle(
                                fontSize: 12,
                                color: secondaryTextColor)),
                        Text(widget.farmer.fullName,
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: primaryTextColor)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Farm details
            _FormSection(
              title: 'Farm Details',
              icon: Icons.grass_rounded,
              children: [
                _Field(
                  controller: _farmNameCtrl,
                  label: 'Farm Name or Identifier',
                  hint: 'e.g. North Field',
                  inputBg: inputBg,
                  primaryTextColor: primaryTextColor,
                  subTextColor: subTextColor,
                  secondaryTextColor: secondaryTextColor,
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                _Field(
                  controller: _locationCtrl,
                  label: 'Location / Area',
                  hint: 'e.g. North of village near river',
                  inputBg: inputBg,
                  primaryTextColor: primaryTextColor,
                  subTextColor: subTextColor,
                  secondaryTextColor: secondaryTextColor,
                ),
                const SizedBox(height: 16),
                _Field(
                  controller: _sizeCtrl,
                  label: 'Farm Size (Hectares)',
                  keyboardType: const TextInputType.numberWithOptions(
                      decimal: true),
                  hint: '0.00',
                  inputBg: inputBg,
                  primaryTextColor: primaryTextColor,
                  subTextColor: subTextColor,
                  secondaryTextColor: secondaryTextColor,
                ),
                const SizedBox(height: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Primary Crop',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: secondaryTextColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _selectedCrop,
                      dropdownColor: Theme.of(context).cardColor,
                      style: TextStyle(color: primaryTextColor),
                      iconEnabledColor: secondaryTextColor,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                              color: Theme.of(context).dividerColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                              color: Theme.of(context).dividerColor),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: isDark
                                ? AppTheme.accentGreen
                                : AppTheme.primaryGreen,
                            width: 2,
                          ),
                        ),
                        filled: true,
                        fillColor: inputBg,
                      ),
                      hint: Text('Select crop…',
                          style: TextStyle(color: subTextColor)),
                      items: _crops
                          .map((c) => DropdownMenuItem(
                                value: c,
                                child: Text(c,
                                    style: TextStyle(
                                        color: primaryTextColor)),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _selectedCrop = v),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 32),

            ElevatedButton.icon(
              onPressed: _isSaving ? null : _save,
              icon: _isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.save_outlined, size: 18),
              label: const Text('Register Farm'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

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
    final primaryTextColor = isDark ? Colors.white : AppTheme.textDark;
    final iconColor =
        isDark ? AppTheme.accentGreen : AppTheme.textMedium;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border:
            Border.all(color: Theme.of(context).dividerColor, width: 0.8),
        boxShadow: isDark
            ? []
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                  bottom:
                      BorderSide(color: Theme.of(context).dividerColor)),
            ),
            child: Row(
              children: [
                Icon(icon, color: iconColor, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: primaryTextColor,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
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
  final Color inputBg;
  final Color primaryTextColor;
  final Color secondaryTextColor;
  final Color subTextColor;

  const _Field({
    required this.controller,
    required this.label,
    required this.inputBg,
    required this.primaryTextColor,
    required this.secondaryTextColor,
    required this.subTextColor,
    this.hint,
    this.keyboardType,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: secondaryTextColor,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          style: TextStyle(color: primaryTextColor),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: subTextColor),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  BorderSide(color: Theme.of(context).dividerColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  BorderSide(color: Theme.of(context).dividerColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: isDark
                    ? AppTheme.accentGreen
                    : AppTheme.primaryGreen,
                width: 2,
              ),
            ),
            filled: true,
            fillColor: inputBg,
          ),
          validator: validator,
        ),
      ],
    );
  }
}
