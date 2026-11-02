import 'package:intl/intl.dart';

/// Shared display formatters for currency, weight, and dates.
abstract final class Formatters {
  static final NumberFormat _mk = NumberFormat('#,##0', 'en_MW');
  static final NumberFormat _mkDecimal = NumberFormat('#,##0.00', 'en_MW');
  static final DateFormat _date = DateFormat('d MMM yyyy');
  static final DateFormat _dateTime = DateFormat('d MMM yyyy, HH:mm');

  static String currency(double amount, {bool decimals = false}) {
    final value = decimals ? _mkDecimal.format(amount) : _mk.format(amount);
    return 'MK $value';
  }

  static String compactCurrency(double amount) {
    if (amount >= 1000000) {
      return 'MK ${(amount / 1000000).toStringAsFixed(1)}M';
    }
    return currency(amount);
  }

  static String kg(double quantity) =>
      '${quantity.toStringAsFixed(quantity % 1 == 0 ? 0 : 1)} kg';

  static String tonnes(double kgValue) =>
      '${(kgValue / 1000).toStringAsFixed(1)}t';

  static String date(DateTime value) => _date.format(value);

  static String dateTime(DateTime value) => _dateTime.format(value);

  static String initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }
}
