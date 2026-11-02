enum UserRole {
  registrationOfficer,
  extensionOfficer,
  marketingOfficer,
}

extension UserRoleX on UserRole {
  String get label {
    switch (this) {
      case UserRole.registrationOfficer:
        return 'Registration Officer';
      case UserRole.extensionOfficer:
        return 'Extension Officer';
      case UserRole.marketingOfficer:
        return 'Marketing Officer';
    }
  }
}
