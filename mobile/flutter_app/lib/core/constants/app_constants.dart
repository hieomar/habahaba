/// App-wide constants for GTMS (Grain Traceability Management System).
abstract final class AppConstants {
  static const String appName = 'IPC Grain Traceability';
  static const String appShortName = 'GTMS';
  static const String organization = 'NASFAM';
  static const String versionLabel = 'v1.0.0';
  static const String defaultIpc = 'Lilongwe IPC';
  static const String defaultBuyingCentre = 'Lilongwe Buying Centre';

  /// Backend API Base URL
  static const String apiBaseUrl = 'http://localhost:5000/api/v1';

  /// Demo credentials for local / offline field testing.
  static const String demoUsername = 'admin@nasfam.mw';
  static const String demoPassword = 'Admin@123';
}
