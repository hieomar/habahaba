/// A persisted record of a sync attempt.
class SyncEvent {
  final String id;
  final DateTime occurredAt;
  final bool success;
  final int recordsSynced;
  final String? errorMessage;

  const SyncEvent({
    required this.id,
    required this.occurredAt,
    required this.success,
    required this.recordsSynced,
    this.errorMessage,
  });
}
