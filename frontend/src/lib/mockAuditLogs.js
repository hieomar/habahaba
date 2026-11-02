// ─────────────────────────────────────────────────────────────
// NASFAM GTMS — Mock Audit Logs
// Records every significant system activity
// ─────────────────────────────────────────────────────────────

export const AUDIT_ACTION_TYPES = {
  LOGIN:           "Login",
  LOGOUT:          "Logout",
  FAILED_LOGIN:    "Failed Login",
  USER_CREATED:    "User Created",
  USER_UPDATED:    "User Updated",
  USER_DISABLED:   "User Disabled",
  USER_ACTIVATED:  "User Activated",
  ROLE_ASSIGNED:   "Role Assigned",
  ROLE_REMOVED:    "Role Removed",
  PERMISSION_CHANGED: "Permission Changed",
  FARMER_CREATED:  "Farmer Created",
  FARMER_UPDATED:  "Farmer Updated",
  PURCHASE_CREATED:"Purchase Created",
  PURCHASE_UPDATED:"Purchase Updated",
  GRN_CREATED:     "GRN Created",
  BATCH_CREATED:   "Batch Created",
  INVENTORY_ADJUSTED: "Inventory Adjusted",
  DISPATCH_CREATED:"Dispatch Created",
  SETTINGS_CHANGED:"Settings Changed",
  PASSWORD_RESET:  "Password Reset",
  REPORT_EXPORTED: "Report Exported",
};

export const AUDIT_SEVERITY = {
  INFO:    "Info",
  WARNING: "Warning",
  CRITICAL:"Critical",
};

