'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gameJams } from '../../../data/gameJamData';
import { notFound } from 'next/navigation';

// Generate static params for all available years
export function generateStaticParams() {
  return Object.keys(gameJams).map((year) => ({
    year: year,
  }));
}

export default function YearIndexPage({ params }) {
  const router = useRouter();
  const { year } = params;
  
  // Check if the year exists
  if (!gameJams[year]) {
    notFound();
  }
  
  // Get the most recent season for this year
  const seasons = Object.keys(gameJams[year]);
  const latestSeason = seasons[0]; // Assuming seasons are ordered with most recent first
  
  useEffect(() => {
    if (latestSeason) {
      router.replace(`/archive/${year}/${latestSeason}`);
    }
  }, [router, year, latestSeason]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecionando para {latestSeason} {year}...</h1>
      </div>
    </div>
  );
}