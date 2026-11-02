# NASFAM GTMS — System User Credentials

## Overview
This document contains all dummy user credentials created for testing the GTMS web application. Each user represents a different role with specific access levels and capabilities.

---

## System Administrator

| Field | Value |
|-------|-------|
| **Name** | System Administrator |
| **Email** | admin@nasfam.org |
| **Password** | Admin@123 |
| **Phone** | +265 999 000 001 |
| **Role** | System Administrator |
| **User ID** | usr-001 |

### Access
- ✅ Full system access
- ✅ User management
- ✅ Role management
- ✅ System settings
- ✅ Audit logs
- ✅ All operational modules

### Dashboard
- Comprehensive system health overview
- User and role statistics
- Sync monitoring
- System alerts and operations center

---

## Warehouse Officers

### Warehouse Officer - Lilongwe

| Field | Value |
|-------|-------|
| **Name** | Warehouse Officer - Lilongwe |
| **Email** | warehouse.lilongwe@nasfam.org |
| **Password** | Warehouse@123 |
| **Phone** | +265 999 000 002 |
| **Role** | Warehouse Officer |
| **Assigned IPC** | Lilongwe IPC |
| **User ID** | usr-002 |

### Warehouse Officer - Mchinji

| Field | Value |
|-------|-------|
| **Name** | Warehouse Officer - Mchinji |
| **Email** | warehouse.mchinji@nasfam.org |
| **Password** | Warehouse@123 |
| **Phone** | +265 999 000 003 |
| **Role** | Warehouse Officer |
| **Assigned IPC** | Mchinji IPC |
| **User ID** | usr-003 |

### Access
- ✅ Warehouse management
- ✅ Inventory tracking
- ✅ Stock updates
- ✅ Deliveries tracking
- ✅ Reports
- ✅ Traceability (view only)

### Restricted
- ❌ User management
- ❌ System settings
- ❌ Role management

---

## IPC Managers

### IPC Manager - Lilongwe

| Field | Value |
|-------|-------|
| **Name** | IPC Manager - Lilongwe |
| **Email** | ipc.lilongwe@nasfam.org |
| **Password** | IPCManager@123 |
| **Phone** | +265 999 000 004 |
| **Role** | IPC Manager |
| **Assigned IPC** | Lilongwe IPC |
| **User ID** | usr-004 |

### IPC Manager - Mchinji

| Field | Value |
|-------|-------|
| **Name** | IPC Manager - Mchinji |
| **Email** | ipc.mchinji@nasfam.org |
| **Password** | IPCManager@123 |
| **Phone** | +265 999 000 005 |
| **Role** | IPC Manager |
| **Assigned IPC** | Mchinji IPC |
| **User ID** | usr-005 |

### IPC Manager - Kasungu

| Field | Value |
|-------|-------|
| **Name** | IPC Manager - Kasungu |
| **Email** | ipc.kasungu@nasfam.org |
| **Password** | IPCManager@123 |
| **Phone** | +265 999 000 006 |
| **Role** | IPC Manager |
| **Assigned IPC** | Kasungu IPC |
| **User ID** | usr-006 |

### Access
- ✅ Farmer management
- ✅ Purchasing records
- ✅ Warehouse monitoring
- ✅ Inventory management
- ✅ Reports and analytics
- ✅ Traceability
- ✅ Notifications

### Restricted
- ❌ User management
- ❌ System settings
- ❌ Role management

---

## Head Office Manager

| Field | Value |
|-------|-------|
| **Name** | Head Office Manager |
| **Email** | headoffice@nasfam.org |
| **Password** | HeadOffice@123 |
| **Phone** | +265 999 000 007 |
| **Role** | Head Office Manager |
| **User ID** | usr-007 |

### Access
- ✅ National statistics
- ✅ All IPC reports
- ✅ Farmer management
- ✅ Purchasing analytics
- ✅ Warehouse monitoring
- ✅ Reports
- ✅ Analytics
- ✅ Traceability

### Restricted
- ❌ User management
- ❌ System settings
- ❌ Role management
- ❌ Warehouse operations (no direct access)

---

## Testing Guide

### 1. Login with Each Role

**Step 1: Go to Login Page**
- Navigate to `/login`

**Step 2: Enter Credentials**
- Select a user from the list above
- Enter email and password

**Step 3: Observe Role-Specific Dashboard**
- Each role will see a different dashboard
- Navigation sidebar will show only accessible modules

### 2. Role-Based Access Testing

#### System Administrator
1. Login with admin@nasfam.org / Admin@123
2. Verify you can access:
   - Administration dashboard
   - User Management
   - Roles & Permissions
   - Warehouse Management
   - IPC Management
   - Sync Management
   - Audit Logs
   - System Settings
3. Create test users and assign different roles

#### Warehouse Officer
1. Login with warehouse.lilongwe@nasfam.org / Warehouse@123
2. Verify sidebar shows only:
   - Dashboard
   - Warehouse
   - Traceability
   - Reports
3. Try accessing /dashboard/admin (should show limited access)

