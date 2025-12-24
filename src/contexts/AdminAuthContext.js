"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

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

        // Try to fetch CSRF token for authenticated sessions (may be skipped in dev)
        try {
          const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/csrf-token`, { credentials: 'include' });
          if (tokenRes.ok) {
            const payload = await tokenRes.json();
            setCsrfToken(payload.csrfToken || null);
          } else {
            setCsrfToken(null);
          }
        } catch (tokenErr) {
          console.warn('Failed to fetch CSRF token:', tokenErr);
          setCsrfToken(null);
        }
      } else {
        setUser(null);
        setCsrfToken(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError(err.message);
      setUser(null);
      setCsrfToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to custom login page instead of directly to OIDC
    window.location.href = '/login';
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
      // Even if logout fails, clear local state and redirect
      setUser(null);
      window.location.href = '/';
    }
  };

  const handleApiResponse = async (response, operation = 'operation') => {
    if (response.status === 401) {
      // User session expired or invalid
      console.warn('🔐 Session expired or invalid, logging out...');
      setUser(null);
      // Redirect to login or show error
      if (typeof window !== 'undefined') {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/';
      }
      throw new Error('Authentication required');
    }

    if (response.status === 403) {
      // User doesn't have permission
      console.warn('🚫 Insufficient permissions for:', operation);
      throw new Error('You do not have permission to perform this action');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  };

  // Helper to perform API requests with CSRF header (when available) and consistent handling
  const apiFetch = async (url, options = {}, operation = 'operation') => {
    const method = (options.method || 'GET').toUpperCase();
    const opts = {
      credentials: 'include',
      headers: { ...(options.headers || {}) },
      ...options,
    };

    // Attach CSRF token for state-changing requests when available
    if (method !== 'GET' && csrfToken) {
      opts.headers['csrf-token'] = csrfToken;
    }

    const response = await fetch(url, opts);
    await handleApiResponse(response, operation);
    return response;
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
        handleApiResponse,
        apiFetch,
        csrfToken,
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