export const mockAuditLogs = [
  // ── Login events ───────────────────────────────────────────
  { id: "AUD-001", action: AUDIT_ACTION_TYPES.LOGIN,          userId: "usr-001", userName: "System Administrator",      module: "Authentication", severity: AUDIT_SEVERITY.INFO,     description: "Successful login from 192.168.1.10",                    ipAddress: "192.168.1.10", timestamp: "2026-07-25T07:02:11Z" },
  { id: "AUD-002", action: AUDIT_ACTION_TYPES.LOGIN,          userId: "usr-002", userName: "Warehouse Officer - Lilongwe", module: "Authentication", severity: AUDIT_SEVERITY.INFO,   description: "Successful login from 192.168.1.22",                    ipAddress: "192.168.1.22", timestamp: "2026-07-25T07:15:34Z" },
  { id: "AUD-003", action: AUDIT_ACTION_TYPES.FAILED_LOGIN,   userId: null,      userName: "unknown@nasfam.org",          module: "Authentication", severity: AUDIT_SEVERITY.WARNING, description: "Failed login attempt — incorrect password",              ipAddress: "10.0.0.45",    timestamp: "2026-07-25T08:01:22Z" },
  { id: "AUD-004", action: AUDIT_ACTION_TYPES.LOGIN,          userId: "usr-004", userName: "IPC Manager - Lilongwe",      module: "Authentication", severity: AUDIT_SEVERITY.INFO,    description: "Successful login from 192.168.1.30",                    ipAddress: "192.168.1.30", timestamp: "2026-07-25T08:30:00Z" },
  // ── User management ────────────────────────────────────────
  { id: "AUD-005", action: AUDIT_ACTION_TYPES.USER_CREATED,   userId: "usr-001", userName: "System Administrator",        module: "User Management", severity: AUDIT_SEVERITY.INFO,   description: "Created user account for Warehouse Officer - Mchinji",  ipAddress: "192.168.1.10", timestamp: "2026-01-15T09:00:00Z" },
  { id: "AUD-006", action: AUDIT_ACTION_TYPES.ROLE_ASSIGNED,  userId: "usr-001", userName: "System Administrator",        module: "Role Management", severity: AUDIT_SEVERITY.INFO,   description: "Assigned role 'Warehouse Officer' to usr-003",          ipAddress: "192.168.1.10", timestamp: "2026-01-15T09:05:00Z" },
  { id: "AUD-007", action: AUDIT_ACTION_TYPES.PASSWORD_RESET, userId: "usr-001", userName: "System Administrator",        module: "User Management", severity: AUDIT_SEVERITY.WARNING, description: "Password reset for IPC Manager - Mchinji",               ipAddress: "192.168.1.10", timestamp: "2026-06-10T14:30:00Z" },
  { id: "AUD-008", action: AUDIT_ACTION_TYPES.USER_DISABLED,  userId: "usr-001", userName: "System Administrator",        module: "User Management", severity: AUDIT_SEVERITY.WARNING, description: "User account temporarily disabled: dummy@nasfam.org",   ipAddress: "192.168.1.10", timestamp: "2026-07-01T11:00:00Z" },
  // ── Farmer operations ──────────────────────────────────────
  { id: "AUD-009", action: AUDIT_ACTION_TYPES.FARMER_CREATED, userId: "usr-002", userName: "Warehouse Officer - Lilongwe", module: "Farmer Management", severity: AUDIT_SEVERITY.INFO, description: "New farmer profile created: James Banda (F-000001)",  ipAddress: "192.168.1.22", timestamp: "2024-11-10T08:20:00Z" },
  { id: "AUD-010", action: AUDIT_ACTION_TYPES.FARMER_UPDATED, userId: "usr-004", userName: "IPC Manager - Lilongwe",       module: "Farmer Management", severity: AUDIT_SEVERITY.INFO, description: "Farmer profile updated: Mary Phiri (F-000002)",         ipAddress: "192.168.1.30", timestamp: "2026-03-01T10:00:00Z" },
  // ── Purchase operations ────────────────────────────────────
  { id: "AUD-011", action: AUDIT_ACTION_TYPES.PURCHASE_CREATED, userId: "usr-002", userName: "Warehouse Officer - Lilongwe", module: "Commodity Purchases", severity: AUDIT_SEVERITY.INFO, description: "Purchase PUR-001 created — James Banda, 269kg Maize", ipAddress: "192.168.1.22", timestamp: "2026-04-05T07:30:00Z" },
  { id: "AUD-012", action: AUDIT_ACTION_TYPES.PURCHASE_CREATED, userId: "usr-002", userName: "Warehouse Officer - Lilongwe", module: "Commodity Purchases", severity: AUDIT_SEVERITY.INFO, description: "Purchase PUR-002 created — Mary Phiri, 179kg Soya",   ipAddress: "192.168.1.22", timestamp: "2026-04-06T08:00:00Z" },
  // ── GRN operations ─────────────────────────────────────────
  { id: "AUD-013", action: AUDIT_ACTION_TYPES.GRN_CREATED,     userId: "usr-002", userName: "Warehouse Officer - Lilongwe", module: "GRN Management",    severity: AUDIT_SEVERITY.INFO, description: "GRN-2026-001 created at Lilongwe Warehouse",           ipAddress: "192.168.1.22", timestamp: "2026-04-05T10:30:00Z" },
  { id: "AUD-014", action: AUDIT_ACTION_TYPES.GRN_CREATED,     userId: "usr-003", userName: "Warehouse Officer - Mchinji",  module: "GRN Management",    severity: AUDIT_SEVERITY.INFO, description: "GRN-2026-003 created at Mchinji Warehouse",            ipAddress: "192.168.1.25", timestamp: "2026-04-08T11:00:00Z" },
  // ── Inventory adjustments ──────────────────────────────────
  { id: "AUD-015", action: AUDIT_ACTION_TYPES.INVENTORY_ADJUSTED, userId: "usr-002", userName: "Warehouse Officer - Lilongwe", module: "Inventory", severity: AUDIT_SEVERITY.WARNING, description: "Stock adjustment: Maize -5kg (damaged bags written off)", ipAddress: "192.168.1.22", timestamp: "2026-04-18T13:00:00Z" },
  // ── Dispatch operations ────────────────────────────────────
  { id: "AUD-016", action: AUDIT_ACTION_TYPES.DISPATCH_CREATED,  userId: "usr-002", userName: "Warehouse Officer - Kasungu",  module: "Dispatch",     severity: AUDIT_SEVERITY.INFO, description: "Dispatch DSP-2026-001 created — 176kg Soya to ADMARC",   ipAddress: "192.168.1.28", timestamp: "2026-04-25T07:00:00Z" },
  // ── Settings ───────────────────────────────────────────────
  { id: "AUD-017", action: AUDIT_ACTION_TYPES.SETTINGS_CHANGED,  userId: "usr-001", userName: "System Administrator",         module: "Settings",     severity: AUDIT_SEVERITY.WARNING, description: "System setting changed: password expiry policy updated", ipAddress: "192.168.1.10", timestamp: "2026-07-10T16:00:00Z" },
  // ── Reports ────────────────────────────────────────────────
  { id: "AUD-018", action: AUDIT_ACTION_TYPES.REPORT_EXPORTED,   userId: "usr-004", userName: "IPC Manager - Lilongwe",        module: "Reports",      severity: AUDIT_SEVERITY.INFO, description: "Exported Farmer Registration Report (PDF)",              ipAddress: "192.168.1.30", timestamp: "2026-07-24T14:20:00Z" },
  { id: "AUD-019", action: AUDIT_ACTION_TYPES.REPORT_EXPORTED,   userId: "usr-007", userName: "Head Office Manager",           module: "Reports",      severity: AUDIT_SEVERITY.INFO, description: "Exported National Performance Report (Excel)",           ipAddress: "192.168.1.40", timestamp: "2026-07-25T09:00:00Z" },
  // ── Logout ─────────────────────────────────────────────────
  { id: "AUD-020", action: AUDIT_ACTION_TYPES.LOGOUT,            userId: "usr-002", userName: "Warehouse Officer - Lilongwe", module: "Authentication", severity: AUDIT_SEVERITY.INFO, description: "User logged out",                                       ipAddress: "192.168.1.22", timestamp: "2026-07-25T17:00:00Z" },
];

// ── Helpers ──────────────────────────────────────────────────
export const getAuditLogsByUser   = (userId)  => mockAuditLogs.filter((a) => a.userId  === userId);
export const getAuditLogsByModule = (module)  => mockAuditLogs.filter((a) => a.module  === module);
export const getAuditLogsBySeverity = (sev)   => mockAuditLogs.filter((a) => a.severity === sev);
export const getRecentAuditLogs   = (n = 10)  => [...mockAuditLogs].reverse().slice(0, n);
