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
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [loading, isAdmin, router]);

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

    // Show loading screen while redirecting to login
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return children;
}
