import 'dart:async';
import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

import 'database_constants.dart';
import 'database_migrations.dart';

/// Singleton database helper for the offline-first SQLite layer.
/// It owns database opening, schema creation, versioning, and migration steps so the
/// repositories can stay focused on domain operations instead of raw SQL plumbing.
class DatabaseHelper {
  DatabaseHelper._();

  static final DatabaseHelper instance = DatabaseHelper._();

  Database? _database;
  final Completer<Database> _databaseCompleter = Completer<Database>();

  Future<Database> get database async {
    if (_database != null) {
      return _database!;
    }
    if (_databaseCompleter.isCompleted) {
      return _databaseCompleter.future;
    }

    try {
      final db = await _openDatabase();
      _database = db;
      if (!_databaseCompleter.isCompleted) {
        _databaseCompleter.complete(db);
      }
      return db;
    } catch (error, stackTrace) {
      if (!_databaseCompleter.isCompleted) {
        _databaseCompleter.completeError(error, stackTrace);
      }
      rethrow;
    }
  }

  Future<Database> _openDatabase() async {
    late final String path;

    try {
      final documentsDirectory = await getApplicationDocumentsDirectory();
      path = p.join(documentsDirectory.path, DatabaseConstants.databaseName);
    } catch (_) {
      final fallbackDirectory = await Directory.current.create(recursive: true);
      path = p.join(fallbackDirectory.path, DatabaseConstants.databaseName);
    }

    return openDatabase(
      path,
      version: DatabaseConstants.databaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
      onConfigure: _onConfigure,
    );
  }

  Future<void> _onConfigure(Database db) async {
    await db.execute('PRAGMA foreign_keys = ON');
  }

  Future<void> _onCreate(Database db, int version) async {
    await DatabaseMigrations.apply(db, 0, version);
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    await DatabaseMigrations.apply(db, oldVersion, newVersion);
  }

  Future<void> close() async {
    final db = _database;
    _database = null;
    if (db != null) {
      await db.close();
    }
  }
}
