"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/auth/authContext";
import { useNotifications } from "@/auth/notificationContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const THEME_KEY = "gtms-theme-preference";

function NotificationBell({ theme }) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) markAllRead();
  };

  const textStyle = theme === "dark" ? "#e2e8f0" : "#6b7280";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        style={{ color: textStyle, backgroundColor: "transparent" }}
        className="relative flex items-center justify-center h-8 w-8 hover:text-gray-700 dark:hover:text-slate-200 transition-colors rounded-lg flex-shrink-0"
        onMouseEnter={(e) => {
          if (theme === "dark") {
            e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.5)";
          } else {
            e.currentTarget.style.backgroundColor = "rgba(243, 244, 246, 0.7)";
          }
        }}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          {/* Boxicons v3.0.8 https://boxicons.com | License https://docs.boxicons.com/free */}
          <path d="M19 12.59V10c0-3.22-2.18-5.93-5.14-6.74C13.57 2.52 12.85 2 12 2s-1.56.52-1.86 1.26C7.18 4.08 5 6.79 5 10v2.59L3.29 14.3a1 1 0 0 0-.29.71v2c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-2c0-.27-.11-.52-.29-.71zM19 16H5v-.59l1.71-1.71a1 1 0 0 0 .29-.71v-3c0-2.76 2.24-5 5-5s5 2.24 5 5v3c0 .27.11.52.29.71L19 15.41zm-4.18 4H9.18c.41 1.17 1.51 2 2.82 2s2.41-.83 2.82-2"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <div 
        className={`absolute right-0 top-full mt-2 w-96 rounded-xl shadow-xl border z-50 overflow-hidden transition-all duration-200 origin-top-right ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          style={{
            backgroundColor: theme === "dark" ? "var(--surface-overlay)" : "var(--surface-card)",
            borderColor: theme === "dark" ? "var(--border-default)" : "var(--border-subtle)",
          }}
        >
          <div 
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{
              borderColor: theme === "dark" ? "var(--border-default)" : "var(--border-subtle)",
            }}
          >
            <h3 style={{ color: theme === "dark" ? "#f8fafc" : "#111827" }} className="text-sm font-bold">Notifications</h3>
            <span style={{ color: theme === "dark" ? "#94a3b8" : "#9ca3af" }} className="text-xs">All caught up</span>
          </div>

          <div 
            className="max-h-80 overflow-y-auto p-2 flex flex-col gap-0.5"
          >
            {notifications.slice(0, 3).map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-[var(--surface-hover)]"
              >
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.read ? (theme === "dark" ? "bg-slate-600" : "bg-gray-300") : "bg-[#1a5c2a]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p style={{ color: theme === "dark" ? "#f8fafc" : "#111827" }} className="text-[13px] font-semibold leading-tight">{n.title}</p>
                    <span 
                      style={{
                        backgroundColor: theme === "dark" ? "var(--surface-hover)" : "#f3f4f6",
                        color: theme === "dark" ? "#cbd5e1" : "#6b7280",
                      }}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                    >
                      {n.type}
                    </span>
                  </div>
                  <p style={{ color: theme === "dark" ? "#94a3b8" : "#6b7280" }} className="text-xs mt-0.5 line-clamp-2">{n.message}</p>
                  <p style={{ color: theme === "dark" ? "#64748b" : "#9ca3af" }} className="text-[11px] mt-1">{n.createdAt}</p>
                </div>
              </button>
            ))}
          </div>

          <div 
            className="border-t px-4 py-2.5"
            style={{
              borderColor: theme === "dark" ? "var(--border-default)" : "var(--border-subtle)",
            }}
          >
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-[#1a5c2a] hover:underline py-1"
            >
              View All Notifications
            </Link>
          </div>
        </div>
    </div>
  );
}

function ProfileMenu({ user, theme, onOpenProfile, onSignOut }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ color: theme === "dark" ? "#e2e8f0" : "#6b7280", backgroundColor: "transparent" }}
        className="relative flex items-center justify-center h-8 w-8 hover:text-gray-700 dark:hover:text-slate-200 transition-colors rounded-lg flex-shrink-0"
        onMouseEnter={(e) => {
          if (theme === "dark") {
            e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.5)";
          } else {
            e.currentTarget.style.backgroundColor = "rgba(243, 244, 246, 0.7)";
          }
        }}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          {/* Boxicons v3.0.8 https://boxicons.com | License https://docs.boxicons.com/free */}
          <path d="M12 6c-2.28 0-4 1.72-4 4s1.72 4 4 4 4-1.72 4-4-1.72-4-4-4m0 6c-1.18 0-2-.82-2-2s.82-2 2-2 2 .82 2 2-.82 2-2 2"></path><path d="M12 2C6.49 2 2 6.49 2 12c0 3.26 1.58 6.16 4 7.98V20h.03c1.67 1.25 3.73 2 5.97 2s4.31-.75 5.97-2H18v-.02c2.42-1.83 4-4.72 4-7.98 0-5.51-4.49-10-10-10M8.18 19.02C8.59 17.85 9.69 17 11 17h2c1.31 0 2.42.85 2.82 2.02-1.14.62-2.44.98-3.82.98s-2.69-.35-3.82-.98m9.3-1.21c-.81-1.66-2.51-2.82-4.48-2.82h-2c-1.97 0-3.66 1.16-4.48 2.82A7.96 7.96 0 0 1 4 11.99c0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.29-.97 4.36-2.52 5.82"></path>
        </svg>
      </button>

      {open && (
        <div 
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border p-2 shadow-xl z-50" 
          role="menu"
          style={{
            borderColor: theme === "dark" ? "#475569" : "#e5e7eb",
            backgroundColor: theme === "dark" ? "var(--surface-overlay)" : "var(--surface-card)",
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setConfirmOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(153, 27, 27, 0.3)" : "#fef2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              {/* Boxicons v3.0.8 https://boxicons.com | License https://docs.boxicons.com/free */}
              <path d="m14.29 6.71 4.3 4.29H9v2h9.59l-4.3 4.29 1.42 1.42 6.7-6.71-6.7-6.71z"></path>
              <path d="M11 5V3c-4.96 0-9 4.04-9 9s4.04 9 9 9v-2c-3.86 0-7-3.14-7-7s3.14-7 7-7"></path>
            </svg>
            Sign Out
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/profile");
            }}
            style={{
              color: theme === "dark" ? "#cbd5e1" : "#374151",
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme === "dark" ? "var(--surface-hover)" : "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            View Profile
          </button>

        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
              borderColor: theme === "dark" ? "var(--border-default)" : "var(--border-default)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: theme === "dark" ? "#f8fafc" : "#111827" }}>
                  Sign out of your account?
                </h3>
                <p className="mt-1 text-sm" style={{ color: theme === "dark" ? "#cbd5e1" : "#6b7280" }}>
                  You’ll need to sign in again to continue using the dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                style={{
                  borderColor: theme === "dark" ? "#475569" : "#e5e7eb",
                  color: theme === "dark" ? "#e2e8f0" : "#374151",
                  backgroundColor: theme === "dark" ? "var(--surface-overlay)" : "var(--surface-card)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  onSignOut();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileModal({ open, user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "+265 999 000 001",
        avatar: user.avatar || "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      setMessage("");
    }
  }, [open, user]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.phone.trim()) nextErrors.phone = "Phone number is required";
    if (formData.password && formData.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (formData.password && formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      avatar: formData.avatar.trim(),
      password: formData.password || undefined,
    });
    setMessage("Profile updated successfully.");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Profile & Account Settings</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Manage personal information, assigned IPC location, and security credentials.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 max-h-[80vh] overflow-y-auto">
          {/* User Profile Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/80 p-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a5c2a] text-xl font-bold text-white flex-shrink-0">
              {(formData.name || user?.name || "U")
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 dark:text-white truncate">{user?.name || "User Account"}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email || ""}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] font-semibold text-[#1a5c2a] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {user?.role ?? user?.roleId ?? "System Administrator"}
                </span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">
                  IPC: {user?.assignedIPC ?? "National Head Office"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200">Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-[#1a5c2a]" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200">Email Address</label>
              <input name="email" type="email" value={formData.email} disabled className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-[#1a5c2a]" />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200">Assigned Location / IPC</label>
              <input value={user?.assignedIPC ?? "National Head Office"} disabled className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-400 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-3">Change Password</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200">New Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-[#1a5c2a]" />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200">Confirm New Password</label>
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-[#1a5c2a]" />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {message && <p className="text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg">{message}</p>}

          <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-slate-700 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[#1a5c2a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { user, loading, updateUser, logout } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileMode, setProfileMode] = useState("profile");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Initialize theme from localStorage on mount, default to light
  useEffect(() => {
    // Force light mode by default - clear any dark mode preference
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    
    // Remove dark class immediately to prevent dark flicker
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    document.documentElement.style.backgroundColor = "#ffffff";
    
    if (storedTheme === "dark") {
      setTheme("dark");
    } else {
      setTheme("light");
      // Clear localStorage to reset any bad state
      window.localStorage.removeItem(THEME_KEY);
    }
  }, []);

  // Apply theme to document whenever it changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const handleOpenProfile = (mode) => {
    setProfileMode(mode);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = (values) => {
    const updatePayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      avatar: values.avatar || null,
    };

    if (values.password) {
      updatePayload.password = values.password;
    }

    updateUser(updatePayload);
  };

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div 
        className="flex h-screen items-center justify-center bg-white dark:bg-black"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-[3px] border-[#1a5c2a] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: theme === "dark" ? "var(--surface-page)" : "var(--surface-page)" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header 
          className="h-14 flex items-center px-6 flex-shrink-0"
          style={{ backgroundColor: theme === "dark" ? "var(--surface-header)" : "var(--surface-page)" }}
        >
          <div className="relative w-full max-w-sm flex-shrink-0">
            <svg 
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" 
              fill="none" 
              stroke="currentColor" 
              style={{ color: theme === "dark" ? "#94a3b8" : "#9ca3af" }}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              style={{
                backgroundColor: theme === "dark" ? "var(--surface-input)" : "var(--surface-input)",
                color: theme === "dark" ? "#e2e8f0" : "#111827",
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:ring-0 focus:outline-none rounded-lg text-sm transition-all"
            />
          </div>

          <div className="flex-1 flex justify-end items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                color: theme === "dark" ? "#94a3b8" : "#9ca3af",
              }}
              className="rounded-lg flex items-center justify-center h-8 w-8 transition-colors flex-shrink-0"
              onMouseEnter={(e) => {
                if (theme === "dark") {
                  e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.5)";
                  e.currentTarget.style.color = "#cbd5e1";
                } else {
                  e.currentTarget.style.backgroundColor = "rgba(243, 244, 246, 0.7)";
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = theme === "dark" ? "#94a3b8" : "#9ca3af";
              }}
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  {/* Boxicons v3.0.8 https://boxicons.com | License https://docs.boxicons.com/free */}
                  <path d="M12 17.01c2.76 0 5.01-2.25 5.01-5.01S14.76 6.99 12 6.99 6.99 9.24 6.99 12s2.25 5.01 5.01 5.01M12 9c1.66 0 3.01 1.35 3.01 3.01s-1.35 3.01-3.01 3.01-3.01-1.35-3.01-3.01S10.34 9 12 9m1 10h-2v3h2zm0-17h-2v3h2zM2 11h3v2H2zm17 0h3v2h-3zM4.22 18.36l.71.71.71.71 1.06-1.06 1.06-1.06-.71-.71-.71-.71-1.06 1.06zM19.78 5.64l-.71-.71-.71-.71-1.06 1.06-1.06 1.06.71.71.71.71 1.06-1.06zm-12.02.7L6.7 5.28 5.64 4.22l-.71.71-.71.71L5.28 6.7l1.06 1.06.71-.71zm8.48 11.32 1.06 1.06 1.06 1.06.71-.71.71-.71-1.06-1.06-1.06-1.06-.71.71z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  {/* Boxicons v3.0.8 https://boxicons.com | License https://docs.boxicons.com/free */}
                  <path d="M20.71 13.51c-.78.23-1.58.35-2.38.35-4.52 0-8.2-3.68-8.2-8.2 0-.8.12-1.6.35-2.38.11-.35.01-.74-.25-1s-.64-.36-1-.25A10.17 10.17 0 0 0 2 11.8C2 17.42 6.57 22 12.2 22c4.53 0 8.45-2.91 9.76-7.24.11-.35.01-.74-.25-1s-.64-.36-1-.25M12.2 20C7.68 20 4 16.32 4 11.8a8.15 8.15 0 0 1 4.18-7.15c-.03.34-.05.68-.05 1.02 0 5.62 4.57 10.2 10.2 10.2.34 0 .68-.02 1.02-.05C17.93 18.38 15.23 20 12.2 20M16 8l.94-2.06L19 5l-2.06-.94L16 2l-.94 2.06L13 5l2.06.94zm4.25-.5-.55 1.2-1.2.55 1.2.55.55 1.2.55-1.2 1.2-.55-1.2-.55z"></path>
                </svg>
              )}
            </button>
            <NotificationBell theme={theme} />
            <ProfileMenu user={user} theme={theme} onOpenProfile={handleOpenProfile} onSignOut={handleSignOut} />
          </div>
        </header>

        <main 
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: theme === "dark" ? "var(--surface-page)" : "var(--surface-page)" }}
        >
          {children}
        </main>
      </div>

      <ProfileModal
        open={profileModalOpen}
        user={user}
        onClose={() => setProfileModalOpen(false)}
        onSave={(values) => {
          handleSaveProfile(values);
          setProfileModalOpen(false);
        }}
      />
    </div>
  );
}
