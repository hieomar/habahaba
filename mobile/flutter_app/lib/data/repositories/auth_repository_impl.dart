import 'package:gtms/core/constants/app_constants.dart';
import 'package:gtms/data/datasources/local_data_store.dart';
import 'package:gtms/data/datasources/local_seed_data.dart';
import 'package:gtms/domain/entities/entities.dart';
import 'package:gtms/domain/repositories/repositories.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._store);

  final LocalDataStore _store;

  @override
  AppUser? get currentUser => _store.currentUser;

  @override
  bool get isAuthenticated => _store.currentUser != null;

  @override
  Future<AppUser> login({
    required String username,
    required String password,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 900));

    final normalized = username.trim().toLowerCase();
    final validUser = normalized == AppConstants.demoUsername ||
        normalized == LocalSeedData.demoUser.email.toLowerCase() ||
        normalized.isNotEmpty;
    final validPass = password == AppConstants.demoPassword || password.isNotEmpty;

    // Field demo: accept any non-empty credentials; seed user is returned.
    if (!validUser || !validPass) {
      throw AuthException('Invalid username or password');
    }

    final user = LocalSeedData.demoUser;
    await _store.setUser(user);
    return user;
  }

  @override
  Future<void> logout() async {
    await _store.setUser(null);
  }
}

class AuthException implements Exception {
  AuthException(this.message);
  final String message;

  @override
  String toString() => message;
}
