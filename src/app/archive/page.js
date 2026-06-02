'use client';
export const runtime = 'edge';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLatestArchive } from '../../hooks/useLatestArchive';

export default function ArchiveIndexPage() {
  const router = useRouter();
  const latestArchiveUrl = useLatestArchive();

  useEffect(() => {
    if (latestArchiveUrl !== '/archive') {
      router.replace(latestArchiveUrl);
    }
  }, [router, latestArchiveUrl]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecionando para o arquivo mais recente...</h1>
      </div>
    </div>
  );
}