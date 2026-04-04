"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';

export default function InvitePage({ params }) {
  const token = params.token;
  const [valid, setValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
    try {
      const res = await fetch(`${API_BASE_URL}/auth/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!valid) return <div className="p-8 text-white">Invalid or expired invite token.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 rounded-lg p-6">
        <h2 className="text-white text-2xl mb-4">Set your password</h2>
        {success ? (
          <div className="text-green-400">Password set! Redirecting to login...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 rounded bg-gray-900 text-white" />
            {error && <div className="text-red-400">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Set password</button>
          </form>
        )}
      </div>
    </div>
  );
}
