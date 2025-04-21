'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function ArchivePage() {
  const router = useRouter();

  // Redirect to the most recent game jam
  useEffect(() => {
    router.push('/archive/2025/winter');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecionando para o arquivo mais recente...</h1>
        <p className="mb-6">Se não for redirecionado automaticamente, clique abaixo.</p>
        <Link 
          href="/archive/2025/winter"
          className="inline-block bg-orange-500 px-6 py-3 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          WinterJam 2025
        </Link>
      </div>
    </div>
  );
}