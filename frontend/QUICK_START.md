# GTMS Web Application - Quick Start Guide

## 🚀 Getting Started

### 1. System Access
The GTMS web application is a professional enterprise system with role-based access. Four distinct user roles with different capabilities:

### 2. Login
- **URL**: `http://localhost:3000/login`
- **Default Users**: See CREDENTIALS.md

## 👥 User Roles & Access

```
┌─────────────────────────────────────────────────────────────┐
│                   SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ System Administrator │ ← Full System Access
├──────────────────────┤
│ • User Management    │
│ • Role Management    │
│ • Warehouse Ops      │
│ • IPC Management     │
│ • Sync Monitoring    │
│ • Audit Logs         │
│ • Settings           │
└──────────────────────┘

┌──────────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│ Warehouse Officer    │      │  IPC Manager    │      │ Head Office Mgr  │
├──────────────────────┤      ├─────────────────┤      ├──────────────────┤
│ • Warehouse Ops      │      │ • Farmers       │      │ • All IPCs Data  │
│ • Inventory          │      │ • Purchasing    │      │ • National Stats │
│ • Stock Updates      │      │ • Warehouse     │      │ • Analytics      │
│ • Reports            │      │ • Reports       │      │ • Reports        │
│ • Traceability       │      │ • Analytics     │      │ • Traceability   │
└──────────────────────┘      └─────────────────┘      └──────────────────┘
```

## 📊 Dashboard Overview

### System Administrator Dashboard
Shows comprehensive system health and quick access to all admin modules.

```
┌──────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [7 Active Users]  [4 System Roles]  [4 Active IPCs]    │
│  [2 Synced Dev]    [99.8% Uptime]    [98.2% Sync OK]    │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  MODULES                                                  │
│                                                           │
│  [👥 Users]        [🔐 Roles]        [🏢 Warehouse]     │
│  [🏭 IPC Mgmt]     [🔄 Sync Mgmt]    [📋 Audit Logs]    │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  ALERTS                                                   │
│  ⚠️  23 pending synchronizations                         │
│  ✅ System operational - no critical alerts             │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Sync Management Dashboard
Real-time mobile device synchronization monitoring.

```
┌──────────────────────────────────────────────────────────┐
│  SYNC MANAGEMENT                                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  [1245 Synced]  [23 Pending]  [5 Failed]  [98.2% OK]   │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  DEVICE STATUS                                            │
│                                                           │
│  [✅ John Banda]   [✅ Mary Mwale]   [❌ Samuel Phiri]   │
│   Samsung A12      Tecno Pop 3       Samsung A50         │
│   Syncing          Synced            Failed              │
│   87% Battery      42% Battery       15% Battery         │
│   WiFi             Cellular          No Connection       │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  RECENT SYNC ACTIVITY                                     │
│  14:32 - John Banda - Sync Started (5 records)          │
│  13:15 - Mary Mwale - Sync Completed (3 records)        │
│  11:45 - Samuel Phiri - Sync Failed (2 records)         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 🔐 RBAC Navigation

Each user sees a role-specific sidebar with appropriate modules.

### System Admin View
```
DASHBOARD
├── Dashboard
├── Farmers
├── Purchasing
├── Warehouse
├── Traceability
├── Customers
├── Reports
├── Analytics
└── Administration ✨
    ├── Dashboard
    ├── Users
    ├── Roles & Permissions
    ├── Warehouse Management
    ├── IPC Management
    ├── Sync Management
    ├── Audit Logs
    └── Settings
```

### Warehouse Officer View
```
DASHBOARD
├── Dashboard
├── Warehouse ✨
├── Traceability
└── Reports
```

### IPC Manager View
```
DASHBOARD
├── Dashboard
├── Farmers ✨
├── Purchasing ✨
├── Warehouse ✨
├── Traceability
├── Reports
└── Analytics
```

## 📱 Synchronization Monitoring

### Device Status Cards
Each device shows:
- Officer name and device model
- Sync status (Synced/Pending/In Progress/Failed)
- Records uploaded count
- Pending records count
- Failed records count
- Battery level
- Connectivity status (WiFi/Cellular/No Connection)
- Last sync timestamp

### Sync History Table
Real-time activity feed showing:
- Officer name
- Action (SYNC_STARTED, SYNC_COMPLETED, SYNC_FAILED)
- Record type
- Number of records
- Device model
- Status and timestamp

## 📋 Audit Logs

Complete system activity tracking:
- All user logins/logouts
- User creation and modifications
- Role updates
- Sync events
- Data exports
- System configuration changes
- Password resets
- Failed login attempts

**Features:**
- Search across all fields
- Filter by action type
- Filter by severity level
- Timestamp precision
- User accountability

## ⚙️ System Settings

