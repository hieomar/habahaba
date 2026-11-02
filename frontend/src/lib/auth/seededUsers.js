import { mockUsers } from "@/auth/mockUsers";

export function findSeededUser(email, password) {
  const normalizedEmail = email?.trim().toLowerCase();
  const match = mockUsers.find((user) => {
    const userEmail = user.email?.trim().toLowerCase();
    return userEmail === normalizedEmail && user.password === password;
  });

  if (!match) {
    return null;
  }

  const { password: _password, ...safeUser } = match;

  return {
    ...safeUser,
    role: safeUser.role ?? "System Administrator",
    roleId: safeUser.roleId ?? "role-sysadmin",
    assignedIPC: safeUser.assignedIPC ?? null,
  };
}
