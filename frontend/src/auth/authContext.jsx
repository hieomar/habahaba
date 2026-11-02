"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/lib/api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("gtms_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    authService
      .me()
      .then((res) => {
        const currentUser = res.data?.user || res.user || res.data;
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("gtms_user", JSON.stringify(currentUser));
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("gtms_access_token");
        localStorage.removeItem("gtms_user");
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Login — credentials sent to /api/v1/auth/login.
   */
  const login = useCallback(async (email, password) => {
    try {
      const res = await authService.login(email, password);
      const data = res.data || res;
      const accessToken = data.accessToken;
      const loggedInUser = data.user;

      if (accessToken) {
        localStorage.setItem("gtms_access_token", accessToken);
      }
      if (loggedInUser) {
        localStorage.setItem("gtms_user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      return { success: true, user: loggedInUser };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Invalid email or password.",
      };
    }
  }, []);

  /**
   * Logout — clears tokens and session
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("gtms_access_token");
      localStorage.removeItem("gtms_user");
      setUser(null);
    }
  }, []);

  /**
   * Change password via /api/v1/auth/change-password.
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message ?? "Password change failed." };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
