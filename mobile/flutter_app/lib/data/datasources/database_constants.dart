/// Shared constants for the local SQLite schema.
abstract final class DatabaseConstants {
  static const String databaseName = 'gtms_mobile.db';
  static const int databaseVersion = 3;

  // ─── Tables ────────────────────────────────────────────────────────────────
  static const String tableAppSettings = 'app_settings';
  static const String tableFarmers = 'farmers';
  static const String tableFarms = 'farms';
  static const String tableCommodityPurchases = 'commodity_purchases';
  static const String tableSyncEvents = 'sync_events';

  // ─── Shared columns ────────────────────────────────────────────────────────
  static const String columnId = 'id';
  static const String columnUuid = 'uuid';
  static const String columnSyncStatus = 'syncStatus';
  static const String columnCreatedAt = 'createdAt';
  static const String columnUpdatedAt = 'updatedAt';

  static const String columnKey = 'key';
  static const String columnValue = 'value';

  // ─── Farmer columns ────────────────────────────────────────────────────────
  static const String columnFirstName = 'firstName';
  static const String columnLastName = 'lastName';
  static const String columnPhoneNumber = 'phoneNumber';
  static const String columnNationalId = 'nationalId';
  static const String columnVillage = 'village';
  static const String columnDistrict = 'district';
  static const String columnClub = 'club';
  static const String columnAssociation = 'association';
  static const String columnCropsJson = 'cropsJson';
  static const String columnLatitude = 'latitude';
  static const String columnLongitude = 'longitude';
  static const String columnSeedLoanBalance = 'seedLoanBalance';
  static const String columnRegisteredAt = 'registeredAt';

  // ─── Farm columns ──────────────────────────────────────────────────────────
  static const String columnFarmerUuid = 'farmerUuid';
  static const String columnFarmName = 'farmName';
  static const String columnLocation = 'location';
  static const String columnAcreage = 'acreage';
  static const String columnPrimaryCrop = 'primaryCrop';

  // ─── Purchase columns ──────────────────────────────────────────────────────
  static const String columnCommodity = 'commodity';
  static const String columnQuantity = 'quantity';
  static const String columnUnitPrice = 'unitPrice';
  static const String columnTotalPrice = 'totalPrice';
  static const String columnPurchaseDate = 'purchaseDate';
  static const String columnFarmerName = 'farmerName';
  static const String columnVariety = 'variety';
  static const String columnLoanRecovered = 'loanRecovered';
  static const String columnNetPayment = 'netPayment';
  static const String columnReceiptNumber = 'receiptNumber';
  static const String columnBuyingCenter = 'buyingCenter';
  static const String columnNumberOfBags = 'numberOfBags';
  static const String columnBagTagRange = 'bagTagRange';

  // ─── Sync event columns ────────────────────────────────────────────────────
  static const String columnOccurredAt = 'occurredAt';
  static const String columnSuccess = 'success';
  static const String columnRecordsSynced = 'recordsSynced';
  static const String columnErrorMessage = 'errorMessage';

  // ─── app_settings keys ─────────────────────────────────────────────────────
  static const String seedFlag = 'seed_data_initialized';
  static const String currentUserKey = 'current_user';
  static const String onlineStateKey = 'online_state';
  static const String lastSyncKey = 'last_sync';
  static const String seqFarmerKey = 'seq_farmer';
  static const String seqPurchaseKey = 'seq_purchase';
}
