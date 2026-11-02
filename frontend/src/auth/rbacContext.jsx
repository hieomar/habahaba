"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { rolesService } from "@/lib/api/roles";

const RBACContext = createContext();

export function RBACProvider({ children }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await rolesService.list();
      setRoles(data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const getRoles = () => roles;

  const getRoleById = (id) => roles.find((r) => r.id === id) ?? null;

  const updateRole = useCallback(async (id, updates) => {
    try {
      const { data } = await rolesService.update(id, updates);
      setRoles((prev) => prev.map((r) => (r.id === id ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const createRole = useCallback(async (newRole) => {
    try {
      const { data } = await rolesService.create(newRole);
      setRoles((prev) => [...prev, data]);
      return { success: true, role: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteRole = useCallback(async (id) => {
    try {
      await rolesService.remove(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const toggleRoleStatus = useCallback(async (id) => {
    try {
      const { data } = await rolesService.toggleStatus(id);
      setRoles((prev) => prev.map((r) => (r.id === id ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const duplicateRole = useCallback(async (id) => {
    try {
      const { data } = await rolesService.duplicate(id);
      setRoles((prev) => [...prev, data]);
      return { success: true, role: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const resetPermissions = useCallback(async (id) => {
    try {
      const { data } = await rolesService.resetPermissions(id);
      setRoles((prev) => prev.map((r) => (r.id === id ? data : r)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const hasPermission = (role, module, action) => {
    if (!role?.permissions) return false;
    return role.permissions[module]?.[action] ?? false;
  };

  return (
    <RBACContext.Provider
      value={{
        roles,
        loading,
        error,
        refetch: fetchRoles,
        getRoles,
        getRoleById,
        updateRole,
        createRole,
        deleteRole,
        toggleRoleStatus,
        duplicateRole,
        resetPermissions,
        hasPermission,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}

export const useRBAC = () => useContext(RBACContext);
