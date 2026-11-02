/**
 * NASFAM GTMS — Application-wide constants.
 *
 * MODULES and ACTIONS define the permission matrix dimensions.
 * These are UI-side constants; the authoritative source of truth
 * for enforcing permissions must live in the backend.
 */

export const MODULES = [
  "Dashboard",
  "Farmers",
  "Purchasing",
  "Warehouse",
  "Inventory",
  "Traceability",
  "Customers",
  "Reports",
  "Analytics",
  "Administration",
];

export const ACTIONS = ["View", "Create", "Edit", "Delete", "Approve", "Export", "Manage"];

/** All web-application role IDs recognised by the system. */
export const SYSTEM_ROLE_IDS = [
  "role-sysadmin",
  "role-warehouse-officer",
  "role-ipc-manager",
  "role-head-office",
];

/** IPC options used in user assignment dropdowns. Populated by /api/v1/ipcs in production. */
export const IPC_OPTIONS_FALLBACK = [
  "Lilongwe IPC",
  "Mchinji IPC",
  "Kasungu IPC",
  "Mzimba IPC",
];
