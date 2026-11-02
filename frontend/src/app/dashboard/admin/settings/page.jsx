"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/authContext";

const ModuleIcons = {
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  roles: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  warehouse: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  ipc: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  sync: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  audit: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  chevron: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
};

const ADMIN_MODULES = [
  { icon: ModuleIcons.users, title: "User Management", description: "Manage system users and account access.", href: "/dashboard/admin/users" },
  { icon: ModuleIcons.roles, title: "Roles & Permissions", description: "Define roles and control access across the platform.", href: "/dashboard/admin/roles" },
  { icon: ModuleIcons.warehouse, title: "Warehouse Management", description: "Configure warehouse locations and capacity.", href: "/dashboard/admin/warehouse-management" },
  { icon: ModuleIcons.ipc, title: "IPC Management", description: "Register and manage IPC master records.", href: "/dashboard/admin/ipc-management" },
  { icon: ModuleIcons.sync, title: "Sync Management", description: "Monitor mobile device synchronization.", href: "/dashboard/admin/sync-management" },
  { icon: ModuleIcons.audit, title: "Audit Logs", description: "Review system events and security alerts.", href: "/dashboard/admin/audit-logs" },
];

const Icons = {
  save: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  bell: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  lock: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  mail: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  server: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>,
  key: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  eye: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  eyeOff: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
};

