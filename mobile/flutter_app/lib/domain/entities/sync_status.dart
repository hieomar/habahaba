enum SyncStatus { synced, pending, failed }

extension SyncStatusX on SyncStatus {
  String get label {
    switch (this) {
      case SyncStatus.synced:
        return 'Synced';
      case SyncStatus.pending:
        return 'Pending';
      case SyncStatus.failed:
        return 'Failed';
    }
  }

  bool get isSynced => this == SyncStatus.synced;
}
