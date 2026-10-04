"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';
import { AlertCircle, Check, KeyRound, ShieldCheck } from 'lucide-react';

export default function InvitePage({ params }) {
  const token = params.token;
  const [valid, setValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const specialCharacterCount = (password.match(/[^A-Za-z0-9\s]/g) || []).length;
  const passwordRules = [
    { label: 'At least 14 characters', met: password.length >= 14 },
    { label: 'No more than 34 characters', met: password.length > 0 && password.length <= 34 },
    { label: 'An uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'A lowercase letter', met: /[a-z]/.test(password) },
    { label: 'A number', met: /[0-9]/.test(password) },
    { label: '2 special characters (not spaces)', met: specialCharacterCount >= 2 },
  ];

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/invite/${token}`);
        if (!res.ok) throw new Error('Invalid token');
        const data = await res.json();
        setValid(true);
      } catch (err) {
        setValid(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const csrfRes = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
        credentials: 'include',
      });
      if (!csrfRes.ok) throw new Error('Could not initialize secure password setup. Please reload and try again.');
      const { csrfToken } = await csrfRes.json();
      if (!csrfToken) throw new Error('Could not initialize secure password setup. Please reload and try again.');

      const res = await fetch(`${API_BASE_URL}/auth/invite/${token}/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': csrfToken,
        },
        body: JSON.stringify({ password })
      });
      const responseText = await res.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { error: responseText };
      }
      if (!res.ok) {
        const message = data.error || data.message || `Request failed (HTTP ${res.status})`;
        if (message.toLowerCase().includes('something went wrong')) {
          throw new Error('The server could not save your password. Please try again. If it keeps failing, contact the administrator and ask them to check the backend logs.');
        }
        throw new Error(message);
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof TypeError
        ? 'Could not reach the server. Check your connection and try again.'
        : err.message || 'Could not set your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex flex-1 items-center justify-center bg-[#101713] p-8 text-sm text-emerald-100">Checking your invitation...</div>;
  if (!valid) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#101713] p-6 text-white">
        <div className="w-full max-w-md border border-white/10 bg-[#18211c] p-7">
          <AlertCircle className="mb-4 h-8 w-8 text-amber-300" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">Invitation unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">This link is invalid, expired, or has already been used. Please ask your administrator for a new invitation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#101713] px-4 py-12 text-white sm:px-6">
      <div className="w-full max-w-lg border border-white/10 bg-[#18211c] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-6 py-7 sm:px-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center border border-emerald-300/25 bg-emerald-300/10 text-emerald-200">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">IPMAIA WinterJam</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Finish setting up your account</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">Choose a secure password to activate your account. Your invitation can only be used once.</p>
        </div>
        <div className="px-6 py-6 sm:px-8">
        {success ? (
          <div className="flex gap-3 border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100" role="status">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
            <p>Password set successfully. Your account is ready; taking you to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-white/85">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                required
                className="w-full border border-white/15 bg-[#101713] px-3 py-3 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
                aria-describedby="password-guidance"
                aria-invalid={!!error}
              />
            </div>
            <div id="password-guidance" className="border border-white/10 bg-black/10 p-4">
              <p className="mb-3 text-sm font-medium text-white/85">Password requirements</p>
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {passwordRules.map(rule => (
                  <li key={rule.label} className={`flex items-center gap-2 ${rule.met ? 'text-emerald-200' : 'text-white/55'}`}>
                    <Check className={`h-4 w-4 shrink-0 ${rule.met ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true" />
                    <span>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            {error && <div className="flex gap-2 border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200" role="alert"><AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />{error}</div>}
            <button type="submit" disabled={submitting} className="w-full bg-emerald-300 px-4 py-3 font-semibold text-[#101713] transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-60">
              {submitting ? 'Setting password...' : 'Set password and continue'}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
