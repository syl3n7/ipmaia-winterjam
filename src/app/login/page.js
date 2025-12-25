"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin } = useAdminAuth();
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const returnUrl = searchParams.get('returnUrl') || '/admin';

  useEffect(() => {
    // If already authenticated and admin, redirect
    if (user && isAdmin) {
      router.push(returnUrl);
    }

    // Check public registration status and hide register option if disabled
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/registration-status`);
        if (res.ok) {
          const payload = await res.json();
          setRegistrationEnabled(payload.enabled);
        }
      } catch (err) {
        console.warn('Failed to fetch registration status:', err);
      }
    })();
  }, [user, isAdmin, router, returnUrl]);



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

          {/* Isolated Auth Form */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2">Login / Register</h3>
            <IsolatedAuthForm returnUrl={returnUrl} registrationEnabled={registrationEnabled} />
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

function IsolatedAuthForm({ returnUrl, registrationEnabled }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { checkAuth } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/isolated/login' : '/auth/isolated/register';
      const body = mode === 'login'
        ? { username, password }
        : { username, email, password };
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      if (data.token) {
        // Token is returned for compatibility but sessions are the primary auth mechanism
        await checkAuth();
        router.push(returnUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2 mb-2">
        <button type="button" className={`px-3 py-1 rounded ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setMode('login')}>Login</button>
        {registrationEnabled && (
          <button type="button" className={`px-3 py-1 rounded ${mode === 'register' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setMode('register')}>Register</button>
        )}
      </div>
      <input
        type="text"
        className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      {mode === 'register' && (
        <input
          type="email"
          className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      )}
      <input
        type="password"
        className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        disabled={loading}
      >
        {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
      </button>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
    </form>
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