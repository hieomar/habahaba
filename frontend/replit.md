# NASFAM IPC Grain Traceability System

Internal platform for grain traceability, warehouse operations, and supply chain oversight operated by the National Smallholder Farmers' Association of Malawi (NASFAM).

## How to run

```bash
npm install
npm run dev -- -p 5000
```

The app runs on port 5000. Open the preview to see the login page.

## Test credentials

See `CREDENTIALS.md` for all test accounts. Quick access:

| Role | Email | Password |
|------|-------|----------|
| System Administrator | admin@nasfam.org | Admin@123 |
| Warehouse Officer | warehouse.lilongwe@nasfam.org | Warehouse@123 |
| IPC Manager | ipc.lilongwe@nasfam.org | IPCManager@123 |
| Head Office Manager | headoffice@nasfam.org | HeadOffice@123 |

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS v4
- **Auth**: Mock role-based auth (client-side, localStorage)
- **Data**: Mock data in `src/auth/mock*.js`

## Project structure

```
src/
├── app/
│   ├── dashboard/          # Dashboard modules (admin, warehouse, farmers, etc.)
│   ├── loginpage.jsx       # Login route
│   ├── globals.css         # Design tokens and base styles
│   └── layout.jsx          # Root layout with Auth/RBAC/Notification providers
├── auth/
│   ├── authContext.jsx     # Authentication context
│   ├── rbacContext.jsx     # Role-based access control
│   ├── notificationContext.jsx
│   └── mock*.js            # Mock users, IPCs, roles, notifications, sync data
└── components/
    ├── LoginPage.jsx
    ├── Sidebar.jsx
    ├── WorkspaceLayout.jsx
    └── ReportShell.jsx
public/
└── branding/
    └── nasfam-logo.png     # Official NASFAM logo — do not replace
```

## Branding

Colour tokens (from `globals.css`):
- `--nasfam-green`: `#1a5c2a` — primary brand colour
- `--nasfam-green-dark`: `#134520` — hover/active states
- `--nasfam-green-light`: `#e8f1ea` — subtle backgrounds

## Admin dashboard — what's implemented

All buttons and actions in the admin dashboard are functional:

| Module | Actions |
|--------|---------|
| **Admin Home** | Module card grid navigates to each sub-module |
| **Users** | Search, Add User (modal + validation), Edit User, Activate/Deactivate; Farmer list with search |
| **Roles & Permissions** | Create custom role, duplicate, toggle status, delete, reset to defaults |
| **Warehouse Management** | Search, Add Warehouse, Edit, Activate/Deactivate, toast feedback |
| **IPC Management** | Search, Add IPC, Edit IPC (3-dot menu), Activate/Deactivate, toast feedback |
| **Sync Management** | Trigger Manual Sync (animated button + toast), device filter tabs (All/Synced/Failed) |
| **Audit Logs** | Filter by log type and action, Export Excel (downloads .xls), Print Report (print dialog) |
| **Settings** | Change Password (with validation + show/hide), toggle notifications, security policies, SMTP config, Save + Reset to Defaults |

## User preferences

_None recorded yet._
