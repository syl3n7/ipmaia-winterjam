"use client";

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminProtectedRoute({ children }) {
  const { user, loading, isAdmin, login } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // In development mode, bypass the redirect/login prompt
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    if (!loading && !isAdmin) {
      // Show login overlay or redirect
      const shouldLogin = confirm('You need to be an admin to access this page. Login now?');
      if (shouldLogin) {
        login();
      } else {
        router.push('/');
      }
    }
  }, [loading, isAdmin, login, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // In development mode, allow access anyway (auth bypass)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Bypassing admin check');
      return children;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">🔐 Admin Access Required</h1>
          <p className="text-gray-300 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={login}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🔑 Login with OIDC
          </button>
        </div>
      </div>
    );
  }

  return children;
}
