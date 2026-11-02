// ─────────────────────────────────────────────────────────────
// NASFAM GTMS — Mock Roles & Permissions
// Web Application roles + Mobile Application roles
// Based on the complete 26-module NASFAM GTMS specification
// ─────────────────────────────────────────────────────────────

export const MODULES = [
  // Core
  "Dashboard",
  // Farmer & Farm
  "Farmer Management",
  "Farm Management",
  // Operations
  "Commodity Purchases",
  "Bag Identification",
  "Warehouse",
  "GRN Management",
  "Batch Management",
  "Inventory",
  "Dispatch",
  // Intelligence
  "Traceability",
  "Reports",
  "IPC Management",
  // Administration
  "User Management",
  "Role Management",
  "Permission Management",
  "Master Data",
  "Audit Logs",
  "Notifications",
  "Settings",
  "Profile",
];

export const ACTIONS = ["View", "Create", "Edit", "Delete", "Approve", "Export", "Manage"];

// ── Helpers ──────────────────────────────────────────────────
const fullAccess = Object.fromEntries(
  MODULES.map((m) => [m, Object.fromEntries(ACTIONS.map((a) => [a, true]))])
);

const noAccess = Object.fromEntries(
  MODULES.map((m) => [m, Object.fromEntries(ACTIONS.map((a) => [a, false]))])
);

function perms(grants) {
  const base = structuredClone(noAccess);
  for (const [mod, actions] of Object.entries(grants)) {
    if (!base[mod]) continue;
    for (const action of actions) {
      base[mod][action] = true;
    }
  }
  return base;
}

// ── Default Permissions per Web Role ─────────────────────────
export const DEFAULT_PERMISSIONS = {
  "role-sysadmin": fullAccess,

  "role-warehouse-officer": perms({
    Dashboard:             ["View"],
    "Commodity Purchases": ["View", "Export"],
    "Bag Identification":  ["View"],
    Warehouse:             ["View", "Create", "Edit", "Approve", "Export"],
    "GRN Management":      ["View", "Create", "Edit", "Approve", "Export"],
    "Batch Management":    ["View", "Create", "Edit", "Export"],
    Inventory:             ["View", "Create", "Edit", "Export"],
    Dispatch:              ["View", "Create", "Export"],
    Traceability:          ["View", "Export"],
    Reports:               ["View", "Export"],
    Notifications:         ["View"],
    Profile:               ["View", "Edit"],
  }),

  "role-ipc-manager": perms({
    Dashboard:              ["View"],
    "Farmer Management":    ["View", "Export"],
    "Farm Management":      ["View", "Export"],
    "Commodity Purchases":  ["View", "Export"],
    "Bag Identification":   ["View", "Export"],
    Warehouse:              ["View", "Export"],
    Inventory:              ["View", "Export"],
    Traceability:           ["View", "Export"],
    Reports:                ["View", "Create", "Export"],
    Notifications:          ["View"],
    Profile:                ["View", "Edit"],
  }),

  "role-head-office": perms({
    Dashboard:              ["View"],
    "Farmer Management":    ["View", "Export"],
    "Commodity Purchases":  ["View", "Export"],
    Inventory:              ["View", "Export"],
    Traceability:           ["View", "Export"],
    Reports:                ["View", "Create", "Export"],
    Notifications:          ["View"],
    Profile:                ["View", "Edit"],
  }),
};

// ── Mobile Application — Default Permission Sets ──────────────
export const MOBILE_PERMISSIONS = {
  "role-registration-officer": {
    "Register Farmers": true,
    "Edit Farmer Information": true,
    "View Farmer Records": true,
    "Capture GPS Coordinates": true,
    "Synchronize Farmer Data": true,
  },
  "role-extension-officer": {
    "View Farmer Records": true,
    "Update Crop Information": true,
    "Record Farm Visits": true,
    "Monitor Production": true,
    "Farmer Advisory Activities": true,
  },
  "role-marketing-officer": {
    "Search Farmers": true,
    "Record Commodity Purchases": true,
    "Record Commodity Quantities": true,
    "Record Purchase Prices": true,
    "Recover Seed Loans": true,
    "Generate Purchase Receipts": true,
  },
};

