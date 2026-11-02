'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/apiClient';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('gtms_access_token');
    const storedUser = localStorage.getItem('gtms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
      // Re-verify session
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('gtms_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Token invalid
          localStorage.removeItem('gtms_access_token');
          localStorage.removeItem('gtms_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: loggedInUser } = res.data;

    localStorage.setItem('gtms_access_token', accessToken);
    localStorage.setItem('gtms_user', JSON.stringify(loggedInUser));

    setToken(accessToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('gtms_access_token');
    localStorage.removeItem('gtms_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const hasPermission = (moduleName, action = 'canRead') => {
    if (!user) return false;
    if (user.role?.code === 'SYSADMIN') return true;

    const permissions = user.role?.permissions || [];
    const modPerm = permissions.find((p) => p.moduleName === moduleName);
    return modPerm ? !!modPerm[action] : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
