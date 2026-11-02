"use client";

import { useState } from "react";
import { useAuth } from "@/auth/authContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "+265 999 000 001",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setMessage({ type: "success", text: "Profile details updated successfully! (Mock)" });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your personal details, passwords, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#1a5c2a] text-white text-2xl font-bold flex items-center justify-center mx-auto">
            {user?.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name ?? "User"}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email ?? ""}</p>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-[#2a2a2a] text-left space-y-2">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Role</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{user?.role ?? "System Administrator"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assigned IPC</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{user?.assignedIPC ?? "National Head Office"}</p>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Edit Profile & Credentials</h3>

          {message && (
            <div className={`p-4 rounded-lg text-xs font-semibold mb-4 ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-gray-50 dark:bg-[#222] text-gray-400 focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-[#2a2a2a]">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">Change Account Password</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a5c2a] text-white rounded-lg text-sm font-semibold hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