// ── Seed Roles (runtime editable registry) ────────────────────
export const SEED_ROLES = [
  // ── WEB ROLES ─────────────────────────────────────────────
  {
    id: "role-sysadmin",
    name: "System Administrator",
    type: "System",
    platform: "Web Application",
    status: "Active",
    description:
      "Full administrative access. Responsible for user management, role management, permission configuration, system settings, and audit monitoring. Can perform any operational task when necessary.",
    responsibilities: [
      "Create, edit, disable, and activate user accounts.",
      "Assign and remove multiple roles per user.",
      "Configure module-level permissions for each role.",
      "Manage master data (IPCs, warehouses, commodities, districts, associations, clubs, marketing centres).",
      "Monitor audit logs and system activity.",
      "Configure organisation-wide system settings.",
      "Reset user passwords and manage security policies.",
    ],
    usersAssigned: 1,
    lastModified: "2024-01-10",
    permissions: DEFAULT_PERMISSIONS["role-sysadmin"],
  },
  {
    id: "role-warehouse-officer",
    name: "Warehouse Officer",
    type: "Operational",
    platform: "Web Application",
    status: "Active",
    description:
      "Manages day-to-day warehouse operations including receiving commodity deliveries, generating Goods Received Notes (GRNs), assigning batches, maintaining inventory records, and dispatching commodities.",
    responsibilities: [
      "Receive commodity deliveries into the warehouse.",
      "Verify bags and quantities against delivery records.",
      "Inspect commodity condition on arrival.",
      "Generate Goods Received Notes (GRNs).",
      "Assign storage locations and create warehouse batches.",
      "Update and maintain inventory records.",
      "Process commodity dispatches to customers.",
      "Record stock movements and adjustments.",
    ],
    usersAssigned: 2,
    lastModified: "2024-01-15",
    permissions: DEFAULT_PERMISSIONS["role-warehouse-officer"],
  },
  {
    id: "role-ipc-manager",
    name: "IPC Manager",
    type: "Management",
    platform: "Web Application",
    status: "Active",
    description:
      "Oversees all operations within their assigned IPC including farmer registrations, commodity purchases, warehouse activities, inventory levels, and generates IPC-level performance reports.",
    responsibilities: [
      "Monitor farmer registration within assigned IPC.",
      "Review and supervise commodity purchase activities.",
      "Monitor warehouse receiving, GRNs, and inventory within assigned IPC.",
      "Supervise staff activities and performance.",
      "Generate IPC-level operational and performance reports.",
      "Review traceability records for the assigned IPC.",
    ],
    usersAssigned: 3,
    lastModified: "2024-01-20",
    permissions: DEFAULT_PERMISSIONS["role-ipc-manager"],
  },
  {
    id: "role-head-office",
    name: "Head Office Manager",
    type: "Management",
    platform: "Web Application",
    status: "Active",
    description:
      "National-level oversight across all IPCs. Monitors national performance, compares IPC rankings, reviews commodity trends, and generates executive management reports for strategic decision-making.",
    responsibilities: [
      "Monitor national farmer statistics across all IPCs.",
      "Review national commodity purchase performance.",
      "Monitor and compare warehouse and inventory performance across all IPCs.",
      "Generate national and comparative performance reports.",
      "Analyse commodity trends and production statistics.",
      "Review traceability and dispatch records at national level.",
    ],
    usersAssigned: 1,
    lastModified: "2024-02-01",
    permissions: DEFAULT_PERMISSIONS["role-head-office"],
  },

  // ── MOBILE ROLES ───────────────────────────────────────────
  {
    id: "role-registration-officer",
    name: "Registration Officer",
    type: "Operational",
    platform: "Mobile Application",
    status: "Active",
    description:
      "Field-based role responsible for registering new farmers, capturing GPS farm coordinates, updating farmer profiles, and synchronising farmer data with the central system.",
    responsibilities: [
      "Register new farmers in the field.",
      "Edit and update farmer profile information.",
      "View existing farmer records.",
      "Capture GPS coordinates for farm locations.",
      "Synchronise farmer data with the central system.",
    ],
    usersAssigned: 0,
    lastModified: "2024-01-10",
    permissions: null,
    mobilePermissions: MOBILE_PERMISSIONS["role-registration-officer"],
  },
  {
    id: "role-extension-officer",
    name: "Extension Officer",
    type: "Operational",
    platform: "Mobile Application",
    status: "Active",
    description:
      "Provides agronomic and advisory support to farmers in the field, monitors crop production, records farm visits, and conducts farmer advisory activities.",
    responsibilities: [
      "View farmer records and farm details.",
      "Update crop and production information.",
      "Record field visit notes and outcomes.",
      "Monitor crop production progress.",
      "Conduct and document farmer advisory activities.",
    ],
    usersAssigned: 0,
    lastModified: "2024-01-10",
    permissions: null,
    mobilePermissions: MOBILE_PERMISSIONS["role-extension-officer"],
  },
  {
    id: "role-marketing-officer",
    name: "Marketing Officer",
    type: "Operational",
    platform: "Mobile Application",
    status: "Active",
    description:
      "Commodity Buying Officer responsible for recording farmer purchases, quantities, prices, seed loan recovery, and generating purchase receipts in the field.",
    responsibilities: [
      "Search and identify registered farmers.",
      "Record commodity purchases from farmers.",
      "Record commodity quantities bought.",
      "Record and confirm purchase prices.",
      "Process and recover seed loan repayments.",
      "Generate purchase receipts for farmers.",
    ],
    usersAssigned: 0,
    lastModified: "2024-01-10",
    permissions: null,
    mobilePermissions: MOBILE_PERMISSIONS["role-marketing-officer"],
  },
];
