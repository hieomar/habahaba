import 'package:gtms/domain/entities/user_role.dart';

class AppUser {
  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String ipc;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.ipc,
  });
}
