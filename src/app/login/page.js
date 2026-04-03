"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin } = useAdminAuth();
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const returnUrl = searchParams.get('returnUrl') || '/admin';

  useEffect(() => {
    if (user && isAdmin) {
      router.push(returnUrl);
    }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-blue-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Card */}
        <div className="bg-white/8 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/15 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Admin Login</h1>
            <p className="text-slate-400 text-sm">WinterJam administration panel</p>
          </div>

          {/* Auth Form */}
          <IsolatedAuthForm returnUrl={returnUrl} registrationEnabled={registrationEnabled} />

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors duration-200 group"
            >
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to WinterJam
            </button>
          </div>
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [notice, setNotice] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAdminAuth();

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setErrorCode('');
    setNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorCode('');
    setNotice('');
    try {
      const endpoint = mode === 'login' ? '/auth/isolated/login' : '/auth/isolated/register';
      const body = mode === 'login'
        ? { username, password }
        : { username, email, password };
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorCode(data.code || '');
        throw new Error(data.error || 'Authentication failed');
      }
      if (mode === 'register' && data.verificationPending) {
        setNotice('Registration successful! Please check your email and click the verification link before logging in.');
        setMode('login');
        setPassword('');
        return;
      }
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

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendDone(false);
    try {
      await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
    } catch {
      // Ignore errors — the endpoint always returns a generic message
    } finally {
      setResendLoading(false);
      setResendDone(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode switcher — always rendered to preserve layout; invisible when registration is off */}
      <div className={registrationEnabled ? '' : 'invisible'} aria-hidden={!registrationEnabled}>
        <div className="flex border-b border-white/10 mb-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-colors duration-200 relative focus:outline-none ${
              mode === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
            <span className={`absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-opacity duration-300 ${
              mode === 'login' ? 'opacity-100' : 'opacity-0'
            }`} />
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-colors duration-200 relative focus:outline-none ${
              mode === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Register
            <span className={`absolute bottom-0 inset-x-0 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-opacity duration-300 ${
              mode === 'register' ? 'opacity-100' : 'opacity-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Success notice */}
      {notice && (
        <div className="flex gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4">
          <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-emerald-300 text-sm">{notice}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex gap-3 bg-red-500/15 border border-red-500/30 rounded-xl p-4">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-red-300 text-sm">{error}</p>
            {errorCode === 'EMAIL_NOT_VERIFIED' && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || resendDone}
                className="mt-2 text-xs text-red-400 underline hover:text-red-200 transition-colors disabled:opacity-60"
              >
                {resendDone ? 'Verification email sent!' : resendLoading ? 'Sending...' : 'Resend verification email'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Username field */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-slate-300">
          Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition-all duration-200 text-sm"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Email field — register only */}
      {mode === 'register' && (
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition-all duration-200 text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      {/* Password field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition-all duration-200 text-sm"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(v => !v)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors duration-200"
          >
            {showPassword ? (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {mode === 'login' ? 'Signing in…' : 'Registering…'}
          </span>
        ) : (
          mode === 'login' ? 'Sign In' : 'Create Account'
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}