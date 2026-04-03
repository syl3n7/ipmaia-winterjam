'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function Page() {
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading | no-jam | no-form

  useEffect(() => {
    async function redirect() {
      try {
        const res = await fetch(`${API}/public/gamejams`);
        if (!res.ok) { setStatus('no-jam'); return; }
        const jams = await res.json();
        const active = jams.find(j => j.is_active);
        if (!active) { setStatus('no-jam'); return; }
        if (!active.registration_url) { setStatus('no-form'); return; }
        router.replace(active.registration_url);
      } catch {
        setStatus('no-jam');
      }
    }
    redirect();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400 animate-pulse">Redirecting…</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">{status === 'no-jam' ? '🎮' : '📝'}</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {status === 'no-jam' ? 'No Active Game Jam' : 'Registration Not Open Yet'}
        </h1>
        <p className="text-gray-400 text-lg">
          {status === 'no-jam'
            ? 'There is no active game jam at the moment. Check back soon!'
            : 'The registration form for the current jam has not been set up yet. Check back soon!'}
        </p>
      </div>
    </div>
  );
}