function SettingsSection({ icon, title, description, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="text-gray-500">{icon}</div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-6 py-2 divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? "bg-[#1a5c2a]" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <div className="py-3.5">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white"
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div className="py-3.5">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white"
      />
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="py-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative w-full max-w-xs">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pr-10 px-3 py-2 text-sm border rounded-lg outline-none focus:border-[#1a5c2a] bg-white transition-colors ${error ? "border-red-400" : "border-gray-200"}`}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? Icons.eyeOff : Icons.eye}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const DEFAULTS = {
  emailAlerts: true, syncNotifications: true, userActivityAlerts: true, weeklyReports: true,
  maxLoginAttempts: "5", sessionTimeout: "30", backupFrequency: "daily",
  emailServer: "smtp.nasfam.org", emailPort: "587", fromEmail: "admin@nasfam.org",
};

export default function SettingsPage() {
  const router = useRouter();
  const { changePassword } = useAuth();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [syncNotifications, setSyncNotifications] = useState(true);
  const [userActivityAlerts, setUserActivityAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [emailServer, setEmailServer] = useState("smtp.nasfam.org");
  const [emailPort, setEmailPort] = useState("587");
  const [fromEmail, setFromEmail] = useState("admin@nasfam.org");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = () => {
    setSaved(true);
    showToast("System settings saved successfully.");
    setTimeout(() => setSaved(false), 3500);
  };

  const handleResetDefaults = () => {
    if (!window.confirm("Reset all settings to their defaults?")) return;
    setEmailAlerts(DEFAULTS.emailAlerts);
    setSyncNotifications(DEFAULTS.syncNotifications);
    setUserActivityAlerts(DEFAULTS.userActivityAlerts);
    setWeeklyReports(DEFAULTS.weeklyReports);
    setMaxLoginAttempts(DEFAULTS.maxLoginAttempts);
    setSessionTimeout(DEFAULTS.sessionTimeout);
    setBackupFrequency(DEFAULTS.backupFrequency);
    setEmailServer(DEFAULTS.emailServer);
    setEmailPort(DEFAULTS.emailPort);
    setFromEmail(DEFAULTS.fromEmail);
    showToast("Settings reset to defaults.");
  };

  const handleChangePassword = async () => {
    const errs = {};
    if (!currentPassword) errs.currentPassword = "Enter your current password.";
    if (!newPassword) errs.newPassword = "Enter a new password.";
    else if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters.";
    if (!confirmPassword) errs.confirmPassword = "Confirm your new password.";
    else if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setPwSaving(false);

    if (!result.success) {
      setPwErrors({ currentPassword: result.error ?? "Password change failed." });
      return;
    }

    setPwErrors({});
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwSaved(true);
    showToast("Password changed successfully.");
    setTimeout(() => setPwSaved(false), 4000);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1000px] mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-md shadow-lg text-sm font-semibold text-white ${toast.type === "error" ? "bg-red-600" : "bg-gray-900"}`}>
          {toast.msg}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 flex items-center gap-3">
          <div className="text-green-600 flex-shrink-0">{Icons.save}</div>
          <div>
            <p className="text-sm font-semibold text-green-900">Settings Saved</p>
            <p className="text-xs text-green-700">Your changes have been applied.</p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Administration</p>
        <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure system-wide preferences, security, and integrations.</p>
      </div>



      {/* Change Password */}
      <SettingsSection icon={Icons.key} title="Change Password" description="Update your account password">
        {pwSaved && (
          <div className="mt-2.5 mb-1 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <div className="text-green-600 flex-shrink-0">{Icons.save}</div>
            <p className="text-xs text-green-800 font-semibold">Password changed successfully.</p>
          </div>
        )}
        <PasswordInput label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" error={pwErrors.currentPassword} />
        <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" error={pwErrors.newPassword} />
        <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter new password" error={pwErrors.confirmPassword} />
        <div className="py-3">
          <button
            onClick={handleChangePassword}
            disabled={pwSaving}
            className="flex items-center gap-1.5 bg-[#1a5c2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#134520] transition-colors disabled:opacity-60"
          >
            {Icons.key}
            {pwSaving ? "Changing…" : "Change Password"}
          </button>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={Icons.bell} title="Notifications" description="Manage system notifications and alerts">
        <ToggleSwitch label="Email Alerts" description="Receive important alerts via email" checked={emailAlerts} onChange={setEmailAlerts} />
        <ToggleSwitch label="Sync Notifications" description="Notify on mobile device synchronization events" checked={syncNotifications} onChange={setSyncNotifications} />
        <ToggleSwitch label="User Activity Alerts" description="Alert on suspicious user activities" checked={userActivityAlerts} onChange={setUserActivityAlerts} />
        <ToggleSwitch label="Weekly Reports" description="Send weekly system health reports" checked={weeklyReports} onChange={setWeeklyReports} />
      </SettingsSection>

      {/* Security */}
      <SettingsSection icon={Icons.lock} title="Security" description="Configure security policies and access controls">
        <SelectInput
          label="Maximum Login Attempts"
          value={maxLoginAttempts}
          options={[{ value: "3", label: "3 Attempts" }, { value: "5", label: "5 Attempts" }, { value: "10", label: "10 Attempts" }]}
          onChange={setMaxLoginAttempts}
        />
        <SelectInput
          label="Session Timeout (minutes)"
          value={sessionTimeout}
          options={[{ value: "15", label: "15 Minutes" }, { value: "30", label: "30 Minutes" }, { value: "60", label: "1 Hour" }, { value: "120", label: "2 Hours" }]}
          onChange={setSessionTimeout}
        />
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection icon={Icons.server} title="Data Management" description="Configure backups and data retention">
        <SelectInput
          label="Backup Frequency"
          value={backupFrequency}
          options={[{ value: "hourly", label: "Every Hour" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }]}
          onChange={setBackupFrequency}
        />
      </SettingsSection>

      {/* Email Configuration */}
      <SettingsSection icon={Icons.mail} title="Email Configuration" description="Configure SMTP settings for system emails">
        <TextInput label="SMTP Server" value={emailServer} onChange={setEmailServer} placeholder="smtp.example.com" />
        <TextInput label="SMTP Port" value={emailPort} onChange={setEmailPort} placeholder="587" />
        <TextInput label="From Email Address" value={fromEmail} onChange={setFromEmail} placeholder="noreply@example.com" />
      </SettingsSection>

      <div className="flex items-center gap-2.5 pt-2">
        <button onClick={handleSave} className="flex items-center gap-1.5 bg-[#1a5c2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#134520] transition-colors">
          {Icons.save} Save Settings
        </button>
        <button onClick={handleResetDefaults} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Reset to Defaults
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">Note:</span> Some settings (SMTP, session timeout, security policies) will take effect once saved to the backend. Connect <code className="font-mono">BACKEND_API_URL</code> to persist these values.
        </p>
      </div>
    </div>
  );
}
