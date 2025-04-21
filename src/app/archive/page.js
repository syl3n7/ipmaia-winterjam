'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentGameJam } from '../../data/gameJamData';

export default function ArchiveIndexPage() {
  const router = useRouter();
  const currentJam = getCurrentGameJam();
  
  useEffect(() => {
    if (currentJam) {
      router.replace('/archive/2025/winter'); // Currently hardcoded, can use dynamic path later
    }
  }, [router, currentJam]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecionando para o arquivo mais recente...</h1>
      </div>
    </div>
  );
}