"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // In development mode, the backend returns a dev user even without auth
        // If we get a 401 in development, try again (backend might be bypassing auth)
        if (process.env.NODE_ENV === 'development') {
          // Set a dev user for local development
          setUser({
            id: 1,
            username: 'dev-admin',
            role: 'super_admin'
          });
          console.log('🔧 Development mode: Using dev admin user');
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError(err.message);
      // In development mode with network errors, still allow access
      if (process.env.NODE_ENV === 'development') {
        setUser({
          id: 1,
          username: 'dev-admin',
          role: 'super_admin'
        });
        console.log('🔧 Development mode: Using dev admin user (fallback)');
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oidc/login`;
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const isSuperAdmin = user && user.role === 'super_admin';

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin,
        isSuperAdmin,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