#### IPC Manager
1. Login with ipc.lilongwe@nasfam.org / IPCManager@123
2. Verify sidebar shows:
   - Dashboard
   - Farmers
   - Purchasing
   - Warehouse
   - Traceability
   - Reports
   - Analytics
3. Verify can only see Lilongwe IPC data

#### Head Office Manager
1. Login with headoffice@nasfam.org / HeadOffice@123
2. Verify access to:
   - All IPC reports
   - National statistics
   - All farmer data
   - System-wide analytics

### 3. Sync Management Testing

**Navigate to Sync Management:**
- Admin: `/dashboard/admin/sync-management`
- Monitor mobile device synchronization status
- Review sync history and device health

### 4. Audit Logs Testing

**Navigate to Audit Logs:**
- Admin: `/dashboard/admin/audit-logs`
- Filter by user, action, and severity
- Verify all system activities are logged

### 5. System Settings Testing

**Navigate to Settings:**
- Admin: `/dashboard/admin/settings`
- Test notification preferences
- Test security settings (max login attempts, session timeout)
- Test email configuration

---

## Quick Access Links

### Admin Dashboard
- URL: `/dashboard/admin`
- Email: admin@nasfam.org
- Password: Admin@123

### Warehouse Dashboard
- URL: `/dashboard` (after login as warehouse officer)
- Email: warehouse.lilongwe@nasfam.org
- Password: Warehouse@123

### IPC Dashboard
- URL: `/dashboard` (after login as IPC manager)
- Email: ipc.lilongwe@nasfam.org
- Password: IPCManager@123

### Head Office Dashboard
- URL: `/dashboard` (after login as head office manager)
- Email: headoffice@nasfam.org
- Password: HeadOffice@123

---

## Features by Role

### System Administrator Features
| Feature | Access |
|---------|--------|
| User Management | ✅ Full (Create, Edit, Delete, Reset Password) |
| Role Management | ✅ Full (Create, Edit, Delete Roles) |
| Warehouse Management | ✅ View & Manage All |
| IPC Management | ✅ View & Manage All |
| Sync Monitoring | ✅ Full (Device Status, History, Metrics) |
| Audit Logs | ✅ Full (View All Logs, Filter, Export) |
| System Settings | ✅ Full (Configure All Settings) |
| Dashboard | ✅ System Overview |

### Warehouse Officer Features
| Feature | Access |
|---------|--------|
| Inventory | ✅ View & Update |
| Warehouse Operations | ✅ Full (Own warehouse) |
| Stock Management | ✅ Create & Edit |
| Deliveries | ✅ Track & Update |
| Reports | ✅ View (Own IPC) |
| Traceability | ✅ View Only |

### IPC Manager Features
| Feature | Access |
|---------|--------|
| Farmer Management | ✅ View & Export |
| Purchasing | ✅ View & Export |
| Warehouse | ✅ View & Export (Own IPC) |
| Inventory | ✅ View & Export |
| Reports | ✅ Create & Export |
| Analytics | ✅ View & Export |
| Traceability | ✅ View & Export |

### Head Office Manager Features
| Feature | Access |
|---------|--------|
| National Statistics | ✅ View All IPCs |
| Reports | ✅ Create & Export (All) |
| IPC Comparison | ✅ Performance Metrics |
| Farmer Statistics | ✅ National Overview |
| Analytics | ✅ System-wide Reports |
| Traceability | ✅ National Overview |

---

## Security Notes

1. **Change Passwords**: These are dummy credentials for development/testing only. Change all passwords before production deployment.

2. **Access Control**: The system uses role-based access control (RBAC). Some features are restricted based on role.

3. **Audit Trail**: All user actions are logged in the Audit Logs section. Admin can review all activities.

4. **Session Timeout**: Sessions timeout after 30 minutes of inactivity (configurable in Settings).

5. **Failed Login Attempts**: After 5 failed login attempts, the account is temporarily locked.

---

## Synchronization Monitoring Data

The system includes mock synchronization data for testing:

- **3 Mobile Devices**: Configured with different sync statuses
- **Sync History**: 10 recent synchronization events
- **Device Status**: Battery, connectivity, and upload metrics
- **Success Rate**: 98.2% overall synchronization success

**Access Sync Management:**
- Login as admin@nasfam.org
- Navigate to Administration > Sync Management
- Monitor device status and sync history

---

## Support & Troubleshooting

### Can't Login?
- Verify email and password are correct
- Check caps lock
- Ensure you're on the correct URL: `/login`

### Can't See a Module?
- It may be restricted by your role
- Login as admin to see all modules
- Check the features table above for your role

### Sync Data Not Showing?
- Sync Management is admin-only
- Login as admin@nasfam.org
- Navigate to Administration > Sync Management

### Need to Reset?
- Clear browser cookies
- Clear localStorage: `localStorage.clear()`
- Refresh the page

---

## Last Updated
- **Date**: July 13, 2024
- **System Version**: 1.0.0
- **Environment**: Development/Testing
