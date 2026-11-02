// ─────────────────────────────────────────────────────────────
// NASFAM GTMS — Mock Users
// Complete user registry for all roles with dummy credentials
// ─────────────────────────────────────────────────────────────

export const mockUsers = [
  // ── System Administrator ──────────────────────────────────
  {
    id: "usr-001",
    name: "System Administrator",
    email: "admin@nasfam.org",
    phone: "+265 999 000 001",
    roleId: "role-sysadmin",
    role: "System Administrator",
    assignedIPC: null,
    status: "Active",
    password: "Admin@123",
    createdAt: "2024-01-10",
  },

  // ── Warehouse Officers ────────────────────────────────────
  {
    id: "usr-002",
    name: "Warehouse Officer - Lilongwe",
    email: "warehouse.lilongwe@nasfam.org",
    phone: "+265 999 000 002",
    roleId: "role-warehouse-officer",
    role: "Warehouse Officer",
    assignedIPC: "Lilongwe IPC",
    status: "Active",
    password: "Warehouse@123",
    createdAt: "2024-01-15",
  },
  {
    id: "usr-003",
    name: "Warehouse Officer - Mchinji",
    email: "warehouse.mchinji@nasfam.org",
    phone: "+265 999 000 003",
    roleId: "role-warehouse-officer",
    role: "Warehouse Officer",
    assignedIPC: "Mchinji IPC",
    status: "Active",
    password: "Warehouse@123",
    createdAt: "2024-01-15",
  },

  // ── IPC Managers ──────────────────────────────────────────
  {
    id: "usr-004",
    name: "IPC Manager - Lilongwe",
    email: "ipc.lilongwe@nasfam.org",
    phone: "+265 999 000 004",
    roleId: "role-ipc-manager",
    role: "IPC Manager",
    assignedIPC: "Lilongwe IPC",
    status: "Active",
    password: "IPCManager@123",
    createdAt: "2024-01-20",
  },
  {
    id: "usr-005",
    name: "IPC Manager - Mchinji",
    email: "ipc.mchinji@nasfam.org",
    phone: "+265 999 000 005",
    roleId: "role-ipc-manager",
    role: "IPC Manager",
    assignedIPC: "Mchinji IPC",
    status: "Active",
    password: "IPCManager@123",
    createdAt: "2024-01-20",
  },
  {
    id: "usr-006",
    name: "IPC Manager - Kasungu",
    email: "ipc.kasungu@nasfam.org",
    phone: "+265 999 000 006",
    roleId: "role-ipc-manager",
    role: "IPC Manager",
    assignedIPC: "Kasungu IPC",
    status: "Active",
    password: "IPCManager@123",
    createdAt: "2024-01-20",
  },

  // ── Head Office Manager ───────────────────────────────────
  {
    id: "usr-007",
    name: "Head Office Manager",
    email: "headoffice@nasfam.org",
    phone: "+265 999 000 007",
    roleId: "role-head-office",
    role: "Head Office Manager",
    assignedIPC: null,
    status: "Active",
    password: "HeadOffice@123",
    createdAt: "2024-02-01",
  },
];

// SEED_USERS is the editable runtime registry used by User Management.
export const SEED_USERS = [
  // ── System Administrator ──────────────────────────────────
  {
    id: "usr-001",
    name: "System Administrator",
    email: "admin@nasfam.org",
    phone: "+265 999 000 001",
    roleId: "role-sysadmin",
    role: "System Administrator",
    assignedIPC: null,
    status: "Active",
    createdAt: "2024-01-10",
  },

  // ── Warehouse Officers ────────────────────────────────────
  {
    id: "usr-002",
    name: "Warehouse Officer - Lilongwe",
    email: "warehouse.lilongwe@nasfam.org",
    phone: "+265 999 000 002",
    roleId: "role-warehouse-officer",
    role: "Warehouse Officer",
    assignedIPC: "Lilongwe IPC",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: "usr-003",
    name: "Warehouse Officer - Mchinji",
    email: "warehouse.mchinji@nasfam.org",
    phone: "+265 999 000 003",
    roleId: "role-warehouse-officer",
    role: "Warehouse Officer",
    assignedIPC: "Mchinji IPC",
    status: "Active",
    createdAt: "2024-01-15",
  },

  // ── IPC Managers ──────────────────────────────────────────
  {
    id: "usr-004",
    name: "IPC Manager - Lilongwe",
    email: "ipc.lilongwe@nasfam.org",
    phone: "+265 999 000 004",
    roleId: "role-ipc-manager",
    role: "IPC Manager",
    assignedIPC: "Lilongwe IPC",
    status: "Active",
    createdAt: "2024-01-20",
  },
  {
    id: "usr-005",
    name: "IPC Manager - Mchinji",
    email: "ipc.mchinji@nasfam.org",
    phone: "+265 999 000 005",
    roleId: "role-ipc-manager",
    role: "IPC Manager",
    assignedIPC: "Mchinji IPC",
    status: "Active",
    createdAt: "2024-01-20",
  },
  {
    id: "usr-006",
    name: "IPC Manager - Kasungu",
    email: "ipc.kasungu@nasfam.org",
    phone: "+265 999 000 006",
    roleId: "role-ipc-manager",
    role: "IPC Manager",
    assignedIPC: "Kasungu IPC",
    status: "Active",
    createdAt: "2024-01-20",
  },

  // ── Head Office Manager ───────────────────────────────────
  {
    id: "usr-007",
    name: "Head Office Manager",
    email: "headoffice@nasfam.org",
    phone: "+265 999 000 007",
    roleId: "role-head-office",
    role: "Head Office Manager",
    assignedIPC: null,
    status: "Active",
    createdAt: "2024-02-01",
  },
];
