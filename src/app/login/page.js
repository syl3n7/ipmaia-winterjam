"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin } = useAdminAuth();

  const returnUrl = searchParams.get('returnUrl') || '/admin';

  useEffect(() => {
    // If already authenticated and admin, redirect
    if (user && isAdmin) {
      router.push(returnUrl);
    }
  }, [user, isAdmin, router, returnUrl]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Redirect to OIDC login endpoint with return URL
      const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/oidc/login${returnUrl !== '/admin' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;
      window.location.href = loginUrl;
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-300">Access the WinterJam administration panel</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-300 text-sm mb-4">
              You&apos;ll be redirected to PocketID for secure authentication
            </p>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login with PocketID
                </div>
              )}
            </button>
          </div>

          {/* Info Section */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">What happens next?</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• You&apos;ll be redirected to PocketID</li>
              <li>• Sign in with your institutional account</li>
              <li>• Return here with admin access</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to WinterJam
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}