Admin can configure:
- **Notifications**: Email alerts, sync notifications, user activity alerts
- **Security**: Max login attempts, session timeout
- **Backups**: Frequency (hourly/daily/weekly/monthly)
- **Email**: SMTP server, port, sender address

## 👤 Test Credentials

### Admin Account
```
Email:    admin@nasfam.org
Password: Admin@123
Role:     System Administrator
Access:   FULL
```

### Warehouse Officer
```
Email:    warehouse.lilongwe@nasfam.org
Password: Warehouse@123
Role:     Warehouse Officer
IPC:      Lilongwe IPC
Access:   Warehouse operations only
```

### IPC Manager
```
Email:    ipc.lilongwe@nasfam.org
Password: IPCManager@123
Role:     IPC Manager
IPC:      Lilongwe IPC
Access:   IPC operations (Lilongwe only)
```

### Head Office Manager
```
Email:    headoffice@nasfam.org
Password: HeadOffice@123
Role:     Head Office Manager
Access:   Organization-wide view
```

*For all credentials, see CREDENTIALS.md*

## 🎯 Main Features

### ✅ System Administration
- User account management
- Role and permission setup
- System configuration
- Audit logging
- Sync monitoring

### ✅ Warehouse Operations
- Inventory management
- Stock tracking
- Delivery management
- Warehouse reports

### ✅ IPC Management
- Farmer oversight
- Purchase tracking
- Warehouse monitoring
- Performance reporting

### ✅ Synchronization
- Mobile device monitoring
- Sync status tracking
- Success rate analytics
- Device health metrics

### ✅ Security
- Role-based access control
- Audit trail
- Session management
- Login attempt tracking

## 📂 File Locations

### User & Data Files
- Users: `src/auth/mockUsers.js`
- Sync Data: `src/auth/mockSync.js`
- IPC Data: `src/auth/mockIPCs.js`

### Admin Pages
- Dashboard: `src/app/dashboard/admin/page.jsx`
- Users: `src/app/dashboard/admin/users/page.jsx`
- Roles: `src/app/dashboard/admin/roles/page.jsx`
- Warehouse Mgmt: `src/app/dashboard/admin/warehouse-management/page.jsx`
- IPC Mgmt: `src/app/dashboard/admin/ipc-management/page.jsx`
- Sync Mgmt: `src/app/dashboard/admin/sync-management/page.jsx`
- Audit Logs: `src/app/dashboard/admin/audit-logs/page.jsx`
- Settings: `src/app/dashboard/admin/settings/page.jsx`

### Navigation
- Sidebar: `src/components/Sidebar.jsx` (RBAC filtering)

### Documentation
- Credentials: `CREDENTIALS.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`

## 🔄 Workflow Examples

### Admin Setup New IPC Manager
1. Login as admin
2. Go to `/dashboard/admin/users`
3. Click "Add User"
4. Fill form: Name, Email, Role: IPC Manager, IPC: Lilongwe
5. System generates temporary password
6. User receives email (mocked in current version)

### Monitor Sync Status
1. Login as admin
2. Go to `/dashboard/admin/sync-management`
3. View device status cards
4. Filter by sync status if needed
5. Check sync history for details
6. Identify failed syncs and retry

### Review System Activity
1. Login as admin
2. Go to `/dashboard/admin/audit-logs`
3. Search for specific events
4. Filter by action or severity
5. Export report if needed

### Configure System
1. Login as admin
2. Go to `/dashboard/admin/settings`
3. Toggle notifications
4. Configure security settings
5. Set backup frequency
6. Configure email
7. Click "Save Settings"

## 🚀 Running the Application

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000

# Go to login
http://localhost:3000/login

# Use test credentials from above
```

## 💡 Tips

1. **Test each role**: Login with different users to see RBAC in action
2. **Check sync status**: Admin dashboard shows real-time sync alerts
3. **Review audit logs**: See all system activities logged
4. **Test filters**: Use search and filters in all list views
5. **Try settings**: Configure system preferences as admin

## 📞 Support

### Documentation
- Full credentials: `CREDENTIALS.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Code comments: Check source files

### Common Issues
- Can't login? Check email/password in CREDENTIALS.md
- Can't see a module? Your role may not have access
- Data not showing? Try refreshing the page
- Need to reset? Clear localStorage with developer tools

## ✅ Checklist for Testing

- [ ] Login with all 4 user roles
- [ ] Verify sidebar shows correct modules per role
- [ ] Check Admin Dashboard displays key metrics
- [ ] Monitor Sync Management device status
- [ ] Review Audit Logs for system activities
- [ ] Test Settings configuration
- [ ] Filter sync history by status
- [ ] Search audit logs
- [ ] Verify RBAC restrictions work
- [ ] Test form validations
- [ ] Check responsive design (mobile view)

---

**System Status**: ✅ Ready for Development & Testing  
**Last Updated**: July 13, 2024  
**Version**: 1.0.0
